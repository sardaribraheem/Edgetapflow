// Shared by the build preflight and lazy browser client. Errors never echo keys.
export function validateSupabaseConfig(url?: string, key?: string): { url: string; key: string } {
  if (!url || !key) throw new Error('Supabase public configuration is missing.');
  let parsed: URL;
  try { parsed = new URL(url); } catch { throw new Error('Invalid Supabase project origin.'); }
  const local = ['localhost','127.0.0.1'].includes(parsed.hostname);
  if (!(parsed.protocol === 'https:' || (parsed.protocol === 'http:' && local)) || parsed.username || parsed.password || parsed.search || parsed.hash || !['','/'].includes(parsed.pathname)) throw new Error('Use a Supabase HTTPS project origin (HTTP allowed only for local testing).');
  if (key.startsWith('sb_secret_')) throw new Error('A secret key must not be used in the browser.');
  if (key.split('.').length === 3) {
    try {
      const encoded = key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');
      if (JSON.parse(atob(encoded)).role !== 'anon') throw new Error();
    } catch { throw new Error('Only a publishable or anonymous key is allowed.'); }
  } else if (!key.startsWith('sb_publishable_')) throw new Error('Invalid Supabase publishable key.');
  return { url: parsed.origin, key };
}
