import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { validateSupabaseConfig } from "./supabase-config";

let client: SupabaseClient | undefined;
export function getSupabase(): SupabaseClient {
  if (client) return client;
  const { url, key } = validateSupabaseConfig(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  client = createClient(url, key, { global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store'})}, auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  return client;
}
