import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    console.log("Received payload:", body);

    // 👉 Example: extract amount and user_id
    const { amount, user_id } = body;

    if (!amount || !user_id) {
      return new Response(
        JSON.stringify({ error: "Missing amount or user_id" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 👉 Here you can integrate Stripe or other logic

    // ✅ Return success response
    return new Response(
      JSON.stringify({
        message: "Payment intent received",
        amount,
        user_id,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Handler error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
