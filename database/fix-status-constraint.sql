-- Fix the status check constraint
-- Run this in Supabase SQL Editor

-- Drop the existing constraint (if it exists)
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;

-- Recreate with correct values
ALTER TABLE projects ADD CONSTRAINT projects_status_check 
    CHECK (status IN ('Active', 'Completed'));

-- Also ensure status has a default
ALTER TABLE projects ALTER COLUMN status SET DEFAULT 'Active';

-- Verify current table structure
SELECT column_name, data_type, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'projects'
ORDER BY ordinal_position;

-- Show any constraints
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'projects'::regclass;
