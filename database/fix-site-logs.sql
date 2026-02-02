-- Fix Site Logs Table - Add Missing Columns
-- Run this in Supabase SQL Editor

-- Add missing columns to site_logs table
ALTER TABLE site_logs ADD COLUMN IF NOT EXISTS supervisor_id UUID;
ALTER TABLE site_logs ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Verify the columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'site_logs'
ORDER BY ordinal_position;
