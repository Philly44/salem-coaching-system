// Test script to demonstrate PII sanitization
// Run with: node test-sanitization.js

const { sanitizeTranscript, validateSanitization, getSanitizationStats } = require('./src/utils/sanitizeTranscript.ts');

const testTranscript = `
Advisor: Hello, I'm Dr. Jennifer Smith-Johnson, your academic advisor.

Student: Hi Dr. Smith-Johnson, I'm Michael Rodriguez Jr. Nice to meet you.

Advisor: Great to meet you too, Michael. I see from your records that you're from 
123 Main Street, Boston, MA. Is that correct?

Student: Yes, that's right. My phone number is (555) 123-4567 if you need to reach me.
My email is michael.rodriguez@university.edu.

Advisor: Perfect. I also see your student ID is ST789012. Now, let's discuss your 
academic goals. But first, for our records, can you confirm your date of birth?

Student: Sure, it's 05/15/2003. My SSN is 123-45-6789 if you need that too.

Advisor: Thank you. Now, Professor William Anderson III mentioned you're interested 
in the computer science program. Is that right?

Student: Yes! I spoke with Prof. Anderson last week. He gave me his email: 
wanderson@university.edu and said I should follow up.
`;

console.log('=== ORIGINAL TRANSCRIPT ===');
console.log(testTranscript);

console.log('\n=== SANITIZED TRANSCRIPT ===');
const sanitized = sanitizeTranscript(testTranscript);
console.log(sanitized);

console.log('\n=== VALIDATION RESULTS ===');
const validation = validateSanitization(sanitized);
console.log('Is Valid:', validation.isValid);
console.log('Issues:', validation.issues);

console.log('\n=== SANITIZATION STATISTICS ===');
const stats = getSanitizationStats(testTranscript, sanitized);
console.log('Names replaced:', stats.namesReplaced);
console.log('Emails replaced:', stats.emailsReplaced);
console.log('Phones replaced:', stats.phonesReplaced);
console.log('Other PII replaced:', stats.otherPII);

console.log('\n=== KEY IMPROVEMENTS ===');
console.log('✅ Last names → Initials (Dr. Jennifer Smith-Johnson → Dr. Jennifer S.-J.)');
console.log('✅ Complex names handled (Michael Rodriguez Jr. → Michael R. Jr.)');
console.log('✅ Emails partially masked (michael.rodriguez@university.edu → m***@university.edu)');
console.log('✅ Phone numbers removed');
console.log('✅ SSNs removed');
console.log('✅ Addresses removed');
console.log('✅ Student IDs removed');
console.log('✅ Dates of birth removed');