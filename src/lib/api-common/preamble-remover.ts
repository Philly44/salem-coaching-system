export function removePreamble(text: string): string {
  // Common preamble patterns to remove
  const preamblePatterns = [
    /^I'll\s+evaluate.*?\n+/i,
    /^I\s+will\s+evaluate.*?\n+/i,
    /^Let\s+me\s+evaluate.*?\n+/i,
    /^I'm\s+going\s+to.*?\n+/i,
    /^I\s+need\s+to.*?\n+/i,
    /^First,?\s+I'll.*?\n+/i,
    /^To\s+evaluate.*?\n+/i,
    /^Based\s+on.*?\n+/i,
    /^After\s+reviewing.*?\n+/i,
    /^Looking\s+at.*?\n+/i,
    /^I've\s+analyzed.*?\n+/i,
    /^I\s+have\s+analyzed.*?\n+/i,
    /^Here's\s+my\s+evaluation.*?\n+/i,
    /^Here\s+is\s+my\s+evaluation.*?\n+/i,
    /^Following\s+the.*?\n+/i,
    /^Using\s+the.*?\n+/i,
    /^Applying\s+the.*?\n+/i,
    /^According\s+to.*?\n+/i,
    /^Per\s+the.*?\n+/i,
    /^I'll\s+create.*?\n+/i,
    /^I\s+will\s+create.*?\n+/i,
    /^Let\s+me\s+create.*?\n+/i,
    /^Creating.*?\n+/i,
    /^Now\s+I'll.*?\n+/i,
    /^Now\s+let\s+me.*?\n+/i,
    /^I'll\s+analyze.*?\n+/i,
    /^I\s+will\s+analyze.*?\n+/i,
    /^Analyzing.*?\n+/i,
    /^I'll\s+assess.*?\n+/i,
    /^I\s+will\s+assess.*?\n+/i,
    /^Assessing.*?\n+/i,
    /^Thank\s+you\s+for.*?\n+/i,
    /^I\s+understand.*?\n+/i,
    /^Sure,?\s+I'll.*?\n+/i,
    /^Of\s+course,?\s+I'll.*?\n+/i,
    /^I'd\s+be\s+happy\s+to.*?\n+/i,
    /^.*?scoring\s+protocol.*?\.\s*\n+/i,
    /^.*?evaluation\s+criteria.*?\.\s*\n+/i,
    /^.*?detailed\s+scorecard.*?\.\s*\n+/i,
    // Email-specific patterns
    /^.*?write.*?email.*?\.\s*\n+/i,
    /^.*?craft.*?follow-up.*?\.\s*\n+/i,
    /^.*?create.*?personalized.*?\.\s*\n+/i,
    /^Writing\s+as\s+the\s+advisor.*?\n+/i,
    /^Following\s+the\s+instructions.*?\n+/i,
    /^Based\s+on\s+the\s+transcript.*?\n+/i,
    /^Here's\s+the\s+email.*?\n+/i,
    /^Here\s+is\s+the\s+email.*?\n+/i,
    /^I've\s+written.*?\n+/i,
    /^I\s+have\s+written.*?\n+/i,
    /^The\s+email\s+is.*?\n+/i,
    /^This\s+email.*?\n+/i,
  ];
  
  let cleanedText = text.trim();
  
  // Remove any matching preamble patterns
  for (const pattern of preamblePatterns) {
    cleanedText = cleanedText.replace(pattern, '');
  }
  
  // Also remove any sentences before the first heading or expected content
  // For scorecard, it should start with "# Interview Scorecard"
  if (cleanedText.includes('# Interview Scorecard')) {
    const scorecardStart = cleanedText.indexOf('# Interview Scorecard');
    if (scorecardStart > 0) {
      cleanedText = cleanedText.substring(scorecardStart);
    }
  }
  
  // For other sections, check for their expected starts
  const expectedStarts = [
    'Subject:',  // Email subject line - MUST BE FIRST
    '# Title:',
    '**Title:**',
    '# Most Impactful Statement',
    '**Most Impactful Statement**',
    '# Talk/Listen Ratio Analysis',
    '**Talk/Listen Ratio',
    '# Application Invitation Assessment',
    '**Application Invitation',
    '# Weekly Growth Plan',
    '**Weekly Growth Plan',
    '# Coaching Notes',
    '**Coaching Notes',
    '## ',
    '### ',
    '| Section',
    '**Section',
  ];
  
  for (const start of expectedStarts) {
    if (cleanedText.includes(start)) {
      const contentStart = cleanedText.indexOf(start);
      if (contentStart > 0 && contentStart < 200) { // Only trim if preamble is reasonably short
        cleanedText = cleanedText.substring(contentStart);
        break;
      }
    }
  }
  
  return cleanedText.trim();
}