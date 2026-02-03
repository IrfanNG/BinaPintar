import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// User Roles
export type UserRole = 'admin' | 'supervisor' | 'subcontractor' | 'client';

// Database types
export interface Project {
  id: string;
  name: string;
  status: 'Active' | 'Completed';
  start_date: string;
  end_date: string | null;
  created_at: string;
}

export interface Permit {
  id: string;
  project_id: string;
  doc_name: string;
  expiry_date: string;
  created_at: string;
  project?: Project;
}

export interface SiteLog {
  id: string;
  project_id: string;
  supervisor_id: string | null;
  description: string;
  photo_url: string | null;
  metadata?: {
    latitude?: number;
    longitude?: number;
    timestamp?: string;
    device?: string;
  };
  created_at: string;
}

export interface Claim {
  id: string;
  project_id: string;
  amount: number;
  description: string;
  status: 'Pending' | 'Approved' | 'Paid';
  proof_url: string | null;
  submitted_by: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
  project?: Project;
}

export interface Notification {
  id: string;
  user_id: string | null;
  type: 'site_log' | 'permit_expiry' | 'claim_update';
  title: string;
  message: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string | null;
  role: UserRole;
  full_name: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  site_log_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: UserProfile;
}

// Role Permissions Map
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['read_all', 'write_all', 'approve_claims', 'manage_users', 'delete_records'],
  supervisor: ['create_site_logs', 'view_projects', 'view_permits', 'read_own_logs'],
  subcontractor: ['submit_claims', 'read_own_claims', 'view_assigned_projects'],
  client: ['view_assigned_projects', 'view_logs', 'view_payment_status'],
};

// Helper to check if role has permission
export function hasPermission(role: UserRole | null, permission: string): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
