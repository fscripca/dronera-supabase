import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    // Get proposals
    if (req.method === "GET" && path === "proposals") {
      const { data, error } = await supabaseClient
        .from("governance_proposals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true, data }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get user votes
    if (req.method === "GET" && path === "votes") {
      const userId = url.searchParams.get("userId");
      
      if (!userId) {
        return new Response(
          JSON.stringify({ success: false, error: "User ID is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const { data, error } = await supabaseClient
        .from("governance_votes")
        .select("*")
        .eq("voter_address", userId);

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true, data }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Cast vote
    if (req.method === "POST" && path === "vote") {
      const { proposalId, voterAddress, voteType, voteWeight } = await req.json();

      // Validate required fields
      if (!proposalId || !voterAddress || !voteType || !voteWeight) {
        return new Response(
          JSON.stringify({ success: false, error: "Missing required fields" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Check if user has already voted
      const { data: existingVote, error: checkError } = await supabaseClient
        .from("governance_votes")
        .select("id")
        .eq("proposal_id", proposalId)
        .eq("voter_address", voterAddress)
        .maybeSingle();

      if (checkError) {
        return new Response(
          JSON.stringify({ success: false, error: checkError.message }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (existingVote) {
        return new Response(
          JSON.stringify({ success: false, error: "User has already voted on this proposal" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Insert vote
      const { data: voteData, error: voteError } = await supabaseClient
        .from("governance_votes")
        .insert({
          proposal_id: proposalId,
          voter_address: voterAddress,
          vote_type: voteType,
          vote_weight: voteWeight,
        })
        .select()
        .single();

      if (voteError) {
        return new Response(
          JSON.stringify({ success: false, error: voteError.message }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Update proposal vote counts
      const { data: proposal, error: proposalError } = await supabaseClient
        .from("governance_proposals")
        .select("votes_for, votes_against, votes_abstain")
        .eq("id", proposalId)
        .single();

      if (proposalError) {
        return new Response(
          JSON.stringify({ success: false, error: proposalError.message }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Calculate new vote counts
      const newVotesFor = voteType === "for" 
        ? proposal.votes_for + voteWeight 
        : proposal.votes_for;
      
      const newVotesAgainst = voteType === "against" 
        ? proposal.votes_against + voteWeight 
        : proposal.votes_against;
      
      const newVotesAbstain = voteType === "abstain" 
        ? proposal.votes_abstain + voteWeight 
        : proposal.votes_abstain;

      // Update proposal
      const { error: updateError } = await supabaseClient
        .from("governance_proposals")
        .update({
          votes_for: newVotesFor,
          votes_against: newVotesAgainst,
          votes_abstain: newVotesAbstain,
          updated_at: new Date().toISOString(),
        })
        .eq("id", proposalId);

      if (updateError) {
        return new Response(
          JSON.stringify({ success: false, error: updateError.message }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: voteData,
          message: "Vote cast successfully" 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create proposal
    if (req.method === "POST" && path === "proposal") {
      const proposalData = await req.json();

      // Validate required fields
      if (!proposalData.title || !proposalData.description || !proposalData.startDate || 
          !proposalData.endDate || !proposalData.category || !proposalData.createdBy) {
        return new Response(
          JSON.stringify({ success: false, error: "Missing required fields" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Insert proposal
      const { data, error } = await supabaseClient
        .from("governance_proposals")
        .insert({
          title: proposalData.title,
          description: proposalData.description,
          status: proposalData.status || "pending",
          start_date: proposalData.startDate,
          end_date: proposalData.endDate,
          votes_for: 0,
          votes_against: 0,
          votes_abstain: 0,
          quorum: proposalData.quorum || 1000000,
          category: proposalData.category,
          created_by: proposalData.createdBy,
          proposed_changes: proposalData.proposedChanges,
          implementation_timeline: proposalData.implementationTimeline,
          expected_impact: proposalData.expectedImpact
        })
        .select()
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true, data }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // If no matching route
    return new Response(
      JSON.stringify({ success: false, error: "Not found" }),
      {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Function error:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});