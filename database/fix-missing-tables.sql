-- Run this to fix the missing tables error
-- This ensures the base tables exist before applying fixes

-- 1. Create Projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT CHECK (status IN ('Active', 'Completed')) DEFAULT 'Active',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Site Logs
CREATE TABLE IF NOT EXISTS site_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  supervisor_id UUID,
  description TEXT NOT NULL,
  photo_url TEXT,
  metadata JSONB, -- Added in later fix, ensuring it exists here
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Permits (This is likely the missing one!)
CREATE TABLE IF NOT EXISTS permits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  doc_name TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS and Policies for Permits
ALTER TABLE permits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on permits" ON permits;
DROP POLICY IF EXISTS "Allow public insert access on permits" ON permits;

CREATE POLICY "Allow public read access on permits" ON permits FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on permits" ON permits FOR INSERT WITH CHECK (true);

-- 5. Create Index
CREATE INDEX IF NOT EXISTS idx_permits_expiry_date ON permits(expiry_date);
