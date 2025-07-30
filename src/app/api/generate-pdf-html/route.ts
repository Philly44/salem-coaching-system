import { NextRequest, NextResponse } from 'next/server';
import { EvaluationResult, PDFGenerationRequest } from '@/types/evaluation';

export async function POST(request: NextRequest) {
  try {
    const { results, transcript }: PDFGenerationRequest = await request.json();
    
    if (!results || !Array.isArray(results)) {
      return NextResponse.json(
        { error: 'Invalid results data' },
        { status: 400 }
      );
    }

    // Generate HTML content
    const htmlContent = generateHTMLContent(results, transcript);
    
    // Return HTML that can be printed as PDF by the browser
    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': 'inline; filename=evaluation-results.html',
      },
    });
  } catch (error) {
    console.error('HTML generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to generate HTML',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

function generateHTMLContent(results: EvaluationResult[], transcript: string): string {
  // Extract key results
  const titleResult = results.find(r => r?.category === 'Title');
  const titleContent = titleResult?.content.replace(/\*\*/g, '') || '';
  
  // Start building HTML with embedded styles and print CSS
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Salem Coaching System - Evaluation Results</title>
  <style>
    @media print {
      @page {
        margin: 0.75in;
        size: letter;
      }
      body {
        margin: 0;
        padding: 0;
        background: white !important;
      }
      .no-print {
        display: none !important;
      }
      .card {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      h1, h2, h3 {
        page-break-after: avoid;
        break-after: avoid;
      }
      p {
        orphans: 3;
        widows: 3;
      }
      .progress-bar {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
    
    @media screen {
      body {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }
      .print-button {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4F46E5;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        z-index: 1000;
      }
      .print-button:hover {
        background: #4338CA;
      }
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
    }
    
    .title {
      text-align: center;
      margin-bottom: 32px;
    }
    
    .title h1 {
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
    }
    
    .card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .card-header {
      margin-bottom: 16px;
    }
    
    .card-title {
      font-size: 20px;
      font-weight: bold;
      color: #111827;
    }
    
    .card-content {
      color: #374151;
      line-height: 1.75;
    }
    
    .card-content p {
      margin-bottom: 16px;
    }
    
    .card-content ul {
      list-style-type: disc;
      padding-left: 20px;
      margin-bottom: 16px;
    }
    
    .card-content li {
      margin-bottom: 8px;
    }
    
    /* Special card styles */
    .card-green {
      background-color: #d1fae5;
    }
    
    .card-amber {
      background-color: #fef3c7;
    }
    
    .great-moment-quote {
      background: white;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #fcd34d;
      margin-bottom: 16px;
    }
    
    .great-moment-quote p {
      font-style: italic;
      font-size: 18px;
      line-height: 1.5;
      color: #1f2937;
      margin: 0;
    }
    
    /* Progress bar for enrollment potential */
    .progress-container {
      margin-bottom: 24px;
    }
    
    .progress-label {
      font-size: 24px;
      font-weight: bold;
      color: #111827;
      margin-bottom: 12px;
    }
    
    .progress-bar {
      width: 100%;
      height: 32px;
      background: linear-gradient(to right, #ef4444, #eab308, #22c55e);
      border-radius: 16px;
      position: relative;
      overflow: hidden;
    }
    
    .progress-indicator {
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 24px;
      height: 24px;
      background: white;
      border: 2px solid #1f2937;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    /* Table styles */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    
    th {
      text-align: left;
      padding: 8px 12px;
      background-color: #f9fafb;
      font-weight: 600;
      border-bottom: 1px solid #e5e7eb;
    }
    
    td {
      padding: 8px 12px;
      border-bottom: 1px solid #e5e7eb;
    }
  </style>
  <script>
    function printPage() {
      window.print();
    }
  </script>
</head>
<body>
  <button class="print-button no-print" onclick="printPage()">Download as PDF</button>
`;

  // Add title if present
  if (titleContent) {
    html += `
  <div class="title">
    <h1>${escapeHtml(titleContent)}</h1>
  </div>
`;
  }

  // Process each result
  results.forEach(result => {
    if (!result || result.category === 'Title') return;
    
    const content = removeDuplicateHeading(result.content, result.category);
    
    // Handle special card types
    if (result.category === 'Email After Interview, Same Day') {
      html += generateEmailCard(result, content);
    } else if (isImpactfulStatement(result.category)) {
      html += generateGreatMomentCard(result, content);
    } else if (result.category === 'Enrollment Potential') {
      html += generateEnrollmentCard(result, content);
    } else if (result.category === 'Interview Scorecard') {
      html += generateScorecardCard(result, content);
    } else {
      html += generateStandardCard(result, content);
    }
  });

  html += `
</body>
</html>
`;

  return html;
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function removeDuplicateHeading(content: string, category: string): string {
  const escapedCategory = category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    new RegExp(`^#\\s+${escapedCategory}\\s*\\n`, 'i'),
    new RegExp(`^##\\s+${escapedCategory}\\s*\\n`, 'i'),
    new RegExp(`^###\\s+${escapedCategory}\\s*\\n`, 'i'),
  ];
  
  let cleanedContent = content.trim();
  
  const aiPreamblePatterns = [
    /^Here are \d+ paragraphs? of[^:]+:\s*\n*/i,
    /^Here (?:are|is)[^:]+:\s*\n*/i,
  ];
  
  for (const pattern of aiPreamblePatterns) {
    cleanedContent = cleanedContent.replace(pattern, '');
  }
  
  for (const pattern of patterns) {
    if (pattern.test(cleanedContent)) {
      cleanedContent = cleanedContent.replace(pattern, '');
      break;
    }
  }
  
  return cleanedContent;
}

function isImpactfulStatement(category: string): boolean {
  return category.includes('"') || 
    category.includes('That ') || 
    category.includes('When ') ||
    category.includes('The Moment') ||
    category.includes('The Exchange') ||
    category.includes('The Part');
}

function generateStandardCard(result: EvaluationResult, content: string): string {
  return `
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">${escapeHtml(result.category)}</h2>
    </div>
    <div class="card-content">
      ${convertMarkdownToHtml(content)}
    </div>
  </div>
`;
}

function generateEmailCard(result: EvaluationResult, content: string): string {
  const subjectMatch = content.match(/Subject:\s*(.+?)(?:\n|$)/i);
  const bodyMatch = content.match(/(?:Subject:.+?\n\n?)([\s\S]+)/i);
  
  let emailHtml = `
  <div class="card card-green">
    <div class="card-header">
      <h2 class="card-title">Momentum Email</h2>
    </div>
    <div class="card-content">
`;
  
  if (subjectMatch && bodyMatch) {
    emailHtml += `
      <p><strong>Subject:</strong> ${escapeHtml(subjectMatch[1])}</p>
      <hr style="margin: 16px 0; border: none; border-top: 1px solid #e5e7eb;">
      ${convertMarkdownToHtml(bodyMatch[1].trim())}
`;
  } else {
    emailHtml += convertMarkdownToHtml(content);
  }
  
  emailHtml += `
    </div>
  </div>
`;
  
  return emailHtml;
}

function generateGreatMomentCard(result: EvaluationResult, content: string): string {
  // Remove any "Great Moment" heading
  let processedContent = content.replace(/^##\s*Great Moment\s*\n/gm, '');
  
  // Find the quote line (with 💫 and quotes)
  const lines = processedContent.split('\n');
  const quoteIndex = lines.findIndex(line => line.includes('💫') && line.includes('"'));
  
  let quoteLine = '';
  let explanationContent = '';
  
  if (quoteIndex >= 0) {
    quoteLine = lines[quoteIndex];
    // Get all content after the quote
    if (quoteIndex < lines.length - 1) {
      explanationContent = lines.slice(quoteIndex + 1).join('\n').trim();
    }
  } else {
    // If no quote found, use all content
    explanationContent = processedContent.trim();
  }
  
  let html = `
  <div class="card card-amber">
    <div class="card-header">
      <h2 class="card-title">${escapeHtml(result.category)}</h2>
    </div>
    <div class="card-content">`;
  
  if (quoteLine) {
    html += `
      <div class="great-moment-quote">
        <p>${escapeHtml(quoteLine)}</p>
      </div>`;
  }
  
  if (explanationContent) {
    html += convertMarkdownToHtml(explanationContent);
  }
  
  html += `
    </div>
  </div>`;
  
  return html;
}

function generateEnrollmentCard(result: EvaluationResult, content: string): string {
  const likelihoodMatch = content.match(/LIKELIHOOD:\s*(VERY_LOW|LOW|MODERATE|HIGH|VERY_HIGH)/);
  const actionMatch = content.match(/ACTION:\s*([\s\S]+?)$/m);
  
  const likelihoodCategory = likelihoodMatch ? likelihoodMatch[1] : 'MODERATE';
  const action = actionMatch ? actionMatch[1].trim() : '';
  
  const likelihoodMap: { [key: string]: { position: number; label: string } } = {
    VERY_LOW: { position: 10, label: 'Very Low' },
    LOW: { position: 30, label: 'Low' },
    MODERATE: { position: 50, label: 'Moderate' },
    HIGH: { position: 70, label: 'High' },
    VERY_HIGH: { position: 90, label: 'Very High' }
  };
  
  const currentLevel = likelihoodMap[likelihoodCategory] || likelihoodMap.MODERATE;
  
  return `
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">What are the chances of enrollment?</h2>
    </div>
    <div class="card-content">
      <div class="progress-container">
        <div class="progress-label">${currentLevel.label} Potential</div>
        <div class="progress-bar">
          <div class="progress-indicator" style="left: ${currentLevel.position}%;">
          </div>
        </div>
      </div>
      ${action ? `
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
        <p><span style="margin-right: 8px;">💡</span><strong>Next Best Action:</strong></p>
        <p style="margin-left: 24px;">${escapeHtml(action)}</p>
      </div>
      ` : ''}
    </div>
  </div>
`;
}

function generateScorecardCard(result: EvaluationResult, content: string): string {
  return `
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">Interview Scorecard</h2>
    </div>
    <div class="card-content">
      ${convertMarkdownToHtml(content)}
    </div>
  </div>
`;
}

function convertMarkdownToHtml(markdown: string): string {
  let html = escapeHtml(markdown);
  
  // Convert headers first
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  
  // Convert bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Convert italic (but not list items)
  html = html.replace(/(?<!\*)(\*(?!\*))(.+?)\1/g, '<em>$2</em>');
  
  // Convert bullet lists
  const bulletListRegex = /((?:^\* .+$\n?)+)/gm;
  html = html.replace(bulletListRegex, (match) => {
    const items = match.trim().split('\n').map(item => 
      `<li>${item.replace(/^\* /, '')}</li>`
    ).join('\n');
    return `<ul>\n${items}\n</ul>`;
  });
  
  // Convert numbered lists
  const numberedListRegex = /((?:^\d+\. .+$\n?)+)/gm;
  html = html.replace(numberedListRegex, (match) => {
    const items = match.trim().split('\n').map(item => 
      `<li>${item.replace(/^\d+\. /, '')}</li>`
    ).join('\n');
    return `<ol>\n${items}\n</ol>`;
  });
  
  // Convert paragraphs - split by double newlines
  const paragraphs = html.split(/\n\n+/);
  html = paragraphs.map(paragraph => {
    paragraph = paragraph.trim();
    // Don't wrap if already has HTML tags
    if (paragraph && !paragraph.match(/^<(?:h[1-6]|ul|ol|li|p|div)/)) {
      // Replace single newlines with <br> within paragraphs
      paragraph = paragraph.replace(/\n/g, '<br>');
      return `<p>${paragraph}</p>`;
    }
    return paragraph;
  }).filter(p => p).join('\n\n');
  
  return html;
}