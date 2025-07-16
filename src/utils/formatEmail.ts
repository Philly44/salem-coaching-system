/**
 * Shared email formatter for evaluation results
 * Used by both SendGrid and SMTP email services
 */

import { EvaluationResults } from '@/types/evaluation';

export function formatEvaluationEmail(results: EvaluationResults): string {
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

/**
 * Create plain text version of evaluation results
 */
export function createPlainTextEmail(results: EvaluationResults): string {
  return results.title + '\n\n' +
    Object.entries(results).map(([key, value]) => 
      `${key.toUpperCase()}\n${value}\n\n`
    ).join('');
}