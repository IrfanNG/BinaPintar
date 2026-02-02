-- BinaPintar Storage Setup
-- Run this in your Supabase SQL Editor to create the storage bucket for site photos

-- Create storage bucket for site photos (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-photos',
  'site-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for public access
CREATE POLICY "Allow public uploads to site-photos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'site-photos');

CREATE POLICY "Allow public reads from site-photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'site-photos');

CREATE POLICY "Allow public deletes from site-photos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'site-photos');
