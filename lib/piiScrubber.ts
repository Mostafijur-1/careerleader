// lib/piiScrubber.ts
const PII_PATTERNS = [
  /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, // Names (e.g. John Doe, Mostafijur Rahman)
  /\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g, // Phone numbers
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // Emails
];

export function scrubPII(input: string): string {
  let scrubbed = input;
  for (const pattern of PII_PATTERNS) {
    scrubbed = scrubbed.replace(pattern, '[REDACTED]');
  }
  return scrubbed;
}
