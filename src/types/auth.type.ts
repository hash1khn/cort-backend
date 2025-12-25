import { UserRole, UserStatus } from '../constants/user.constant';

// AuthenticatedUser interface uses types from constants for consistency
// Runtime enum values are defined in constants/user.constant.ts
// This approach keeps business logic constants separate from database types
export interface AuthenticatedUser {
  id: string; // User ID (UUID) - matches both Supabase auth.users.id and public.users.id
  email: string; // email from database (required in schema)
  phone: string | null; // phone from database (optional in schema, can be null)
  full_name: string; // full_name from database (required in schema)
  role: UserRole; // user_role enum from database (uses UserRole type from constants)
  company_id: number | null; // company_id from database (optional in schema, can be null)
  account_status: UserStatus | null; // status field from database (uses UserStatus type from constants)
}
