import nodemailer from 'nodemailer';

interface EmailConfig {
  to: string;
  cc?: string;
  subject: string;
  html: string;
}

export async function sendEvaluationEmail(evaluationResults: any): Promise<void> {
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

function formatEvaluationEmail(results: any): string {
  const {
    title,
    impactfulStatement,
    scorecard,
    talkListenRatio,
    applicationInvitation,
    growthPlan,
    coachingNotes,
    emailBlast,
  } = results;

  // Simple text formatting - convert markdown basics to plain HTML
  const formatText = (text: string) => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^[•\-\*]\s+(.+)$/gm, '• $1')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          font-size: 16px;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          font-size: 24px;
          font-weight: bold;
          margin: 0 0 20px 0;
          text-transform: uppercase;
        }
        h2 {
          font-size: 18px;
          font-weight: bold;
          margin: 30px 0 10px 0;
          text-transform: uppercase;
        }
        p {
          margin: 0 0 15px 0;
        }
        strong {
          font-weight: 600;
        }
        .timestamp {
          color: #666;
          font-size: 14px;
          margin-bottom: 30px;
        }
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 14px;
          color: #666;
        }
        pre {
          font-family: inherit;
          white-space: pre-wrap;
          margin: 0;
        }
      </style>
    </head>
    <body>
      <h1>Coaching Evaluation Results</h1>
      <p class="timestamp">Generated: ${new Date().toLocaleString()}</p>

      <h2>Title</h2>
      <p>${title}</p>

      <h2>Most Impactful Statement</h2>
      <p>${formatText(impactfulStatement)}</p>

      <h2>Interview Scorecard</h2>
      <p>${formatText(scorecard)}</p>

      <h2>Talk/Listen Ratio Analysis</h2>
      <p>${formatText(talkListenRatio)}</p>

      <h2>Application Invitation Assessment</h2>
      <p>${formatText(applicationInvitation)}</p>

      <h2>Weekly Growth Plan</h2>
      <p>${formatText(growthPlan)}</p>

      <h2>Coaching Notes</h2>
      <p>${formatText(coachingNotes)}</p>

      <h2>Follow-up Email Template</h2>
      <pre>${emailBlast}</pre>

      <div class="footer">
        Salem University Coaching Evaluation System<br>
        For questions, please contact andrew.subryan@salemu.edu
      </div>
    </body>
    </html>
  `;
}