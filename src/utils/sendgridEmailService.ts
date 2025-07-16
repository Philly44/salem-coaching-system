import sgMail from '@sendgrid/mail';
import { formatEvaluationEmail, createPlainTextEmail } from './formatEmail';
import { EvaluationResults, SendGridMessage } from '@/types/evaluation';

export async function sendEvaluationEmail(evaluationResults: EvaluationResults): Promise<void> {
  try {
    // Check if email is enabled
    if (process.env.EMAIL_ENABLED !== 'true') {
      console.log('Email notifications disabled');
      return;
    }

    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY) {
      console.log('SendGrid API key not configured');
      return;
    }

    // Set API key
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Format evaluation results into HTML
    const html = formatEvaluationEmail(evaluationResults);
    console.log('Email HTML length:', html.length, 'characters');

    // Create plain text version
    const text = createPlainTextEmail(evaluationResults);

    // Email configuration
    const msg: SendGridMessage = {
      to: 'andrew.subryan@salemu.edu',
      cc: 'a_subryan@hotmail.com',
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'andrew.subryan@salemu.edu',
        name: 'Salem Coaching System'
      },
      replyTo: 'andrew.subryan@salemu.edu',
      subject: `Coaching Evaluation Report - ${new Date().toLocaleDateString()}`,
      text: text,
      html: html,
    };

    // Send email
    console.log('Attempting to send email to:', msg.to);
    console.log('From:', msg.from);
    const response = await sgMail.send(msg);
    console.log('SendGrid response:', response[0].statusCode);
    console.log('Email ID:', response[0].headers['x-message-id']);
    console.log('Evaluation email sent successfully via SendGrid');
  } catch (error: any) {
    // Log error but don't throw - we don't want to affect the user experience
    console.error('Failed to send evaluation email:', error);
    if (error.response && error.response.body) {
      console.error('SendGrid error details:', error.response.body);
    }
  }
}