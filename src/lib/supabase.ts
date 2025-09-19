import { createClient } from '@supabase/supabase-js';

// Use a valid placeholder URL to prevent crashes during build and server-side rendering.
// This allows the app to load and display a configuration-needed message.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

if (supabaseUrl.includes("placeholder.supabase.co") || supabaseAnonKey.includes("placeholder-anon-key")) {
    console.warn("--- SUPABASE CONFIGURATION WARNING ---");
    console.warn("Your Supabase environment variables are not fully configured.");
    console.warn("The application is using placeholder values, so authentication and database operations will fail.");
    console.warn("Please create a .env file in the root of your project and add your actual Supabase URL and Anon Key.");
    console.warn("--------------------------------------");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
