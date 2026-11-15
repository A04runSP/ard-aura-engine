import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

/**
 * Returns the shared Supabase browser client.
 *
 * Configuration is read only from Vite environment variables. The publishable
 * key is designed for browser use; never place a secret/service-role key here.
 * Lazy initialization keeps the Project Hub preview usable before credentials
 * for the new database have been added.
 */
export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) return supabaseClient;

  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !publishableKey) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in the deployment environment.",
    );
  }

  try {
    new URL(url);
  } catch {
    throw new Error("VITE_SUPABASE_URL must be a valid absolute URL.");
  }

  supabaseClient = createClient(url, publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return supabaseClient;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL?.trim() &&
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim(),
  );
}
