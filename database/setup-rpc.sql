-- Secure Functions (RPC)
-- Run this in Supabase SQL Editor to enable robust data creation

DROP FUNCTION IF EXISTS create_project_secure;

CREATE OR REPLACE FUNCTION create_project_secure(
  name text,
  status text,
  start_date date,
  end_date date
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with admin privileges
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
