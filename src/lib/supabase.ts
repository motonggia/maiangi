import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Supabase Auth cần email; username được ánh xạ thành email nội bộ để giữ form hiện tại.
export const usernameEmail = (username: string) => `${username.trim().toLowerCase()}@maiangi.local`;
