import { createClient } from '@supabase/supabase-js';

// Publishable key được thiết kế để dùng ở frontend. RLS trong supabase/schema.sql
// vẫn là lớp bảo vệ bắt buộc cho dữ liệu; không đặt service_role key ở đây.
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? 'https://dnupvnjyfuxvuklciure.supabase.co') as string;
const supabaseKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'sb_publishable_d4PB_lKPb5cweK_FyZYqQQ_dwBZhlAG') as string;

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Supabase Auth cần email; username được ánh xạ thành email nội bộ để giữ form hiện tại.
export const usernameEmail = (username: string) => `${username.trim().toLowerCase()}@maiangi.local`;
