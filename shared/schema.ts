import { pgTable, text, serial, integer, boolean, timestamp, varchar, uuid, jsonb, json, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

export const USER_TYPES = {
  JOBSEEKER: 'jobseeker',
  EMPLOYER: 'employer'
} as const;

export type UserType = (typeof USER_TYPES)[keyof typeof USER_TYPES];

// Match status constants
export const MATCH_STATUS = {
  NEW: 'new',                     // Initial match state
  CONNECTED: 'connected',         // Users have initiated communication
  CHATTING: 'chatting',           // Active conversation in progress
  INTERVIEW_SCHEDULED: 'interview_scheduled', // Interview has been scheduled
  REJECTED: 'rejected',           // One party rejected the match
  ARCHIVED: 'archived',           // Match archived/no longer active
  HIRED: 'hired'                  // Jobseeker was hired
} as const;

export type MatchStatus = (typeof MATCH_STATUS)[keyof typeof MATCH_STATUS];

// === COMPANY TABLE ===

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  adminName: text("admin_name"),
  adminEmail: text("admin_email"),
  adminPhone: text("admin_phone"),
  website: text("website"),
  careersUrl: text("careers_url"),
  headquarters: text("headquarters"),
  yearFounded: integer("year_founded"), 
  size: text("size"),
  industries: jsonb("industries").$type<string[]>(),
  functionalAreas: jsonb("functional_areas").$type<string[]>(),
  additionalOffices: jsonb("additional_offices").$type<string[]>(),
  workArrangements: jsonb("work_arrangements").$type<string[]>(),
  compensationLevel: text("compensation_level"),
  about: text("about"),
  culture: text("culture"),
  mission: text("mission"),
  values: text("values"),
  benefits: jsonb("benefits").$type<string[]>(),
  additionalBenefits: text("additional_benefits"),
  hasInterns: boolean("has_interns").default(false),
  internDuration: text("intern_duration"),
  internDescription: text("intern_description"),
  internLeadsToFulltime: boolean("intern_leads_to_fulltime").default(false),
  hasApprentices: boolean("has_apprentices").default(false),
  apprenticeDuration: text("apprentice_duration"),
  apprenticeDescription: text("apprentice_description"),
  hasDevelopmentPrograms: boolean("has_development_programs").default(false),
  developmentProgramDuration: text("development_program_duration"),
  developmentProgramDescription: text("development_program_description"),
  logo: text("logo"),
  profileCompletion: integer("profile_completion").default(0),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const companiesRelations = relations(companies, ({ many }) => ({
  employees: many(users),
  jobPostings: many(jobPostings),
  companyInvites: many(companyInvites)
}));

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isVerified: true,
});

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

// === COMPANY PROFILE DRAFTS ===

export const companyProfileDrafts = pgTable("company_profile_drafts", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: integer("company_id").references(() => companies.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  draftData: jsonb("draft_data").$type<any>().notNull(),
  step: integer("step").default(1),
  draftType: text("draft_type").default("create"), // 'create' or 'edit'
  lastActive: timestamp("last_active").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    // Unique constraint: One draft per user per company
    userCompanyUnique: unique().on(table.userId, table.companyId),
  }
});

export const companyProfileDraftsRelations = relations(companyProfileDrafts, ({ one }) => ({
  company: one(companies, {
    fields: [companyProfileDrafts.companyId],
    references: [companies.id],
  }),
  user: one(users, {
    fields: [companyProfileDrafts.userId],
    references: [users.id],
  }),
}));

