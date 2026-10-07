export const DATA_BACKEND = process.env.NEXT_PUBLIC_DATA_BACKEND || "firebase";
if (!["firebase", "supabase"].includes(DATA_BACKEND)) throw new Error("Unsupported data backend.");

// Explicit cutover; preserve the Firebase installation until destination/data
// verification is complete. No implicit switch based on available credentials.
export const usesSupabase = DATA_BACKEND === "supabase";
