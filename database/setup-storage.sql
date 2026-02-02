-- Storage Setup for BinaPintar
-- Run this in Supabase SQL Editor

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-photos', 'site-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('claim-docs', 'claim-docs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing storage policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public uploads to site-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from site-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads to claim-docs" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from claim-docs" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads" ON storage.objects;

-- Create permissive storage policies for MVP
-- Allow anyone to upload to site-photos bucket
CREATE POLICY "Allow public uploads to site-photos" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'site-photos');

-- Allow anyone to read from site-photos bucket
CREATE POLICY "Allow public read from site-photos" ON storage.objects
    FOR SELECT USING (bucket_id = 'site-photos');

-- Allow anyone to upload to claim-docs bucket
CREATE POLICY "Allow public uploads to claim-docs" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'claim-docs');

-- Allow anyone to read from claim-docs bucket
CREATE POLICY "Allow public read from claim-docs" ON storage.objects
    FOR SELECT USING (bucket_id = 'claim-docs');

-- Verify buckets exist
SELECT id, name, public FROM storage.buckets;
