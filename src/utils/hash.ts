export function hashPassword(password: string): string {
  // Remove whitespace and convert to lowercase for consistency
  const cleanPassword = password.trim().toLowerCase();
  
  // Create a simple hash
  let hash = 0;
  for (let i = 0; i < cleanPassword.length; i++) {
    const char = cleanPassword.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  // Convert to positive hex string
  return Math.abs(hash).toString(16);
}