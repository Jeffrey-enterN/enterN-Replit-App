import { db } from './db';
import {
  companies,
  companyProfileDrafts,
  users,
  insertCompanySchema,
  Company,
  CompanyProfileDraft,
  companyInvites,
  CompanyInvite
} from '@shared/schema';
import { eq, and, sql, desc, asc } from 'drizzle-orm';

/**
 * Updated storage methods to consolidate employer and company functionality
 * This file contains refactored methods that will replace current methods in storage.ts
 */

/**
 * Get a company by ID
 */
export async function getCompany(companyId: number): Promise<Company | undefined> {
  const [company] = await db.select().from(companies).where(eq(companies.id, companyId));
  return company;
}

/**
 * Get a company profile by user ID (employer)
 * This replaces both getCompany and getEmployerProfile
 */
export async function getCompanyByUserId(userId: number): Promise<Company | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  
  if (!user || !user.companyId) {
    return undefined;
  }
  
  return getCompany(user.companyId);
}

/**
 * Create a new company profile
 */
export async function createCompany(companyData: any, creatorUserId: number): Promise<Company> {
  // Use the insert schema to validate data
  const validatedData = insertCompanySchema.parse(companyData);
  
  // Begin a transaction
  return await db.transaction(async (tx) => {
    // Create the company
    const [company] = await tx
      .insert(companies)
      .values(validatedData)
      .returning();
    
    // Update the creator user to be associated with this company
    await tx
      .update(users)
      .set({ 
        companyId: company.id,
        companyRole: 'admin', // Set creator as admin
        updatedAt: new Date()
      })
      .where(eq(users.id, creatorUserId));
    
    return company;
  });
}

/**
 * Update an existing company profile
 */
export async function updateCompany(companyId: number, companyData: any): Promise<Company> {
  // Only update fields that exist in the schema
  const [updatedCompany] = await db
    .update(companies)
    .set({
      ...companyData,
      updatedAt: new Date()
    })
    .where(eq(companies.id, companyId))
    .returning();
    
  return updatedCompany;
}

/**
 * Save company profile draft data
 * This method will be used for all company profile editing
 */
export async function saveCompanyProfileDraft(
  userId: number, 
  draftData: any, 
  companyId?: number, 
  step?: number, 
  draftType: string = 'create'
): Promise<CompanyProfileDraft> {
  // If no company ID was provided, check if the user is already associated with a company
  if (!companyId) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (user && user.companyId) {
      companyId = user.companyId;
      draftType = 'edit'; // If user already has a company, it's an edit
    }
  }
  
  // Look for an existing draft
  const existingDraft = await getCompanyProfileDraft(userId, companyId);
  
  if (existingDraft) {
    // Update existing draft
    const [updatedDraft] = await db
      .update(companyProfileDrafts)
      .set({
        draftData: draftData,
        step: step || existingDraft.step,
        draftType: draftType,
        lastActive: new Date(),
        updatedAt: new Date()
      })
      .where(
        and(
          eq(companyProfileDrafts.userId, userId),
          companyId 
            ? eq(companyProfileDrafts.companyId, companyId) 
            : sql`${companyProfileDrafts.companyId} IS NULL`
        )
      )
      .returning();
      
    return updatedDraft;
  } else {
    // Create new draft
    const [newDraft] = await db
      .insert(companyProfileDrafts)
      .values({
        userId: userId,
        companyId: companyId,
        draftData: draftData,
        step: step || 1,
        draftType: draftType,
        lastActive: new Date()
      })
      .returning();
      
    return newDraft;
  }
}

/**
 * Get a company profile draft
 */
export async function getCompanyProfileDraft(
  userId: number, 
  companyId?: number
): Promise<CompanyProfileDraft | undefined> {
  // Build a query condition that accounts for possible null companyId
  const condition = companyId 
    ? and(
        eq(companyProfileDrafts.userId, userId), 
        eq(companyProfileDrafts.companyId, companyId)
      )
    : and(
        eq(companyProfileDrafts.userId, userId), 
        sql`${companyProfileDrafts.companyId} IS NULL`
      );
  
  const [draft] = await db
    .select()
    .from(companyProfileDrafts)
    .where(condition)
    .orderBy(desc(companyProfileDrafts.updatedAt))
    .limit(1);
    
  return draft;
}

