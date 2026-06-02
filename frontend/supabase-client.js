import { createClient } from '@supabase/supabase-js';

// Vite injects variables that start with VITE_ into import.meta.env.
// Keep only the public Supabase publishable/anon key here. Never use service_role in frontend code.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY.');
}

window.supabaseClient = createClient(
    supabaseUrl,
    supabaseKey,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    }
);
