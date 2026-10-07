import type { NextConfig } from "next";

import { validateSupabaseConfig } from "./lib/supabase-config";
const backend = process.env.NEXT_PUBLIC_DATA_BACKEND || "supabase";
if (!["firebase", "supabase"].includes(backend)) throw new Error("Unsupported data backend.");
// Refuse to bake missing or privileged Supabase configuration into public assets.
if (backend === "supabase") validateSupabaseConfig(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
