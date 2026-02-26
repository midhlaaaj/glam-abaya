import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual env parsing
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const getEnv = (key) => envContent.match(new RegExp(`${key}=(.*)`))?.[1]?.trim();

const supabaseUrl = `https://${getEnv('VITE_SUPABASE_URL')}.supabase.co`;
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY');

console.log('--- Supabase Diagnostic Start ---');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function runDiagnostics() {
    try {
        // 1. Check Auth Connection
        console.log('\n1. Checking Auth/Connection...');
        const { data: authData, error: authError } = await supabase.auth.getSession();
        if (authError) {
            console.error('❌ Auth Connection Failed:', authError.message);
        } else {
            console.log('✅ Auth Connection OK');
        }

        // 2. Check Storage Buckets
        console.log('\n2. Checking Storage Buckets...');
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        if (bucketError) {
            console.error('❌ Could not list buckets:', bucketError.message);
            console.log('Note: This usually requires a service_role key or specific RLS permissions.');
        } else {
            console.log('✅ Buckets found:', buckets.map(b => b.name).join(', ') || 'none');
            const hasHeroBucket = buckets.some(b => b.name === 'glam_assets');
            if (hasHeroBucket) {
                console.log('✅ "glam_assets" bucket exists.');
            } else {
                console.error('❌ "glam_assets" bucket is MISSING!');
            }
        }

        // 3. Check Categories Table
        console.log('\n3. Checking Categories Table...');
        const { data: categories, error: catError } = await supabase.from('categories').select('count', { count: 'exact' });
        if (catError) {
            console.error('❌ Categories table access failed:', catError.message);
        } else {
            console.log('✅ Categories table accessible. Count:', categories[0]?.count || 0);
        }

        // 4. Test Public Health Check (Storage)
        console.log('\n4. Testing public link accessibility...');
        // Just try to get a URL (doesn't check if file exists)
        const { data: publicUrl } = supabase.storage.from('glam_assets').getPublicUrl('test.png');
        console.log('Generated URL:', publicUrl.publicUrl);

    } catch (err) {
        console.error('\n💥 Unexpected diagnostic error:', err);
    }
    console.log('\n--- Diagnostic End ---');
}

runDiagnostics();
