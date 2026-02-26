const url = "https://pqpttxitdhgzbmlliauy.supabase.co/rest/v1/profiles?select=*";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxcHR0eGl0ZGhnemJtbGxpYXV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NjA5NzksImV4cCI6MjA4NzUzNjk3OX0.bB2hqorfUi4dYXZ7AcU-tsONnoRUfKU6BX0MK2mWfFs";

fetch(url, {
    headers: {
        "apikey": key,
        "Authorization": `Bearer ${key}`
    }
})
    .then(async (res) => {
        console.log("Status:", res.status);
        console.log("Headers:", JSON.stringify(Object.fromEntries(res.headers.entries()), null, 2));
        const text = await res.text();
        console.log("Body:", text);
    })
    .catch(console.error);
