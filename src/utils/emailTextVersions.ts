export function generatePlainTextEmail(formattedEmail: string): string {
  // Extract subject line
  const subjectMatch = formattedEmail.match(/Subject:\s*(.+?)(\n|$)/i);
  const subject = subjectMatch ? subjectMatch[1] : '';
  
  // Extract body content after subject
  const bodyMatch = formattedEmail.match(/Subject:.+?\n+(.+)/is);
  const body = bodyMatch ? bodyMatch[1] : formattedEmail;
  
  // Convert formatted text to plain
  let plainText = body
    // Remove markdown bold
    .replace(/\*\*(.+?)\*\*/g, '$1')
    // Convert bullet points
    .replace(/^[•·◦▪▫◆]/gm, '-')
    // Remove italic markers
    .replace(/\*(.+?)\*/g, '$1')
    // Clean up extra spaces
    .replace(/\s+/g, ' ')
    // Restore paragraph breaks
    .replace(/\.\s+/g, '.\n\n')
    // Remove any HTML if present
    .replace(/<[^>]*>/g, '')
    // Trim lines
    .split('\n').map(line => line.trim()).join('\n');
  
  // Add mobile-friendly formatting
  const mobileFriendly = `Subject: ${subject}

${plainText}

--
Apply now: https://www.salemu.edu/apply-now/
Text SALEM to 55555 for quick help`;

  return mobileFriendly;
}

