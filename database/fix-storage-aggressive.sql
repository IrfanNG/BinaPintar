-- AGGRESSIVE Storage Fix
-- Run this in Supabase SQL Editor
-- This creates fully permissive policies for MVP testing

-- First, let's see what policies exist
SELECT policyname, tablename, cmd FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Drop ALL storage policies to start fresh
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON storage.objects';
    END LOOP;
END $$;

-- Ensure buckets exist and are public
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-photos', 'site-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('claim-docs', 'claim-docs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create ONE super-permissive policy for all operations
CREATE POLICY "Allow all storage operations" ON storage.objects
    FOR ALL USING (true) WITH CHECK (true);

-- Verify the fix
SELECT policyname, tablename, cmd FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';

SELECT id, name, public FROM storage.buckets;
