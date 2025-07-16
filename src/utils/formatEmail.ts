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

  // Get current date and time
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  });
  const timeStr = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });

  // Extract advisor/student info from title if available
  // Default values if not extracted from transcript
  const advisor = "Coaching System";
  const student = title || "Student";
  const program = "General Studies";
  const callLength = "N/A";
  const evaluatedOn = dateStr;

  // Simple HTML email with plain text styling
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: 'Courier New', monospace;
          font-size: 14px;
          line-height: 1.6;
          color: #000;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #fff;
        }
        h1 {
          font-size: 18px;
          font-weight: bold;
          margin: 0 0 10px 0;
        }
        h2 {
          font-size: 16px;
          font-weight: bold;
          margin: 20px 0 10px 0;
        }
        p {
          margin: 0 0 10px 0;
        }
        strong {
          font-weight: bold;
        }
        pre {
          font-family: 'Courier New', monospace;
          white-space: pre-wrap;
          margin: 0;
        }
        .metadata {
          margin-bottom: 20px;
          font-size: 13px;
        }
      </style>
    </head>
    <body>
      <pre>
# COACHING EVALUATION RESULTS

Generated: ${dateStr}, ${timeStr}

Advisor: ${advisor} | Student: ${student} | Program: ${program} | Call Length: ${callLength} | Evaluated On: ${evaluatedOn}

## MOST IMPACTFUL STATEMENT

${impactfulStatement}

## INTERVIEW SCORECARD

${scorecard}

## APPLICATION INVITATION ASSESSMENT

${applicationInvitation}

## WEEKLY GROWTH PLAN

${growthPlan}

## COACHING NOTES

${coachingNotes}

## FOLLOW-UP EMAIL TEMPLATE

${emailBlast}
      </pre>
    </body>
    </html>
  `;
}

/**
 * Create plain text version of evaluation results
 */
export function createPlainTextEmail(results: EvaluationResults): string {
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

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  });
  const timeStr = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });

  return `# COACHING EVALUATION RESULTS

Generated: ${dateStr}, ${timeStr}

Advisor: Coaching System | Student: ${title || "Student"} | Program: General Studies | Call Length: N/A | Evaluated On: ${dateStr}

## MOST IMPACTFUL STATEMENT

${impactfulStatement}

## INTERVIEW SCORECARD

${scorecard}

## APPLICATION INVITATION ASSESSMENT

${applicationInvitation}

## WEEKLY GROWTH PLAN

${growthPlan}

## COACHING NOTES

${coachingNotes}

## FOLLOW-UP EMAIL TEMPLATE

${emailBlast}`;
}