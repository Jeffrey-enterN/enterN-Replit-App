import { MailService } from '@sendgrid/mail';

// Create a mail service instance
const mailService = new MailService();

// Email service to send emails using SendGrid
export interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

// SendGrid specific email interface with required properties
interface SendGridEmailParams {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
}

/**
 * Initialize the SendGrid mail service with the API key
 * Should be called once when the server starts
 */
export function initEmailService() {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SENDGRID_API_KEY environment variable is not set. Email sending will be simulated.');
    return;
  }
  
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * Send an email using SendGrid
 * Falls back to console logging if SendGrid is not configured
 */
export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    // Check if SendGrid API key is set
    if (!process.env.SENDGRID_API_KEY) {
      // Simulate sending email in development
      console.log('SIMULATING EMAIL SEND (SendGrid API key not configured):');
      console.log(`To: ${params.to}`);
      console.log(`From: ${params.from}`);
      console.log(`Subject: ${params.subject}`);
      console.log(`Body: ${params.text || params.html}`);
      return true;
    }

    // Actually send the email with SendGrid
    const msg: SendGridEmailParams = {
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text || '',
      html: params.html || '',
    };
    
    await mailService.send(msg);
    
    console.log(`Email sent to ${params.to} with subject "${params.subject}"`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}