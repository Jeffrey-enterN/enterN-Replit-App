# Employer and Company Tables Migration Guide

This guide outlines the process of merging the `employer_profiles` and `employer_profile_drafts` tables into the `companies` and `company_profile_drafts` tables to eliminate duplicate data structures.

## Background

The current database structure has separate tables for companies and employer profiles, leading to duplicated information and complexity. This migration consolidates this data into a single company-centered data model.

## Migration Files

The migration consists of the following files:

1. **migrations/merge-employer-company.ts** - Migrates data from employer_profiles to companies
2. **migrations/remove-employer-tables.ts** - Removes the employer tables after migration
3. **scripts/migrate-employer-company.ts** - Main script that orchestrates the migration
4. **server/storage-updates.ts** - Contains updated storage methods
5. **server/routes-updates.ts** - Contains updated route handlers

## Migration Process

### Step 1: Backup Your Database

Before running any migration, make sure to back up your database:

```bash
# Backup your database using pg_dump or Neon's backup functionality
# Example with pg_dump:
pg_dump $DATABASE_URL > database_backup.sql
```

### Step 2: Run the Migration Script

```bash
# Run the migration script
npx tsx scripts/migrate-employer-company.ts
```

This script will:

1. Merge employer_profiles data into companies
2. Update schema.ts to comment out employer_profiles and employer_profile_drafts tables
3. Remove the employer_profiles and employer_profile_drafts tables from the database

The script will ask for confirmation at each step.

### Step 3: Integrate the Updated Storage Methods

Once the migration is complete, you need to integrate the new storage methods from `server/storage-updates.ts` into your main `server/storage.ts` file.

The key methods to replace are:

- `getEmployerProfile` → `getCompanyByUserId`
- `createEmployerProfile` → `createCompany`
- `saveEmployerProfileDraft` → `saveCompanyProfileDraft`
- `getEmployerProfileDraft` → `getCompanyProfileDraft`

### Step 4: Integrate the Updated Route Handlers

Similarly, you need to integrate the route handlers from `server/routes-updates.ts` into your main `server/routes.ts` file. The new route handlers redirect employer-related operations to company-related endpoints.

### Step 5: Update Frontend Code

Update any frontend code that relies on the old API endpoints:

- `/api/employer/profile` → `/api/company/profile`
- `/api/employer/profile/draft` → `/api/company/profile/draft`

The most important update is to ensure that form submissions to save drafts and profiles use the new endpoints.

## Changes to How Drafts Work

The new implementation simplifies how drafts work:

1. Drafts are stored in the `company_profile_drafts` table
2. When a user completes their profile, the draft data is applied to the actual company record
3. The draft is then deleted to avoid data duplication

This approach keeps the database cleaner and ensures the single source of truth is the company record itself.

## Rollback Plan

If the migration fails or causes issues:

1. Restore your database from the backup
2. Revert any changes to schema.ts
3. Revert any changes to storage.ts and routes.ts

## Support

If you encounter any issues during or after the migration, please contact the development team for assistance.