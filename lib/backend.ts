export const DATA_BACKEND = process.env.NEXT_PUBLIC_DATA_BACKEND || "supabase";
if (!["firebase", "supabase"].includes(DATA_BACKEND)) throw new Error("Unsupported data backend.");

// Production starts clean in Supabase. Firebase remains an explicitly selected
// legacy option; missing Supabase configuration must never fall back to Firebase.
export const usesSupabase = DATA_BACKEND === "supabase";
