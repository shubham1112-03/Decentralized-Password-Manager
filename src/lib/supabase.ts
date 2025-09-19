import { createClient } from '@supabase/supabase-js';

// Fallback to placeholder values if environment variables are not set.
// This prevents the application from crashing during development or build time.
// You MUST replace these with your actual Supabase credentials in your .env file.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "YOUR_SUPABASE_URL_HERE";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY_HERE";

if (supabaseUrl.includes("YOUR_SUPABASE_URL_HERE") || supabaseAnonKey.includes("YOUR_SUPABASE_ANON_KEY_HERE")) {
    console.warn("Supabase environment variables are not fully configured. The application is using placeholder values. Authentication and database operations will fail until you provide your real Supabase credentials in the .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
