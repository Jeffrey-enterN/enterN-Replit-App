import { User } from '@shared/schema';

// Permission types that can be checked
export type Permission = 
  | 'manage_company_profile'
  | 'invite_team_members'
  | 'manage_team_members'
  | 'view_all_job_postings'
  | 'manage_all_job_postings'
  | 'manage_own_job_postings'
  | 'view_company_statistics';

/**
 * Check if the current user has the requested permission
 */
export function hasPermission(user: User | null | undefined, permission: Permission): boolean {
  if (!user) return false;
  
  // User types and their default permissions
  if (user.userType !== 'employer') return false;
  
  // Company role-based permissions
  const isAdmin = user.companyRole === 'admin';
  
  switch (permission) {
    // Company profile permissions
    case 'manage_company_profile':
      return isAdmin;
    
    // Team management permissions  
    case 'invite_team_members':
      return isAdmin;
    case 'manage_team_members':
      return isAdmin;
    
    // Job posting permissions
    case 'view_all_job_postings':
      return isAdmin;
    case 'manage_all_job_postings':
      return isAdmin;
    case 'manage_own_job_postings':
      return true; // All employer users can manage their own job postings
    
    // Analytics permissions
    case 'view_company_statistics':
      return isAdmin;
    
    default:
      return false;
  }
}

/**
 * Check if the current user can manage a specific job posting
 */
export function canManageJobPosting(
  user: User | null | undefined, 
  jobPostingEmployerId: number
): boolean {
  if (!user) return false;
  
  // Admins can manage all job postings for their company
  if (user.companyRole === 'admin') return true;
  
  // Regular recruiters can only manage their own job postings
  return user.id === jobPostingEmployerId;
}