-- Fix missing columns in projects table
-- Run this in Supabase SQL Editor

-- Add missing columns to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS end_date DATE;

-- Set a default value for existing rows (if any)
UPDATE projects SET start_date = CURRENT_DATE WHERE start_date IS NULL;

-- Make start_date required for new rows
ALTER TABLE projects ALTER COLUMN start_date SET NOT NULL;

-- Verify the fix
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'projects';
