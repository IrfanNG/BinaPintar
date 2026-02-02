-- BinaPintar Database Schema
-- Run this in your Supabase SQL Editor

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT CHECK (status IN ('Active', 'Completed')) DEFAULT 'Active',
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site logs table
CREATE TABLE IF NOT EXISTS site_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  supervisor_id UUID,
  description TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Permits table
CREATE TABLE IF NOT EXISTS permits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  doc_name TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE permits ENABLE ROW LEVEL SECURITY;

-- Create public access policies (for MVP - adjust for production)
CREATE POLICY "Allow public read access on projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on projects" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on projects" ON projects FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on site_logs" ON site_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on site_logs" ON site_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on permits" ON permits FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on permits" ON permits FOR INSERT WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_site_logs_project_id ON site_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_site_logs_created_at ON site_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_permits_project_id ON permits(project_id);
CREATE INDEX IF NOT EXISTS idx_permits_expiry_date ON permits(expiry_date);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
