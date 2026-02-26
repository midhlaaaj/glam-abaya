import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pqpttxitdhgzbmlliauy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxcHR0eGl0ZGhnemJtbGxpYXV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NjA5NzksImV4cCI6MjA4NzUzNjk3OX0.bB2hqorfUi4dYXZ7AcU-tsONnoRUfKU6BX0MK2mWfFs';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
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

    console.log("Attempting to read profiles schema...");
    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

    if (profileError) {
        console.error("Profile Query Error:", profileError);
    } else {
        console.log("Profile Data:", profileData);
    }
}

testLogin();
