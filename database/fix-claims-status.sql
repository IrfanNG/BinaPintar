-- Fix Claims Status Constraint
-- Run this in Supabase SQL Editor

-- Drop the existing constraint
ALTER TABLE claims DROP CONSTRAINT IF EXISTS claims_status_check;

-- Recreate with correct values
ALTER TABLE claims ADD CONSTRAINT claims_status_check 
    CHECK (status IN ('Pending', 'Approved', 'Paid'));

-- Set default
ALTER TABLE claims ALTER COLUMN status SET DEFAULT 'Pending';

-- Verify
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'claims'::regclass;
