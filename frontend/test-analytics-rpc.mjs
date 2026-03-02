import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const rawUrl = process.env.VITE_SUPABASE_URL;

let supabaseUrl = rawUrl;
if (rawUrl && !rawUrl.startsWith('http')) {
    supabaseUrl = `https://${rawUrl}.supabase.co`;
}

const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testHighlyCarted() {
    console.log('Testing get_highly_carted_products...');
    try {
        const { data, error } = await supabase.rpc('get_highly_carted_products', { limit_num: 5 });

        if (error) {
            console.error('RPC Error:', JSON.stringify(error, null, 2));
        } else {
            console.log('RPC Success:', data);
        }
    } catch (e) {
        console.error('Exception:', e);
    }
}

testHighlyCarted();
