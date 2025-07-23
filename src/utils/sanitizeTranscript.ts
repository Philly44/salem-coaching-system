/**
 * Sanitization utilities for transcript processing
 * Reduces PII exposure while maintaining conversational context
 */

/**
 * Replace full last names with initials for FERPA compliance
 * Examples:
 * - "John Smith" -> "John S."
 * - "Mary Johnson-Lee" -> "Mary J.-L."
 * - "Dr. Robert Williams Jr." -> "Dr. Robert W. Jr."
 */
export function sanitizeTranscript(transcript: string): string {
  if (!transcript) return '';

  let sanitized = transcript;

  // Pattern 1: Handle formal titles (Dr., Mr., Mrs., Ms., Prof., etc.)
  sanitized = sanitized.replace(
    /\b((?:Dr|Mr|Mrs|Ms|Miss|Prof|Professor)\.?\s+)?([A-Z][a-z]+)\s+([A-Z])([a-z]+)(?:\s+(Jr|Sr|III|IV|V))?\b/g,
    (match, title, firstName, lastInitial, restOfLastName, suffix) => {
      const titlePart = title || '';
      const suffixPart = suffix ? ` ${suffix}` : '';
      return `${titlePart}${firstName} ${lastInitial}.${suffixPart}`;
    }
  );

  // Pattern 2: Handle hyphenated last names
  sanitized = sanitized.replace(
    /\b([A-Z][a-z]+)\s+([A-Z])([a-z]+)-([A-Z])([a-z]+)\b/g,
    '$1 $2.-$4.'
  );

  // Pattern 3: Handle multiple middle names (keep first name and last initial)
  sanitized = sanitized.replace(
    /\b([A-Z][a-z]+)(?:\s+[A-Z][a-z]+)+\s+([A-Z])([a-z]+)\b/g,
    '$1 $2.'
  );

  // Remove other PII patterns
  sanitized = sanitized
    // SSN pattern
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN_REMOVED]')
    // Phone numbers (various formats)
    .replace(/\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[PHONE_REMOVED]')
    // Email addresses (but preserve structure for context)
    .replace(/\b([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g, (match, localPart, domain) => {
      const firstChar = localPart[0].toLowerCase();
      return `${firstChar}***@${domain}`;
    })
    // Student ID patterns (various formats)
    .replace(/\b[A-Z]{0,2}\d{6,9}\b/g, '[ID_REMOVED]')
    // Date of birth patterns
    .replace(/\b(?:0[1-9]|1[0-2])[-/](?:0[1-9]|[12]\d|3[01])[-/](?:19|20)\d{2}\b/g, '[DOB_REMOVED]')
    // Credit card patterns
    .replace(/\b(?:\d{4}[\s-]?){3}\d{4}\b/g, '[CC_REMOVED]')
    // Address patterns (street addresses)
    .replace(/\b\d+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive|Ln|Lane|Way|Court|Ct|Plaza|Pl)\b/gi, '[ADDRESS_REMOVED]');

  return sanitized;
}

/**
 * Validate that sanitization was effective
 * Returns true if no obvious PII patterns remain
 */
export function validateSanitization(text: string): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check for remaining full last names (2+ lowercase letters after capital)
  if (/\b[A-Z][a-z]+\s+[A-Z][a-z]{2,}\b/.test(text)) {
    issues.push('Possible full names detected');
  }

  // Check for SSN patterns
  if (/\b\d{3}-\d{2}-\d{4}\b/.test(text)) {
    issues.push('SSN pattern detected');
  }

  // Check for email addresses
  if (/\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/.test(text)) {
    issues.push('Full email address detected');
  }

  // Check for phone numbers
  if (/\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(text)) {
    issues.push('Phone number detected');
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}

/**
 * Get a summary of what was sanitized for audit logging
 */
export function getSanitizationStats(original: string, sanitized: string): {
  namesReplaced: number;
  emailsReplaced: number;
  phonesReplaced: number;
  otherPII: number;
} {
  const namePattern = /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g;
  const emailPattern = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g;
  const phonePattern = /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;

  return {
    namesReplaced: (original.match(namePattern) || []).length,
    emailsReplaced: (original.match(emailPattern) || []).length,
    phonesReplaced: (original.match(phonePattern) || []).length,
    otherPII: (original.match(/\[.*_REMOVED\]/g) || []).length
  };
}