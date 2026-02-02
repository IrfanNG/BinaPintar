-- Authentication Setup v1.1.0
-- Supports 4 roles: admin, supervisor, subcontractor, client
-- Run this in Supabase SQL Editor

-- 1. Drop existing constraint if updating from old schema
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;

-- 2. Create or update user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email text,
  role text DEFAULT 'subcontractor' CHECK (role IN ('admin', 'supervisor', 'subcontractor', 'client')),
  full_name text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Add new constraint for 4 roles (if table already exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'user_profiles_role_check'
    ) THEN
        ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_role_check 
            CHECK (role IN ('admin', 'supervisor', 'subcontractor', 'client'));
    END IF;
END $$;

-- 4. Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies to recreate
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.user_profiles;

-- 6. Create policies for user_profiles
CREATE POLICY "Public profiles are viewable by everyone." ON public.user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 7. Create trigger function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role, full_name)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'role', 'subcontractor'),
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 9. Ensure storage buckets exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-photos', 'site-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('claim-invoices', 'claim-invoices', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 10. Permissive storage policy for MVP
DROP POLICY IF EXISTS "Allow all operations on claim-invoices" ON storage.objects;
CREATE POLICY "Allow all operations on claim-invoices" ON storage.objects
  FOR ALL USING (bucket_id = 'claim-invoices') WITH CHECK (bucket_id = 'claim-invoices');

-- Verification
SELECT 'user_profiles role constraint:' as info;
SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'user_profiles_role_check';
