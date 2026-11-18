export function validEmail(email: string) {
  // Match Java String.trim(), UTF-16 length and Java's ASCII \s.
  // The API remains responsible for normalization; keep the submitted value intact.
  const normalized = email.replace(/^[\u0000-\u0020]+|[\u0000-\u0020]+$/g, '').toLowerCase();
  return normalized.length <= 254 && /^[^\t\n\v\f\r @]+@[^\t\n\v\f\r @]+\.[^\t\n\v\f\r @]+$/.test(normalized);
}
