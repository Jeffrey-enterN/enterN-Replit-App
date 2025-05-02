import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

/**
 * Check if user is an employer
 */
export function requireEmployer(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (req.user.userType !== 'employer') {
    return res.status(403).json({ message: 'Employer access required' });
  }

  next();
}

/**
 * Check if user is a company admin
 */
export async function requireCompanyAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (req.user.userType !== 'employer') {
    return res.status(403).json({ message: 'Employer access required' });
  }

  if (!req.user.companyId) {
    return res.status(403).json({ message: 'Company access required' });
  }

  if (req.user.companyRole !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
}

/**
 * Check if user belongs to any company
 */
export function requireCompanyMember(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (req.user.userType !== 'employer') {
    return res.status(403).json({ message: 'Employer access required' });
  }

  if (!req.user.companyId) {
    return res.status(403).json({ message: 'Company membership required' });
  }

  next();
}

/**
 * Check if user can manage a specific job posting
 */
export async function canManageJobPosting(req: Request, res: Response, next: NextFunction) {
  const jobId = req.params.jobId;
  
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (req.user.userType !== 'employer') {
    return res.status(403).json({ message: 'Employer access required' });
  }

  try {
    const job = await storage.getJobPosting(jobId);
    
    if (!job) {
      return res.status(404).json({ message: 'Job posting not found' });
    }
    
    // Admins can manage all job postings for their company
    if (req.user.companyRole === 'admin' && req.user.companyId === job.companyId) {
      return next();
    }
    
    // Regular recruiters can only manage their own job postings
    if (job.employerId === req.user.id) {
      return next();
    }
    
    return res.status(403).json({ message: 'You do not have permission to manage this job posting' });
  } catch (error) {
    console.error('Error checking job posting permissions:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}