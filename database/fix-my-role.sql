-- 1. FIX YOUR ADMIN ACCOUNT
-- Replace 'mnifanmohdariff@gmail.com' with your exact email if different
INSERT INTO public.user_profiles (id, email, role, full_name)
SELECT 
    id, 
    email, 
    'admin', 
    COALESCE(raw_user_meta_data->>'full_name', 'Admin User')
FROM auth.users
WHERE email = 'mnifanmohdariff@gmail.com' -- TARGET YOUR EMAIL
ON CONFLICT (id) DO UPDATE 
SET role = 'admin';

-- 2. VERIFY THE FIX
SELECT * FROM public.user_profiles WHERE email = 'mnifanmohdariff@gmail.com';
