import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const USER_TYPES = {
  JOBSEEKER: 'jobseeker',
  EMPLOYER: 'employer'
} as const;

export type UserType = (typeof USER_TYPES)[keyof typeof USER_TYPES];

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  userType: text("user_type").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  companyName: text("company_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  userType: true,
  firstName: true,
  lastName: true,
  companyName: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Jobseeker Profile Schema
export interface JobseekerProfile {
  id: string;
  userId: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  schoolEmail?: string;
  school?: string;
  degreeLevel?: string;
  major?: string;
  preferredLocations?: string[];
  workArrangements?: string[];
  summary?: string;
  sliderValues?: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

// Employer Profile Schema
export interface EmployerProfile {
  id: string;
  userId: number;
  companyName?: string;
  companyWebsite?: string;
  headquarters?: string;
  yearFounded?: number;
  companySize?: string;
  companyIndustry?: string;
  aboutCompany?: string;
  additionalOffices?: string[];
  companyMission?: string;
  companyValues?: string;
  benefits?: string[];
  additionalBenefits?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Job Posting Schema
export interface JobPosting {
  id: string;
  employerId: number;
  title: string;
  description: string;
  location: string;
  employmentType: string; // Full-time, Part-time, Contract, Internship
  workType: string; // Remote, Hybrid, Onsite
  department?: string;
  requirements?: string[];
  responsibilities?: string[];
  status: 'active' | 'filled' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

// Swipe Schema (for tracking left/right swipes)
export interface Swipe {
  id: string;
  jobseekerId: number;
  employerId: string;
  interested: boolean; // true = right swipe, false = left swipe
  createdAt: Date;
}

// Match Schema (when both parties swipe right)
export interface Match {
  id: string;
  jobseekerId: number;
  employerId: string;
  matchedAt: Date;
  status: 'new' | 'job_shared' | 'interview_scheduled' | 'offer_made' | 'closed';
  jobPostingId?: string;
}
