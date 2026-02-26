import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual env parsing
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const getEnv = (key) => envContent.match(new RegExp(`${key}=(.*)`))?.[1]?.trim();

const supabaseUrl = `https://${getEnv('VITE_SUPABASE_URL')}.supabase.co`;
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCategoryInsert() {
    console.log('--- Testing Category Insert ---');

    // Login first to get a session (RLS requires it)
    console.log('Logging in...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'admin@glamabayas.com',
        password: 'Admiin123',
    });

    if (authError) {
        console.error('❌ Login failed:', authError.message);
        return;
    }
    console.log('✅ Login successful');

    console.log('Attempting to insert category "New Arrivals"...');
    const { data, error } = await supabase
        .from('categories')
        .insert([{ name: 'New Arrivals' }])
        .select();

    if (error) {
        console.error('❌ Insert failed:', error.message);
        console.error('Code:', error.code);
        console.error('Details:', error.details);
        console.error('Hint:', error.hint);
    } else {
        console.log('✅ Insert successful:', data);
    }

    console.log('--- Test End ---');
}

testCategoryInsert();
