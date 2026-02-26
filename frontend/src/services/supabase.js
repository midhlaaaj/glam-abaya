import { createClient } from '@supabase/supabase-js';

// The URL provided by the user is just a domain string, so we construct the standard Supabase URL
// 'krzwmilsqxyxscyucorl' -> 'https://krzwmilsqxyxscyucorl.supabase.co'
const supabaseUrl = `https://${import.meta.env.VITE_SUPABASE_URL}.supabase.co`;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Initializing Supabase client with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseKey);
