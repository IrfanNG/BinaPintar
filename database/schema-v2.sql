-- BinaPintar Schema v2 (Advanced Features)
-- Run this in your Supabase SQL Editor to add GPS metadata, Claims, and Notifications

-- 1. Add metadata column to site_logs for GPS/EXIF data
ALTER TABLE site_logs ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 2. Create claims table for Financial Module
CREATE TABLE IF NOT EXISTS claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT NOT NULL,
  status TEXT CHECK (status IN ('Pending', 'Approved', 'Paid')) DEFAULT 'Pending',
  proof_url TEXT,
  submitted_by UUID, -- In real app refer to profiles.id
  approved_by UUID,  -- In real app refer to profiles.id
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID, -- null means broadcast to all
  type TEXT NOT NULL, -- 'site_log', 'permit_expiry', 'claim_update'
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS on new tables
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 5. Create basic policies (Public for MVP)
CREATE POLICY "Allow public read access on claims" ON claims FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on claims" ON claims FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on claims" ON claims FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on notifications" ON notifications FOR UPDATE USING (true);

-- 6. Add storage bucket for claim documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'claim-docs',
  'claim-docs',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for claims
CREATE POLICY "Allow public uploads to claim-docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'claim-docs');
CREATE POLICY "Allow public reads from claim-docs" ON storage.objects FOR SELECT USING (bucket_id = 'claim-docs');

-- 7. Add sample claims data
DO $$
DECLARE
  project_id UUID;
BEGIN
  -- Grab first project
  SELECT id INTO project_id FROM projects LIMIT 1;
  
  IF project_id IS NOT NULL THEN
    INSERT INTO claims (project_id, amount, description, status) VALUES
      (project_id, 1500.00, 'Materials reimbursement - Cement bags', 'Pending'),
      (project_id, 450.50, 'Site safety equipment purchase', 'Approved'),
      (project_id, 3200.00, 'Excavator rental fee (Weekly)', 'Paid');
      
    -- Add sample notification
    INSERT INTO notifications (type, title, message, link) VALUES
      ('claim_update', 'Claim Paid', 'Excavator rental fee claim has been paid.', '/claims');
  END IF;
END $$;
