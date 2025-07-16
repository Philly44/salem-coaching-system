import nodemailer from 'nodemailer';
import { formatEvaluationEmail } from './formatEmail';
import { EvaluationResults, EmailConfig } from '@/types/evaluation';

export async function sendEvaluationEmail(evaluationResults: EvaluationResults): Promise<void> {
  try {
    // Check if email is enabled
    if (process.env.EMAIL_ENABLED !== 'true') {
      console.log('Email notifications disabled');
      return;
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.office365.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        ciphers: 'SSLv3',
      },
    });

    // Format evaluation results into HTML
    const html = formatEvaluationEmail(evaluationResults);

    // Email configuration with fixed recipient
    const mailOptions: EmailConfig = {
      to: 'andrew.subryan@salemu.edu',
      cc: 'andrew.subryan@salemu.edu',
      subject: `Salem Coaching Evaluation - ${new Date().toLocaleString()}`,
      html,
    };

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_USER || 'noreply@salemu.edu',
      ...mailOptions,
    });

    console.log('Evaluation email sent successfully');
  } catch (error) {
    // Log error but don't throw - we don't want to affect the user experience
    console.error('Failed to send evaluation email:', error);
  }
}