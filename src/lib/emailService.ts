import { supabase } from './supabase';

/**
 * Interface for email data
 */
export interface EmailData {
  to?: string;
  subject: string;
  message: string;
  name?: string;
  email?: string;
  replyTo?: string;
}

/**
 * Interface for support request data
 */
export interface SupportRequestData {
  userEmail: string;
  subject: string;
  message: string;
  priority?: 'low' | 'medium' | 'high';
}

/**
 * Service for sending emails through the Supabase Edge Function
 */
class EmailService {
  private static instance: EmailService;

  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Send an email using the Supabase Edge Function
   * @param emailData The email data to send
   * @returns Promise with the result of the email sending operation
   */
  public async sendEmail(emailData: EmailData): Promise<any> {
    try {
      // Validate required fields
      if (!emailData.subject || !emailData.message) {
        throw new Error('Subject and message are required');
      }

      // Call the local API endpoint
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }
      
      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  /**
   * Send a support email
   * @param name Sender's name
   * @param email Sender's email
   * @param subject Email subject
   * @param message Email message
   * @returns Promise with the result of the email sending operation
   */
  public async sendSupportEmail(
    name: string,
    email: string,
    subject: string,
    message: string
  ): Promise<any> {
    return this.sendEmail({
      subject,
      message,
      name,
      email,
      replyTo: email
    });
  }

  /**
   * Send a support request from the contact form
   * @param data Support request data
   * @returns Promise with the result of the email sending operation
   */
  public async sendSupportRequest(data: SupportRequestData): Promise<any> {
    const { userEmail, subject, message, priority = 'medium' } = data;
    
    try {
      // Call the local API endpoint
      const response = await fetch('/api/support-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
          subject,
          message,
          priority
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send support request');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to send support request:', error);
      throw error;
    }
  }

  /**
   * Send a notification email to a user
   * @param to Recipient email
   * @param subject Email subject
   * @param message Email message
   * @returns Promise with the result of the email sending operation
   */
  public async sendNotification(
    to: string,
    subject: string,
    message: string
  ): Promise<any> {
    return this.sendEmail({
      to,
      subject,
      message,
    });
  }
}

export const emailService = EmailService.getInstance();