export const insertCompanyProfileDraftSchema = createInsertSchema(companyProfileDrafts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCompanyProfileDraft = z.infer<typeof insertCompanyProfileDraftSchema>;
export type CompanyProfileDraft = typeof companyProfileDrafts.$inferSelect;

// === COMPANY INVITES ===

export const companyInvites = pgTable("company_invites", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  inviterId: integer("inviter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  role: text("role").default("recruiter"),
  status: text("status").notNull().default("pending"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const companyInvitesRelations = relations(companyInvites, ({ one }) => ({
  company: one(companies, {
    fields: [companyInvites.companyId],
    references: [companies.id],
  }),
  inviter: one(users, {
    fields: [companyInvites.inviterId],
    references: [users.id],
  }),
}));

export const insertCompanyInviteSchema = createInsertSchema(companyInvites).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCompanyInvite = z.infer<typeof insertCompanyInviteSchema>;
export type CompanyInvite = typeof companyInvites.$inferSelect;

// === USER TABLES ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  userType: text("user_type").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  companyName: text("company_name"),
  companyId: integer("company_id").references(() => companies.id),
  companyRole: text("company_role").default("recruiter"),
  email: text("email"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
  jobseekerProfile: one(jobseekerProfiles, {
    fields: [users.id],
    references: [jobseekerProfiles.userId],
  }),
  employerProfile: one(employerProfiles, {
    fields: [users.id],
    references: [employerProfiles.userId],
  }),
  jobseekerSwipes: many(swipes, {
    relationName: "jobseekerSwipes",
  }),
  employerSwipes: many(swipes, {
    relationName: "employerSwipes",
  }),
  jobPostings: many(jobPostings),
  sentInvites: many(companyInvites)
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  userType: true,
  firstName: true,
  lastName: true,
  companyName: true,
  email: true,
  phone: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// === JOBSEEKER PROFILES ===

export const jobseekerProfiles = pgTable("jobseeker_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  schoolEmail: text("school_email"),
  school: text("school"),
  degreeLevel: text("degree_level"),
  major: text("major"),
  portfolioUrl: text("portfolio_url"),
  preferredLocations: jsonb("preferred_locations").$type<string[]>(),
  workArrangements: jsonb("work_arrangements").$type<string[]>(),
  industryPreferences: jsonb("industry_preferences").$type<string[]>().default([]),
  functionalPreferences: text("functional_preferences").default(''),
  sliderValues: jsonb("slider_values").$type<Record<string, number>>(),
  viewedBy: jsonb("viewed_by").$type<number[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const jobseekerProfilesRelations = relations(jobseekerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [jobseekerProfiles.userId],
    references: [users.id],
  }),
}));

export const insertJobseekerProfileSchema = createInsertSchema(jobseekerProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertJobseekerProfile = z.infer<typeof insertJobseekerProfileSchema>;
export type JobseekerProfile = typeof jobseekerProfiles.$inferSelect;

// === JOBSEEKER PROFILE DRAFTS ===

export const jobseekerProfileDrafts = pgTable("jobseeker_profile_drafts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  draftData: jsonb("draft_data").$type<any>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const jobseekerProfileDraftsRelations = relations(jobseekerProfileDrafts, ({ one }) => ({
  user: one(users, {
    fields: [jobseekerProfileDrafts.userId],
    references: [users.id],
  }),
}));

export const insertJobseekerProfileDraftSchema = createInsertSchema(jobseekerProfileDrafts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertJobseekerProfileDraft = z.infer<typeof insertJobseekerProfileDraftSchema>;
export type JobseekerProfileDraft = typeof jobseekerProfileDrafts.$inferSelect;

// === EMPLOYER PROFILES ===

export const employerProfiles = pgTable("employer_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  companyName: text("company_name"),
  companyWebsite: text("company_website"),
  headquarters: text("headquarters"),
  yearFounded: integer("year_founded"),
  companySize: text("company_size"),
  companyIndustry: text("company_industry"),
  aboutCompany: text("about_company"),
  additionalOffices: jsonb("additional_offices").$type<string[]>(),
  companyMission: text("company_mission"),
  companyValues: text("company_values"),
  benefits: jsonb("benefits").$type<string[]>(),
  additionalBenefits: text("additional_benefits"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const employerProfilesRelations = relations(employerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [employerProfiles.userId],
    references: [users.id],
  }),
  jobPostings: many(jobPostings),
}));

export const insertEmployerProfileSchema = createInsertSchema(employerProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertEmployerProfile = z.infer<typeof insertEmployerProfileSchema>;
export type EmployerProfile = typeof employerProfiles.$inferSelect;

// === EMPLOYER PROFILE DRAFTS ===

export const employerProfileDrafts = pgTable("employer_profile_drafts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  draftData: jsonb("draft_data").$type<any>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const employerProfileDraftsRelations = relations(employerProfileDrafts, ({ one }) => ({
  user: one(users, {
    fields: [employerProfileDrafts.userId],
    references: [users.id],
  }),
}));

