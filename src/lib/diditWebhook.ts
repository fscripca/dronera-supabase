import { supabase } from './supabase';

// Webhook handler for Didit API callbacks
export interface DiditWebhookPayload {
  sessionId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  event: 'session_started' | 'document_uploaded' | 'verification_completed' | 'session_expired';
  timestamp: string;
  data: {
    documents?: Array<{
      id: string;
      type: string;
      status: 'verified' | 'rejected' | 'pending';
      confidence: number;
      extractedData?: any;
    }>;
    biometrics?: {
      faceMatch: { confidence: number; verified: boolean };
      livenessCheck: { score: number; passed: boolean };
    };
    complianceChecks?: {
      amlScreening: { passed: boolean; riskLevel: string; matches: any[] };
      sanctionsCheck: { passed: boolean; matches: any[] };
      pepCheck: { passed: boolean; matches: any[] };
    };
    riskScore?: number;
    extractedPersonalInfo?: {
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      nationality: string;
      documentNumber: string;
    };
    extractedAddress?: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
}

export class DiditWebhookHandler {
  // Verify webhook signature for security
  static verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // In production, implement proper HMAC verification
    // For demo purposes, we'll skip signature verification
    return true;
  }

  // Process incoming webhook
  static async processWebhook(payload: DiditWebhookPayload): Promise<void> {
    try {
      // Log the webhook receipt
      await supabase.rpc('log_didit_api_call', {
        p_action: 'WEBHOOK_RECEIVED',
        p_description: `Webhook received for session ${payload.sessionId}`,
        p_metadata: payload,
        p_session_id: payload.sessionId
      });

      // Process based on event type
      switch (payload.event) {
        case 'session_started':
          await this.handleSessionStarted(payload);
          break;
        case 'document_uploaded':
          await this.handleDocumentUploaded(payload);
          break;
        case 'verification_completed':
          await this.handleVerificationCompleted(payload);
          break;
        case 'session_expired':
          await this.handleSessionExpired(payload);
          break;
        default:
          console.warn(`Unknown webhook event: ${payload.event}`);
      }

      // Update session status
      await this.updateSessionStatus(payload);

    } catch (error) {
      console.error('Error processing Didit webhook:', error);
      
      // Log the error
      await supabase.rpc('log_didit_api_call', {
        p_action: 'WEBHOOK_ERROR',
        p_description: `Error processing webhook: ${error.message}`,
        p_metadata: { error: error.message, payload },
        p_session_id: payload.sessionId
      });
      
      throw error;
    }
  }

  private static async handleSessionStarted(payload: DiditWebhookPayload): Promise<void> {
    // Update session status to in_progress
    await supabase
      .from('didit_sessions')
      .update({
        status: 'in_progress',
        updated_at: new Date().toISOString()
      })
      .eq('session_id', payload.sessionId);
  }

  private static async handleDocumentUploaded(payload: DiditWebhookPayload): Promise<void> {
    if (payload.data.documents) {
      // Store document information
      for (const doc of payload.data.documents) {
        await supabase
          .from('didit_documents')
          .upsert({
            session_id: payload.sessionId,
            document_id: doc.id,
            document_type: doc.type,
            status: doc.status,
            confidence_score: doc.confidence,
            verification_data: doc.extractedData || {},
            uploaded_at: payload.timestamp,
            verified_at: doc.status === 'verified' ? payload.timestamp : null
          });
      }
    }
  }

  private static async handleVerificationCompleted(payload: DiditWebhookPayload): Promise<void> {
    // Store biometric results
    if (payload.data.biometrics) {
      await supabase
        .from('didit_biometrics')
        .upsert({
          session_id: payload.sessionId,
          face_match_confidence: payload.data.biometrics.faceMatch.confidence,
          face_match_verified: payload.data.biometrics.faceMatch.verified,
          liveness_score: payload.data.biometrics.livenessCheck.score,
          liveness_passed: payload.data.biometrics.livenessCheck.passed,
          biometric_data: payload.data.biometrics
        });
    }

    // Update main KYC record with final results
    const finalStatus = this.determineFinalStatus(payload);
    
    await supabase
      .from('kyc_verifications')
      .update({
        status: finalStatus,
        risk_score: payload.data.riskScore,
        compliance_data: payload.data.complianceChecks || {},
        extracted_data: {
          personalInfo: payload.data.extractedPersonalInfo,
          address: payload.data.extractedAddress
        },
        verification_data: payload.data,
        updated_at: new Date().toISOString()
      })
      .eq('didit_session_id', payload.sessionId);

    // Send notification to admin dashboard
    await this.notifyAdminDashboard(payload.sessionId, finalStatus);
  }

  private static async handleSessionExpired(payload: DiditWebhookPayload): Promise<void> {
    // Mark session as expired
    await supabase
      .from('didit_sessions')
      .update({
        status: 'expired',
        updated_at: new Date().toISOString()
      })
      .eq('session_id', payload.sessionId);

    // Update KYC record
    await supabase
      .from('kyc_verifications')
      .update({
        status: 'declined',
        verification_data: { reason: 'Session expired' },
        updated_at: new Date().toISOString()
      })
      .eq('didit_session_id', payload.sessionId);
  }

  private static async updateSessionStatus(payload: DiditWebhookPayload): Promise<void> {
    await supabase.rpc('update_didit_session_status', {
      p_session_id: payload.sessionId,
      p_status: payload.status,
      p_verification_data: payload.data
    });
  }

  private static determineFinalStatus(payload: DiditWebhookPayload): 'approved' | 'declined' | 'pending' {
    const { data } = payload;
    
    // Check if all required verifications passed
    const documentsVerified = data.documents?.every(doc => doc.status === 'verified') ?? false;
    const biometricsVerified = data.biometrics?.faceMatch.verified && data.biometrics?.livenessCheck.passed;
    const compliancePassed = data.complianceChecks?.amlScreening.passed && 
                            data.complianceChecks?.sanctionsCheck.passed && 
                            data.complianceChecks?.pepCheck.passed;
    const riskScoreAcceptable = (data.riskScore ?? 0) >= 70; // Minimum 70% confidence

    if (documentsVerified && biometricsVerified && compliancePassed && riskScoreAcceptable) {
      return 'approved';
    } else if (payload.status === 'completed') {
      return 'declined';
    } else {
      return 'pending';
    }
  }

  private static async notifyAdminDashboard(sessionId: string, status: string): Promise<void> {
    // In a real implementation, this would send a WebSocket message or push notification
    // to the admin dashboard for real-time updates
    console.log(`KYC verification completed for session ${sessionId}: ${status}`);
    
    // Could also trigger email notifications here
    if (status === 'declined') {
      // Send notification to compliance team
      console.log(`High-priority: KYC declined for session ${sessionId}`);
    }
  }
}

// Real-time webhook endpoint handler (for use in Supabase Edge Functions)
export const handleDiditWebhook = async (request: Request): Promise<Response> => {
  try {
    // Verify request method
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Get webhook payload
    const payload: DiditWebhookPayload = await request.json();
    
    // Verify webhook signature (in production)
    const signature = request.headers.get('X-Didit-Signature');
    const webhookSecret = Deno.env.get('DIDIT_WEBHOOK_SECRET');
    
    if (webhookSecret && signature) {
      const isValid = DiditWebhookHandler.verifyWebhookSignature(
        JSON.stringify(payload),
        signature,
        webhookSecret
      );
      
      if (!isValid) {
        return new Response('Invalid signature', { status: 401 });
      }
    }

    // Process the webhook
    await DiditWebhookHandler.processWebhook(payload);

    return new Response('Webhook processed successfully', { status: 200 });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};