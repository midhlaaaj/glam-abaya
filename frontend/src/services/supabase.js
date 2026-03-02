import { createClient } from '@supabase/supabase-js';

// Get the environment variable
const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Gracefully handle both the full URL and just the project reference string
// which prevents "https://https://[...].supabase.co" errors in production
let supabaseUrl = rawUrl;
if (rawUrl && !rawUrl.startsWith('http')) {
    supabaseUrl = `https://${rawUrl}.supabase.co`;
}

console.log('Initializing Supabase client with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseKey);
