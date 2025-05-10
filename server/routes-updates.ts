import { Router, Request, Response } from 'express';
import { storage } from './storage';
import { z } from 'zod';
import { insertCompanySchema } from '@shared/schema';

/**
 * Updated route handlers to consolidate employer and company functionality
 * These functions will be integrated into the main routes.ts file
 */

export function setupCompanyRoutes(router: Router) {
  /**
   * Get company profile for the authenticated user
   */
  router.get('/api/company/profile', async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      // Get user's company profile (previously used getEmployerProfile)
      const company = req.user.companyId 
        ? await storage.getCompany(req.user.companyId)
        : undefined;
      
      if (!company) {
        return res.status(404).json({ error: 'Company profile not found' });
      }
      
      res.json(company);
    } catch (error) {
      console.error('Error getting company profile:', error);
      res.status(500).json({ error: 'Failed to retrieve company profile' });
    }
  });

  /**
   * Save company profile draft
   */
  router.post('/api/company/profile/draft', async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const { draftData, step = 1, draftType = 'create' } = req.body;
      
      // Save draft for existing company or for a new one
      const draft = await storage.saveCompanyProfileDraft(
        req.user.id, 
        draftData, 
        req.user.companyId, 
        step,
        draftType
      );
      
      res.json(draft);
    } catch (error) {
      console.error('Error saving company profile draft:', error);
      res.status(500).json({ error: 'Failed to save company profile draft' });
    }
  });

  /**
   * Get company profile draft
   */
  router.get('/api/company/profile/draft', async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const draft = await storage.getCompanyProfileDraft(req.user.id, req.user.companyId);
      
      if (!draft) {
        return res.status(404).json({ error: 'No draft found' });
      }
      
      res.json(draft);
    } catch (error) {
      console.error('Error getting company profile draft:', error);
      res.status(500).json({ error: 'Failed to retrieve company profile draft' });
    }
  });

  /**
   * Submit company profile (apply draft)
   * This creates or updates the company profile and removes the draft
   */
  router.post('/api/company/profile/submit', async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      // Apply the current draft
      const company = await storage.applyCompanyProfileDraft(req.user.id);
      
      if (!company) {
        return res.status(404).json({ error: 'No company profile draft found to submit' });
      }
      
      res.json(company);
    } catch (error) {
      console.error('Error submitting company profile:', error);
      res.status(500).json({ error: 'Failed to submit company profile' });
    }
  });

  /**
   * Create a new company
   */
  router.post('/api/company', async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      // Validate company data
      const validatedData = insertCompanySchema.parse(req.body);
      
      // Create the company
      const company = await storage.createCompany(validatedData, req.user.id);
      
      res.status(201).json(company);
    } catch (error) {
      console.error('Error creating company:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to create company' });
    }
  });

  /**
   * Update a company
   */
  router.patch('/api/company/:id', async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const companyId = parseInt(req.params.id);
      
      // Check if user is authorized to update this company
      if (req.user.companyId !== companyId) {
        return res.status(403).json({ error: 'You are not authorized to update this company' });
      }
      
      // Update the company
      const company = await storage.updateCompany(companyId, req.body);
      
      res.json(company);
    } catch (error) {
      console.error('Error updating company:', error);
      res.status(500).json({ error: 'Failed to update company' });
    }
  });

  /**
   * Get company team members
   */
  router.get('/api/company/:id/team', async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const companyId = parseInt(req.params.id);
      
      // Check if user is authorized to view team members
      if (req.user.companyId !== companyId) {
        return res.status(403).json({ error: 'You are not authorized to view this company team' });
      }
      
      const teamMembers = await storage.getCompanyTeamMembers(companyId);
      
      res.json(teamMembers);
    } catch (error) {
      console.error('Error getting company team members:', error);
      res.status(500).json({ error: 'Failed to retrieve company team members' });
    }
  });

  /**
   * Create a company invite
   */
  router.post('/api/company/:id/invites', async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const companyId = parseInt(req.params.id);
      
      // Check if user is authorized to create invites
      if (req.user.companyId !== companyId) {
        return res.status(403).json({ error: 'You are not authorized to create invites for this company' });
      }
      
      // Create invite with data from request body
      const invite = await storage.createCompanyInvite({
        ...req.body,
        companyId,
        inviterId: req.user.id
      });
      
      res.status(201).json(invite);
    } catch (error) {
      console.error('Error creating company invite:', error);
      res.status(500).json({ error: 'Failed to create company invite' });
    }
  });

  /**
   * Get company invites
   */
  router.get('/api/company/:id/invites', async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const companyId = parseInt(req.params.id);
      
      // Check if user is authorized to view invites
      if (req.user.companyId !== companyId) {
        return res.status(403).json({ error: 'You are not authorized to view invites for this company' });
      }
      
      const invites = await storage.getCompanyInvites(companyId);
      
      res.json(invites);
    } catch (error) {
      console.error('Error getting company invites:', error);
      res.status(500).json({ error: 'Failed to retrieve company invites' });
    }
  });

  /**
   * Delete a company invite
   */
  router.delete('/api/company/invites/:id', async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const inviteId = req.params.id;
      
      // Get the invite to check authorization
      const invite = await storage.getCompanyInvite(inviteId);
      
      if (!invite) {
        return res.status(404).json({ error: 'Invite not found' });
      }
      
      // Check if user is authorized to delete this invite
      if (req.user.companyId !== invite.companyId) {
        return res.status(403).json({ error: 'You are not authorized to delete this invite' });
      }
      
      await storage.deleteCompanyInvite(inviteId);
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting company invite:', error);
      res.status(500).json({ error: 'Failed to delete company invite' });
    }
  });

  /**
   * Update a user's role in a company
   */
  router.patch('/api/company/:companyId/users/:userId/role', async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const companyId = parseInt(req.params.companyId);
      const userId = parseInt(req.params.userId);
      const { role } = req.body;
      
      // Check if user is authorized to update roles (must be admin)
      if (req.user.companyId !== companyId || req.user.companyRole !== 'admin') {
        return res.status(403).json({ error: 'You are not authorized to update user roles' });
      }
      
      const updatedUser = await storage.updateUserCompanyRole(userId, companyId, role);
      
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({ error: 'Failed to update user role' });
    }
  });

  /**
   * Remove a user from a company
   */
  router.delete('/api/company/:companyId/users/:userId', async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const companyId = parseInt(req.params.companyId);
      const userId = parseInt(req.params.userId);
      
      // Check if user is authorized to remove users (must be admin)
      if (req.user.companyId !== companyId || req.user.companyRole !== 'admin') {
        return res.status(403).json({ error: 'You are not authorized to remove users from this company' });
      }
      
      // Cannot remove yourself
      if (userId === req.user.id) {
        return res.status(400).json({ error: 'You cannot remove yourself from the company' });
      }
      
      await storage.removeUserFromCompany(userId, companyId);
      
      res.status(204).end();
    } catch (error) {
      console.error('Error removing user from company:', error);
      res.status(500).json({ error: 'Failed to remove user from company' });
    }
  });
}