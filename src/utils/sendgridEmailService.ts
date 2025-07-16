import sgMail from '@sendgrid/mail';

export async function sendEvaluationEmail(evaluationResults: any): Promise<void> {
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

    // Email configuration
    const msg = {
      to: 'andrew.subryan@salemu.edu',
      cc: 'a_subryan@hotmail.com',
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@salemu.edu', // Must be verified in SendGrid
      replyTo: 'andrew.subryan@salemu.edu',
      subject: `Coaching Evaluation Report - ${new Date().toLocaleDateString()}`,
      html: html,
    };

    // Send email
    await sgMail.send(msg);
    console.log('Evaluation email sent successfully via SendGrid');
  } catch (error: any) {
    // Log error but don't throw - we don't want to affect the user experience
    console.error('Failed to send evaluation email:', error);
    if (error.response && error.response.body) {
      console.error('SendGrid error details:', error.response.body);
    }
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
    faqInfo,
  } = results;

  // Convert markdown to HTML (basic conversion)
  const mdToHtml = (text: string) => {
    return text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1, h2, h3 {
          color: #1e40af;
        }
        .section {
          margin-bottom: 30px;
          padding: 20px;
          background: #f3f4f6;
          border-radius: 8px;
        }
        .header {
          background: #1e40af;
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #1e40af;
          color: white;
        }
        .timestamp {
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Salem Coaching System - Evaluation Results</h1>
        <p class="timestamp">Generated: ${new Date().toLocaleString()}</p>
      </div>

      <div class="section">
        <h2>Title</h2>
        <p>${title}</p>
      </div>

      <div class="section">
        <h2>Most Impactful Statement</h2>
        ${mdToHtml(impactfulStatement)}
      </div>

      <div class="section">
        <h2>Interview Scorecard</h2>
        ${mdToHtml(scorecard)}
      </div>

      <div class="section">
        <h2>Talk/Listen Ratio Analysis</h2>
        ${mdToHtml(talkListenRatio)}
      </div>

      <div class="section">
        <h2>Application Invitation Assessment</h2>
        ${mdToHtml(applicationInvitation)}
      </div>

      <div class="section">
        <h2>Weekly Growth Plan</h2>
        ${mdToHtml(growthPlan)}
      </div>

      <div class="section">
        <h2>Coaching Notes</h2>
        ${mdToHtml(coachingNotes)}
      </div>

      <div class="section">
        <h2>Follow-up Email</h2>
        <pre style="background: white; padding: 15px; border-radius: 4px; overflow-x: auto;">
${emailBlast}
        </pre>
      </div>

      ${faqInfo ? `
      <div class="section">
        <h2>FAQ Information</h2>
        <p><strong>Student Name:</strong> ${faqInfo.studentName}</p>
        <p><strong>Program Interest:</strong> ${faqInfo.programInterest}</p>
        <p><strong>Topics Discussed:</strong> ${faqInfo.topicsDiscussed?.join(', ') || 'N/A'}</p>
      </div>
      ` : ''}

      <hr style="margin-top: 40px; border: none; border-top: 1px solid #ddd;">
      <p style="color: #6b7280; font-size: 12px; text-align: center;">
        This email was sent by the Salem University Coaching Evaluation System.<br>
        For questions, please contact andrew.subryan@salemu.edu
      </p>
    </body>
    </html>
  `;
}