-- Fix RLS Policies for Projects to allow creation
-- Run this in Supabase SQL Editor

-- Enable RLS just in case
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Re-create policies for Projects
DROP POLICY IF EXISTS "Allow public insert access on projects" ON projects;
DROP POLICY IF EXISTS "Allow public read access on projects" ON projects;
DROP POLICY IF EXISTS "Allow public update access on projects" ON projects;

CREATE POLICY "Allow public insert access on projects" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read access on projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow public update access on projects" ON projects FOR UPDATE USING (true);

-- Ensure other tables have insert access too
DROP POLICY IF EXISTS "Allow public insert access on claims" ON claims;
CREATE POLICY "Allow public insert access on claims" ON claims FOR INSERT WITH CHECK (true);
