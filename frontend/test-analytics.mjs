import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    console.log('Testing Analytics Insert...');
    try {
        // Get a valid product ID
        const { data: products } = await supabase.from('products').select('id').limit(1);
        if (!products || products.length === 0) {
            console.log('No products found to test with.');
            return;
        }
        const productId = products[0].id;

        const { data, error } = await supabase.from('product_analytics').insert({
            product_id: productId,
            event_type: 'add_to_cart',
            user_id: null
        }).select();

        if (error) {
            console.error('Insert Error:', JSON.stringify(error, null, 2));
        } else {
            console.log('Insert Success!', data);
        }
    } catch (e) {
        console.error('Exception:', e);
    }
}

testInsert();
