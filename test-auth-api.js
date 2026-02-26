const url = "https://pqpttxitdhgzbmlliauy.supabase.co/auth/v1/token?grant_type=password";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxcHR0eGl0ZGhnemJtbGxpYXV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NjA5NzksImV4cCI6MjA4NzUzNjk3OX0.bB2hqorfUi4dYXZ7AcU-tsONnoRUfKU6BX0MK2mWfFs";

fetch(url, {
    method: "POST",
    headers: {
        "apikey": key,
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        email: "admin@glamabayas.com",
        password: "Admiin123"
    })
})
    .then(async (res) => {
        console.log("Auth Status:", res.status);
        console.log("Auth Body:", await res.text());
    })
    .catch(console.error);
