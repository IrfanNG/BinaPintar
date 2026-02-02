-- STEP 1: Check if user_profiles table exists and what's in it
SELECT 'Current user_profiles:' as info;
SELECT * FROM public.user_profiles;

-- STEP 2: Check auth.users to see your actual user ID
SELECT 'Your auth.users record:' as info;
SELECT id, email, raw_user_meta_data FROM auth.users;

-- STEP 3: Force insert/update your profile to admin
-- This will work regardless of whether the record exists
INSERT INTO public.user_profiles (id, email, role, full_name)
SELECT 
    id, 
    email, 
    'admin', 
    COALESCE(raw_user_meta_data->>'full_name', 'Admin User')
FROM auth.users
WHERE email LIKE '%mnifanmohdariff%' -- Matches your email
ON CONFLICT (id) 
DO UPDATE SET 
    role = 'admin',
    email = EXCLUDED.email;

-- STEP 4: Verify the fix
SELECT 'After fix:' as info;
SELECT * FROM public.user_profiles;
