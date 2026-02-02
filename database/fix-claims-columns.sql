-- Fix Claims Table - Add Missing Columns
-- Run this in Supabase SQL Editor

-- Add missing columns to claims table
ALTER TABLE claims ADD COLUMN IF NOT EXISTS approved_by UUID;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS submitted_by UUID;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Verify the columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'claims'
ORDER BY ordinal_position;