/**
 * Apply a company profile draft to create or update a company profile
 * This method will be called when a user completes their profile
 */
export async function applyCompanyProfileDraft(userId: number): Promise<Company | undefined> {
  // Get the user to find their company id
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) {
    return undefined;
  }
  
  // Get the draft
  let companyId = user.companyId;
  const draft = await getCompanyProfileDraft(userId, companyId);
  
  if (!draft) {
    return companyId ? await getCompany(companyId) : undefined;
  }
  
  // Apply the draft data
  return await db.transaction(async (tx) => {
    let company: Company;
    
    if (draft.draftType === 'create' || !companyId) {
      // Creating a new company
      const [newCompany] = await tx
        .insert(companies)
        .values({
          ...draft.draftData,
          // Set default name if no name provided
          name: draft.draftData.name || user.companyName || 'Unnamed Company'
        })
        .returning();
        
      company = newCompany;
      
      // Update the user with the new company ID
      await tx
        .update(users)
        .set({ 
          companyId: company.id,
          companyRole: 'admin', // Set as admin for new company
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
    } else {
      // Updating an existing company
      const [updatedCompany] = await tx
        .update(companies)
        .set({
          ...draft.draftData,
          updatedAt: new Date()
        })
        .where(eq(companies.id, companyId!))
        .returning();
        
      company = updatedCompany;
    }
    
    // Delete the draft since it's been applied
    await tx
      .delete(companyProfileDrafts)
      .where(eq(companyProfileDrafts.id, draft.id));
      
    return company;
  });
}

/**
 * Get team members for a company
 */
export async function getCompanyTeamMembers(companyId: number): Promise<any[]> {
  const teamMembers = await db
    .select({
      id: users.id,
      username: users.username,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      companyRole: users.companyRole,
      createdAt: users.createdAt
    })
    .from(users)
    .where(eq(users.companyId, companyId))
    .orderBy(asc(users.id));
    
  return teamMembers;
}

/**
 * Create a company invite
 */
export async function createCompanyInvite(inviteData: any): Promise<CompanyInvite> {
  const [invite] = await db
    .insert(companyInvites)
    .values(inviteData)
    .returning();
    
  return invite;
}

/**
 * Get company invites
 */
export async function getCompanyInvites(companyId: number): Promise<CompanyInvite[]> {
  return await db
    .select()
    .from(companyInvites)
    .where(eq(companyInvites.companyId, companyId))
    .orderBy(desc(companyInvites.createdAt));
}

/**
 * Get a specific company invite by ID
 */
export async function getCompanyInvite(inviteId: string): Promise<CompanyInvite | undefined> {
  const [invite] = await db
    .select()
    .from(companyInvites)
    .where(eq(companyInvites.id, inviteId));
    
  return invite;
}

/**
 * Delete a company invite
 */
export async function deleteCompanyInvite(inviteId: string): Promise<void> {
  await db
    .delete(companyInvites)
    .where(eq(companyInvites.id, inviteId));
}

/**
 * Update a company invite
 */
export async function updateCompanyInvite(inviteId: string, updateData: Partial<CompanyInvite>): Promise<CompanyInvite> {
  const [updatedInvite] = await db
    .update(companyInvites)
    .set({
      ...updateData,
      updatedAt: new Date()
    })
    .where(eq(companyInvites.id, inviteId))
    .returning();
    
  return updatedInvite;
}

/**
 * Update a user's company role
 */
export async function updateUserCompanyRole(userId: number, companyId: number, role: string): Promise<any> {
  const [updatedUser] = await db
    .update(users)
    .set({
      companyRole: role,
      updatedAt: new Date()
    })
    .where(
      and(
        eq(users.id, userId),
        eq(users.companyId, companyId)
      )
    )
    .returning();
    
  return updatedUser;
}

/**
 * Remove a user from a company
 */
export async function removeUserFromCompany(userId: number, companyId: number): Promise<void> {
  await db
    .update(users)
    .set({
      companyId: null,
      companyRole: null,
      updatedAt: new Date()
    })
    .where(
      and(
        eq(users.id, userId),
        eq(users.companyId, companyId)
      )
    );
}