export const insertEmployerProfileDraftSchema = createInsertSchema(employerProfileDrafts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertEmployerProfileDraft = z.infer<typeof insertEmployerProfileDraftSchema>;
export type EmployerProfileDraft = typeof employerProfileDrafts.$inferSelect;

// === JOB POSTINGS ===

export const jobPostings = pgTable("job_postings", {
  id: uuid("id").defaultRandom().primaryKey(),
  employerId: integer("employer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  companyId: integer("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  employmentType: text("employment_type").notNull(), // Full-time, Part-time, Contract, Internship
  workType: text("work_type").notNull(), // Remote, Hybrid, Onsite
  department: text("department"),
  requirements: jsonb("requirements").$type<string[]>(),
  responsibilities: jsonb("responsibilities").$type<string[]>(),
  status: text("status").notNull().default('active'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const jobPostingsRelations = relations(jobPostings, ({ one }) => ({
  employer: one(users, {
    fields: [jobPostings.employerId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [jobPostings.companyId],
    references: [companies.id],
  }),
  employerProfile: one(employerProfiles, {
    fields: [jobPostings.employerId],
    references: [employerProfiles.userId],
  }),
}));

export const insertJobPostingSchema = createInsertSchema(jobPostings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertJobPosting = z.infer<typeof insertJobPostingSchema>;
export type JobPosting = typeof jobPostings.$inferSelect;

// === SWIPES ===

export const swipes = pgTable("swipes", {
  id: uuid("id").defaultRandom().primaryKey(),
  jobseekerId: integer("jobseeker_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  employerId: integer("employer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  interested: boolean("interested").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    // Ensure a user can't swipe on the same profile twice (unique combination of users)
    uniqueSwipe: unique().on(
      table.jobseekerId, 
      table.employerId
    ),
  }
});

export const swipesRelations = relations(swipes, ({ one }) => ({
  jobseeker: one(users, {
    fields: [swipes.jobseekerId],
    references: [users.id],
    relationName: "jobseekerSwipes",
  }),
  employer: one(users, {
    fields: [swipes.employerId],
    references: [users.id],
    relationName: "employerSwipes",
  })
  // Note: Removed company and jobPosting relations as these fields don't exist in the database
}));

export const insertSwipeSchema = createInsertSchema(swipes).omit({
  id: true,
  createdAt: true,
});

export type InsertSwipe = z.infer<typeof insertSwipeSchema>;
export type Swipe = typeof swipes.$inferSelect;

// === MATCHES ===

export const matches = pgTable("matches", {
  id: uuid("id").defaultRandom().primaryKey(),
  jobseekerId: integer("jobseeker_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  employerId: integer("employer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  matchedAt: timestamp("matched_at").defaultNow(),
  status: text("status").notNull().default(MATCH_STATUS.NEW),
  jobPostingId: uuid("job_posting_id").references(() => jobPostings.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    // Ensure uniqueness of matches (one match per jobseeker-employer pair)
    uniqueMatch: unique().on(
      table.jobseekerId, 
      table.employerId
    ),
  }
});

export const matchesRelations = relations(matches, ({ one }) => ({
  jobseeker: one(users, {
    fields: [matches.jobseekerId],
    references: [users.id],
  }),
  employer: one(users, {
    fields: [matches.employerId],
    references: [users.id],
  }),
  jobPosting: one(jobPostings, {
    fields: [matches.jobPostingId],
    references: [jobPostings.id],
  })
  // Note: Removed company relation as this field doesn't exist in the database
}));

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  matchedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;
