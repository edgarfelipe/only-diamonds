export function hashPassword(password: string): string {
  // Remove whitespace and convert to lowercase for consistency
  const cleanPassword = password.trim().toLowerCase();
  
  // Simple hashing function for demo purposes
  let hash = 0;
  for (let i = 0; i < cleanPassword.length; i++) {
    const char = cleanPassword.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  // Convert to positive hex string with padding
  const positiveHash = Math.abs(hash).toString(16);
  return positiveHash.padStart(32, '0');
}