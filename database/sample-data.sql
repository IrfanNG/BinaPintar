-- BinaPintar Sample Data
-- Run this AFTER schema.sql to populate with test data

-- Insert sample projects
INSERT INTO projects (name, status, start_date, end_date) VALUES
  ('Menara KL Tower Extension', 'Active', '2025-06-15', NULL),
  ('Taman Desa Residences Phase 2', 'Active', '2025-03-01', '2026-12-31'),
  ('Johor Bahru Industrial Complex', 'Active', '2025-09-10', '2027-06-30'),
  ('Penang Heritage Restoration', 'Completed', '2024-01-15', '2025-11-30'),
  ('Cyberjaya Smart Campus', 'Active', '2025-11-01', '2028-03-15');

-- Get project IDs for foreign key references
DO $$
DECLARE
  project1_id UUID;
  project2_id UUID;
  project3_id UUID;
  project4_id UUID;
  project5_id UUID;
BEGIN
  SELECT id INTO project1_id FROM projects WHERE name = 'Menara KL Tower Extension';
  SELECT id INTO project2_id FROM projects WHERE name = 'Taman Desa Residences Phase 2';
  SELECT id INTO project3_id FROM projects WHERE name = 'Johor Bahru Industrial Complex';
  SELECT id INTO project4_id FROM projects WHERE name = 'Penang Heritage Restoration';
  SELECT id INTO project5_id FROM projects WHERE name = 'Cyberjaya Smart Campus';

  -- Insert sample site logs
  INSERT INTO site_logs (project_id, description, created_at) VALUES
    (project1_id, 'Foundation excavation completed. Steel reinforcement installation started today.', NOW() - INTERVAL '5 days'),
    (project1_id, 'Concrete pouring for basement level 1 completed successfully. Curing process initiated.', NOW() - INTERVAL '3 days'),
    (project1_id, 'Site inspection passed. All safety measures in compliance with DOSH standards.', NOW() - INTERVAL '1 day'),
    (project2_id, 'Block A structural framework completed up to 5th floor.', NOW() - INTERVAL '7 days'),
    (project2_id, 'Plumbing and electrical rough-in work in progress for Block A.', NOW() - INTERVAL '2 days'),
    (project3_id, 'Site clearing and grading 80% complete. Drainage system installation underway.', NOW() - INTERVAL '4 days'),
    (project5_id, 'Project kickoff meeting completed. Site mobilization begins next week.', NOW() - INTERVAL '10 days');

  -- Insert sample permits (mix of expired, expiring soon, and valid)
  INSERT INTO permits (project_id, doc_name, expiry_date) VALUES
    -- Expired permits
    (project1_id, 'Construction Site Safety Permit', CURRENT_DATE - INTERVAL '10 days'),
    (project2_id, 'Environmental Compliance Certificate', CURRENT_DATE - INTERVAL '5 days'),
    
    -- Expiring soon (within 30 days)
    (project1_id, 'Building Plan Approval', CURRENT_DATE + INTERVAL '7 days'),
    (project1_id, 'Fire Safety Certificate', CURRENT_DATE + INTERVAL '15 days'),
    (project3_id, 'Land Use Permit', CURRENT_DATE + INTERVAL '20 days'),
    (project3_id, 'Heavy Machinery License', CURRENT_DATE + INTERVAL '25 days'),
    
    -- Valid permits (more than 30 days)
    (project1_id, 'Insurance Coverage', CURRENT_DATE + INTERVAL '180 days'),
    (project2_id, 'Contractor License', CURRENT_DATE + INTERVAL '365 days'),
    (project2_id, 'Development Order', CURRENT_DATE + INTERVAL '545 days'),
    (project5_id, 'Approved Building Plans', CURRENT_DATE + INTERVAL '730 days'),
    (project5_id, 'CIDB Registration', CURRENT_DATE + INTERVAL '365 days');
END $$;
