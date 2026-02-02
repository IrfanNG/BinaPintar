-- ============================================
-- MASTER FIX SCRIPT FOR BINAPINTAR
-- Run this ONCE in Supabase SQL Editor
-- ============================================

-- ============ PROJECTS TABLE ============
ALTER TABLE projects ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS end_date DATE;
UPDATE projects SET start_date = CURRENT_DATE WHERE start_date IS NULL;

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE projects ADD CONSTRAINT projects_status_check 
    CHECK (status IN ('Active', 'Completed'));
ALTER TABLE projects ALTER COLUMN status SET DEFAULT 'Active';

-- Projects RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on projects" ON projects;
DROP POLICY IF EXISTS "Allow public insert access on projects" ON projects;
DROP POLICY IF EXISTS "Allow public update access on projects" ON projects;
CREATE POLICY "Allow public read access on projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on projects" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on projects" ON projects FOR UPDATE USING (true);

-- ============ SITE_LOGS TABLE ============
ALTER TABLE site_logs ADD COLUMN IF NOT EXISTS supervisor_id UUID;
ALTER TABLE site_logs ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Site Logs RLS
ALTER TABLE site_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on site_logs" ON site_logs;
DROP POLICY IF EXISTS "Allow public insert access on site_logs" ON site_logs;
CREATE POLICY "Allow public read access on site_logs" ON site_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on site_logs" ON site_logs FOR INSERT WITH CHECK (true);

-- ============ PERMITS TABLE ============
ALTER TABLE permits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on permits" ON permits;
DROP POLICY IF EXISTS "Allow public insert access on permits" ON permits;
CREATE POLICY "Allow public read access on permits" ON permits FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on permits" ON permits FOR INSERT WITH CHECK (true);

-- ============ CLAIMS TABLE ============
CREATE TABLE IF NOT EXISTS claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    proof_url TEXT,
    submitted_by UUID,
    approved_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE claims ADD COLUMN IF NOT EXISTS approved_by UUID;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS submitted_by UUID;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE claims DROP CONSTRAINT IF EXISTS claims_status_check;
ALTER TABLE claims ADD CONSTRAINT claims_status_check 
    CHECK (status IN ('Pending', 'Approved', 'Paid'));
ALTER TABLE claims ALTER COLUMN status SET DEFAULT 'Pending';

-- Claims RLS
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on claims" ON claims;
DROP POLICY IF EXISTS "Allow public insert access on claims" ON claims;
DROP POLICY IF EXISTS "Allow public update access on claims" ON claims;
CREATE POLICY "Allow public read access on claims" ON claims FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on claims" ON claims FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on claims" ON claims FOR UPDATE USING (true);

-- ============ NOTIFICATIONS TABLE ============
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    type TEXT CHECK (type IN ('site_log', 'permit_expiry', 'claim_update')),
    title TEXT NOT NULL,
    message TEXT,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on notifications" ON notifications;
DROP POLICY IF EXISTS "Allow public insert access on notifications" ON notifications;
DROP POLICY IF EXISTS "Allow public update access on notifications" ON notifications;
CREATE POLICY "Allow public read access on notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on notifications" ON notifications FOR UPDATE USING (true);

-- ============ STORAGE ============
-- Create buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-photos', 'site-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('claim-docs', 'claim-docs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop ALL storage policies
DO $$ 
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON storage.objects';
    END LOOP;
END $$;

-- Create permissive storage policy
CREATE POLICY "Allow all storage operations" ON storage.objects
    FOR ALL USING (true) WITH CHECK (true);

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_site_logs_project_id ON site_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_site_logs_created_at ON site_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_permits_project_id ON permits(project_id);
CREATE INDEX IF NOT EXISTS idx_permits_expiry_date ON permits(expiry_date);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_claims_project_id ON claims(project_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);

-- ============ SECURE RPC FUNCTION ============
CREATE OR REPLACE FUNCTION create_project_secure(
  name text,
  status text,
  start_date date,
  end_date date
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_record projects%ROWTYPE;
BEGIN
  INSERT INTO projects (name, status, start_date, end_date)
  VALUES (name, status, start_date, end_date)
  RETURNING * INTO new_record;
  
  RETURN to_json(new_record);
END;
$$;

-- ============ VERIFICATION ============
SELECT 'Projects columns:' as info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'projects';

SELECT 'Site logs columns:' as info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'site_logs';

SELECT 'Claims columns:' as info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'claims';

SELECT 'Storage buckets:' as info;
SELECT id, name, public FROM storage.buckets;
