-- Backfill missing user profiles for existing users
-- Run this in Supabase SQL Editor

INSERT INTO public.user_profiles (id, email, role, full_name)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'role', 'subcontractor'),
    COALESCE(raw_user_meta_data->>'full_name', 'User')
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.user_profiles);

-- Verify the fix
SELECT * FROM public.user_profiles;
