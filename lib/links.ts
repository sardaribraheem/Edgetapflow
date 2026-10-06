// Validate at entry AND display: older Firestore documents are untrusted too.
export function isSafeContactUrl(value: string): boolean {
  if (!value || value !== value.trim() || /[\u0000-\u0020\u007f]/.test(value)) return false;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" || url.protocol === "http:") {
      return !!url.hostname && !url.username && !url.password;
    }
    if (url.protocol === "mailto:") return /^[^@\s?]+@[^@\s?]+\.[^@\s?]+$/.test(url.pathname);
    if (url.protocol === "tel:") return /^\+?[\d()-]{5,25}$/.test(url.pathname);
    return false;
  } catch { return false; }
}
