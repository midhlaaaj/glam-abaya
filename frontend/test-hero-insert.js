import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pqpttxitdhgzbmlliauy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxcHR0eGl0ZGhnemJtbGxpYXV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NjA5NzksImV4cCI6MjA4NzUzNjk3OX0.bB2hqorfUi4dYXZ7AcU-tsONnoRUfKU6BX0MK2mWfFs';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testAll() {
    console.log("Attempting to login...");
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'admin@glamabayas.com',
        password: 'Admiin123',
    });

    if (authError) {
        console.error("Auth Error:", authError);
        return;
    }
    console.log("Auth Success. User ID:", authData.user.id);

    console.log("Attempting to read profile...");
    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

    console.log("Profile Data:", profileData);
    console.log("Profile Error:", profileError);

    console.log("Attempting to insert into hero_section...");
    const { data: heroData, error: heroError } = await supabase
        .from('hero_section')
        .insert([{
            title: 'Test Hero Insert',
            is_active: true
        }]);

    console.log("Hero Insert Result:", heroData);
    console.log("Hero Insert Error:", heroError);
}

testAll();
