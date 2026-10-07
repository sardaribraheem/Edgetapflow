// Only an account ID and opaque request key are kept in this tab. Never persist
// passwords, order payloads, receipt paths or contact details in browser storage.
export type SubmissionMarker = { uid: string; key: string };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const storageKey = () => `edgetap:submission:${process.env.NEXT_PUBLIC_SUPABASE_URL}`;

export function readSubmissionMarker(): SubmissionMarker | null {
  const value = window.sessionStorage.getItem(storageKey());
  if (!value) return null;
  const marker = JSON.parse(value) as SubmissionMarker;
  if (!uuid.test(marker.uid) || !uuid.test(marker.key)) throw new Error("Invalid order submission reference.");
  return { uid: marker.uid, key: marker.key };
}
export function rememberSubmission(marker: SubmissionMarker): void {
  if (!uuid.test(marker.uid) || !uuid.test(marker.key)) throw new Error("Invalid order submission reference.");
  window.sessionStorage.setItem(storageKey(), JSON.stringify({ uid: marker.uid, key: marker.key }));
}
export function clearSubmissionMarker(): void {
  window.sessionStorage.removeItem(storageKey());
}
