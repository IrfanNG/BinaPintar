-- Complete Claims Table Setup
-- Run this in Supabase SQL Editor

-- Create claims table if it doesn't exist
CREATE TABLE IF NOT EXISTS claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT NOT NULL,
    status TEXT CHECK (status IN ('Pending', 'Approved', 'Paid')) DEFAULT 'Pending',
    proof_url TEXT,
    submitted_by UUID,
    approved_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access on claims" ON claims;
DROP POLICY IF EXISTS "Allow public insert access on claims" ON claims;
DROP POLICY IF EXISTS "Allow public update access on claims" ON claims;

-- Create permissive policies (for MVP)
CREATE POLICY "Allow public read access on claims" ON claims FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on claims" ON claims FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on claims" ON claims FOR UPDATE USING (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_claims_project_id ON claims(project_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);

-- Verify the table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'claims'
ORDER BY ordinal_position;
