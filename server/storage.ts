import { 
  users, 
  User, 
  InsertUser, 
  JobseekerProfile,
  jobseekerProfiles,
  InsertJobseekerProfile,
  jobseekerProfileDrafts,
  JobseekerProfileDraft,
  Match,
  matches,
  InsertMatch,
  JobPosting,
  jobPostings,
  InsertJobPosting,
  Swipe,
  swipes,
  InsertSwipe,
  companies,
  Company,
  InsertCompany,
  companyInvites,
  CompanyInvite,
  InsertCompanyInvite,
  MATCH_STATUS,
  MatchStatus
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, isNotNull } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

// Define the SessionStore type
type SessionStore = session.Store;

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  
  // Jobseeker profile methods
  createJobseekerProfile(userId: number, profileData: any): Promise<JobseekerProfile>;
  saveJobseekerProfileDraft(userId: number, draftData: any): Promise<any>;
  getJobseekerProfile(userId: number): Promise<JobseekerProfile | undefined>;
  getJobseekerProfileDraft(userId: number): Promise<any | undefined>;
  getJobseekerDashboard(userId: number): Promise<any>;
  getJobseekerPotentialMatches(userId: number): Promise<any[]>;
  handleJobseekerSwipe(jobseekerId: number, employerId: string, interested: boolean): Promise<any>;
  getJobseekerRecentMatches(userId: number): Promise<any[]>;
  recordJobseekerProfileView(jobseekerId: number, viewerId: number): Promise<void>;
  resetJobseekerSwipes(jobseekerId: number): Promise<{ count: number }>;

  // Employer profile methods
  createEmployerProfile(userId: number, profileData: any): Promise<any>;
  saveEmployerProfileDraft(userId: number, draftData: any): Promise<any>;
  getEmployerProfile(userId: number): Promise<any>;
  getEmployerDashboard(userId: number): Promise<any>;
  getEmployerPotentialMatches(userId: number): Promise<any[]>;
  handleEmployerSwipe(employerId: number, jobseekerId: string, interested: boolean): Promise<any>;
  getEmployerRecentMatches(userId: number): Promise<any[]>;
  
  // Company methods
  getCompany(companyId: number): Promise<Company | undefined>;
  createCompany(companyData: any, creatorUserId: number): Promise<Company>;
  updateCompany(companyId: number, companyData: any): Promise<Company>;
  getCompanyTeamMembers(companyId: number): Promise<any[]>;
  createCompanyInvite(inviteData: any): Promise<CompanyInvite>;
  getCompanyInvites(companyId: number): Promise<CompanyInvite[]>;
  getCompanyInvite(inviteId: string): Promise<CompanyInvite | undefined>;
  deleteCompanyInvite(inviteId: string): Promise<void>;
  updateCompanyInvite(inviteId: string, updateData: Partial<CompanyInvite>): Promise<CompanyInvite>;
  updateUserCompanyRole(userId: number, companyId: number, role: string): Promise<User>;
  removeUserFromCompany(userId: number, companyId: number): Promise<void>;
  saveCompanyProfileDraft(userId: number, draftData: any, companyId?: number, step?: number, draftType?: string): Promise<any>;
  getCompanyProfileDraft(userId: number, companyId?: number): Promise<any | undefined>;
  submitCompanyProfileDraft(userId: number, draftId: string): Promise<Company>;
  
  // Job posting methods
  getJobPosting(jobId: string): Promise<JobPosting | undefined>;
  getEmployerJobPostings(userId: number): Promise<JobPosting[]>;
  getCompanyJobPostings(companyId: number): Promise<JobPosting[]>;
  createJobPosting(jobData: any): Promise<JobPosting>;
  updateJobPosting(jobId: string, jobData: any): Promise<JobPosting>;
  updateJobStatus(jobId: string, status: string): Promise<JobPosting>;
  deleteJobPosting(jobId: string): Promise<void>;

  // Session store
  sessionStore: SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private jobseekerProfiles: Map<number, JobseekerProfile>;
  private swipes: Swipe[];
  private matches: Match[];
  private jobPostings: Map<string, JobPosting>;
  private jobseekerProfileDrafts: Map<number, any>;
  private employerProfileDrafts: Map<number, any>;
  private companyProfileDrafts: Map<string, any>;
  private companies: Map<number, Company>;
  private companyInvites: CompanyInvite[];
  
  currentId: number;
  companyId: number;
  sessionStore: SessionStore;

  constructor() {
    this.users = new Map();
    this.jobseekerProfiles = new Map();
    this.swipes = [];
    this.matches = [];
    this.jobPostings = new Map();
    this.jobseekerProfileDrafts = new Map();
    this.employerProfileDrafts = new Map();
    this.companyProfileDrafts = new Map();
    this.companies = new Map();
    this.companyInvites = [];
    this.currentId = 1;
    this.companyId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    
    // Create a user with all required fields properly typed
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password,
      userType: insertUser.userType,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      companyName: insertUser.companyName || null,
      email: insertUser.email || null,
      phone: insertUser.phone || null,
      companyId: null,
      companyRole: null,
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser = { 
      ...user, 
      ...userData,
      updatedAt: new Date() 
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Jobseeker profile methods
  async createJobseekerProfile(userId: number, profileData: any): Promise<JobseekerProfile> {
    const profile: JobseekerProfile = {
      id: `jp_${Date.now()}`,
      userId,
      ...profileData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.jobseekerProfiles.set(userId, profile);
    return profile;
  }

  async saveJobseekerProfileDraft(userId: number, draftData: any): Promise<any> {
    const draft = {
      ...draftData,
      updatedAt: new Date()
    };
    this.jobseekerProfileDrafts.set(userId, draft);
    return draft;
  }

  async getJobseekerProfile(userId: number): Promise<JobseekerProfile | undefined> {
    return this.jobseekerProfiles.get(userId);
  }
  
  async getJobseekerProfileDraft(userId: number): Promise<any | undefined> {
    return this.jobseekerProfileDrafts.get(userId);
  }
  
  async getEmployerProfileDraft(userId: number): Promise<any | undefined> {
    // Redirect to the getCompanyProfileDraft method
    // This ensures compatibility with the old API while using the new company structure
    return this.getCompanyProfileDraft(userId);
  }

  async getJobseekerDashboard(userId: number): Promise<any> {
    const profile = this.jobseekerProfiles.get(userId);
    const user = this.users.get(userId);
    
    // Calculate profile completion percentage based on completed steps
    // Step 1 = 33%, Step 2 = 66%, Step 3 = 100%
    let profileCompletionPercentage = 0;
    
    console.log("MEMORY - Calculating profile completion for " + userId);
    if (user && user.firstName && user.lastName && user.email) {
      profileCompletionPercentage = 33;
      console.log("User " + userId + " has completed Step 1 (33%)");
      
      // Check if we have education and portfolio info (step 2)
      if (profile) {
        // Education, functional preferences, industry preferences, and location preferences
        // should be filled out for step 2
        const hasEducation = profile.school && profile.degreeLevel;
        
        // Check functional preferences in different formats
        let hasFunctionalPreferences = false;
        if (profile.functionalPreferences) {
          if (Array.isArray(profile.functionalPreferences)) {
            hasFunctionalPreferences = profile.functionalPreferences.length > 0;
          } else if (typeof profile.functionalPreferences === 'string') {
            // If it's a string, check if it's not empty
            hasFunctionalPreferences = profile.functionalPreferences.trim() !== '';
          } else if (typeof profile.functionalPreferences === 'object') {
            // If it's an object, check if it has keys
            hasFunctionalPreferences = Object.keys(profile.functionalPreferences).length > 0;
          }
        }
        
        // Check industry preferences
        const hasIndustryPreferences = Array.isArray(profile.industryPreferences) && 
          profile.industryPreferences.length > 0;
        
        console.log("User " + userId + " step 2 checks:", { hasEducation, hasFunctionalPreferences, hasIndustryPreferences });
        
        if (hasEducation || hasFunctionalPreferences || hasIndustryPreferences) {
          profileCompletionPercentage = 66;
          console.log("User " + userId + " has completed Step 2 (66%)");
          
          // Check if we have slider values (step 3)
          let hasSliderValues = false;
          
          if (profile.sliderValues) {
            hasSliderValues = Object.keys(profile.sliderValues).length > 0;
          }
          
          console.log("User " + userId + " step 3 check - hasSliderValues:", hasSliderValues);
          
          if (hasSliderValues) {
            profileCompletionPercentage = 100;
            console.log("User " + userId + " has completed Step 3 (100%)");
          }
        }
      }
    }
    
    console.log("Profile completion for " + userId + ": " + profileCompletionPercentage + "%");
    const matches = this.matches.filter(match => match.jobseekerId === userId);
    
    // Get profile views count
    let profileViews = 0;
    if (profile?.viewedBy) {
      profileViews = profile.viewedBy.length;
    }
    
    return {
      stats: {
        profileCompletion: {
          percentage: profileCompletionPercentage,
          increase: profileCompletionPercentage > 0 ? 5 : 0 // Small increase if any progress
        },
        profileViews: profileViews,
        matches: matches.length
      },
      recentMatches: matches.slice(0, 5).map(match => {
        // First get the user
        const user = this.users.get(Number(match.employerId));
        // Then get their company
        const company = user?.companyId ? this.companies.get(user.companyId) : undefined;
        
        return {
          id: match.id,
          name: company?.name || user?.companyName || 'Unknown Company',
          matchDate: match.matchedAt,
          status: 'matched',
          statusText: 'New match'
        };
      })
    };
  }

  async getJobseekerPotentialMatches(userId: number): Promise<any[]> {
    // Get employers this jobseeker hasn't swiped on yet
    const swipedEmployerIds = this.swipes
      .filter(swipe => swipe.jobseekerId === userId)
      .map(swipe => swipe.employerId);
    
    // Get all users who are employers with companies
    const employerUsers = Array.from(this.users.values())
      .filter(user => 
        user.userType === 'employer' && 
        user.companyId && 
        !swipedEmployerIds.includes(user.id.toString()));
    
    // Get their companies
    const potentialEmployers = employerUsers
      .filter(user => user.companyId)
      .map(user => ({
        user,
        company: this.companies.get(user.companyId!)
      }))
      .filter(item => item.company) // Filter out users without companies
      .slice(0, 5); // Limit to 5 potential matches
    
    return potentialEmployers.map(({ user, company }) => {
      // Get job postings for this employer
      const jobPostings = Array.from(this.jobPostings.values())
        .filter(posting => posting.employerId === user.id)
        .map(posting => posting.title);
      
      return {
        id: user.id.toString(),
        name: company?.name || user.companyName || 'Unknown Company',
        location: company?.industries?.[0] || 'Various Industries',
        description: company?.about || 'No description available',
        positions: jobPostings.length > 0 ? jobPostings : []
      };
    });
  }

  async handleJobseekerSwipe(jobseekerId: number, employerId: string, interested: boolean): Promise<any> {
    // Convert employerId to proper type
    const swipe: Swipe = {
      id: `swipe_${Date.now()}_${jobseekerId}_${employerId}`,
      jobseekerId,
      employerId, // String type is correct here as per schema
      interested,
      createdAt: new Date()
    };
    
    this.swipes.push(swipe);
    
    // Check if there's a match (employer already swiped right on this jobseeker)
    if (interested) {
      const employerSwipe = this.swipes.find(s => 
        s.employerId === employerId && 
        s.jobseekerId === jobseekerId &&
        s.interested
      );
      
      if (employerSwipe) {
        // Create a match
        const match: Match = {
          id: `match_${Date.now()}_${jobseekerId}_${employerId}`,
          jobseekerId,
          employerId, // String type is correct here as per schema
          matchedAt: new Date(),
          status: 'new'
        };
        
        this.matches.push(match);
        return { match, isMatch: true };
      }
    }
    
    return { isMatch: false };
  }

  async getJobseekerRecentMatches(userId: number): Promise<any[]> {
    return this.matches
      .filter(match => match.jobseekerId === userId)
      .sort((a, b) => {
        const aTime = a.matchedAt ? a.matchedAt.getTime() : 0;
        const bTime = b.matchedAt ? b.matchedAt.getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 10)
      .map(match => {
        // First get the user
        const user = this.users.get(Number(match.employerId));
        // Then get their company
        const company = user?.companyId ? this.companies.get(user.companyId) : undefined;
        
        return {
          id: match.id,
          name: company?.name || user?.companyName || 'Unknown Company',
          matchDate: match.matchedAt,
          status: match.status === 'interview_scheduled' 
            ? 'interview-scheduled' 
            : (match.status === 'mutual-match' ? 'mutual-match' : 'matched'),
          statusText: match.status === 'interview_scheduled' 
            ? 'Interview scheduled' 
            : (match.status === 'mutual-match' ? 'Mutual match' : 'New match')
        };
      });
  }

  async recordJobseekerProfileView(jobseekerId: number, viewerId: number): Promise<void> {
    try {
      const profile = this.jobseekerProfiles.get(jobseekerId);
      
      if (!profile) {
        console.error(`No profile found for jobseeker ${jobseekerId}`);
        return;
      }
      
      // Initialize viewedBy if it doesn't exist
      if (!profile.viewedBy) {
        profile.viewedBy = [];
      }
      
      // Only add the viewer if they haven't viewed this profile before
      if (!profile.viewedBy.includes(viewerId)) {
        profile.viewedBy.push(viewerId);
        console.log(`Recorded profile view: Employer ${viewerId} viewed Jobseeker ${jobseekerId}`);
      } else {
        console.log(`Employer ${viewerId} has already viewed Jobseeker ${jobseekerId}`);
      }
    } catch (error) {
      console.error('Error recording profile view:', error);
    }
  }

  // Employer profile methods (now redirects to company creation)
  async createEmployerProfile(userId: number, profileData: any): Promise<any> {
    // Convert the employer profile data to company format
    const companyData = {
      name: profileData.companyName || 'Unnamed Company',
      headquarters: profileData.headquarters || '',
      size: profileData.size || '',
      about: profileData.aboutCompany || '',
      industries: profileData.industries || [],
      functionalAreas: profileData.functionalAreas || [],
      yearFounded: profileData.yearFounded || '',
      mission: profileData.mission || '',
      workArrangements: profileData.workArrangements || []
    };
    
    // Create the company and link it to the user
    const company = await this.createCompany(companyData, userId);
    
    // Return company data in a format compatible with the old employer profile
    return {
      id: `cp_${company.id}`,
      userId,
      companyId: company.id,
      companyName: company.name,
      headquarters: company.headquarters || '',
      about: company.about || '',
      createdAt: company.createdAt,
      updatedAt: company.updatedAt
    };
  }

  async saveEmployerProfileDraft(userId: number, draftData: any): Promise<any> {
    // Redirect to the saveCompanyProfileDraft method
    // This ensures compatibility with the old API while using the new company structure
    return this.saveCompanyProfileDraft(userId, draftData);
  }

  async getEmployerProfile(userId: number): Promise<any> {
    const user = this.users.get(userId);
    if (!user) {
      return undefined;
    }
    
    // If user has a company, get that company profile
    if (user.companyId) {
      const company = this.companies.get(user.companyId);
      if (company) {
        return {
          id: `cp_${company.id}`,
          userId,
          companyId: company.id,
          companyName: company.name,
          headquarters: company.headquarters || '',
          size: company.size || '',
          industries: company.industries || [],
          functionalAreas: company.functionalAreas || [],
          yearFounded: company.yearFounded || '',
          about: company.about || '',
          mission: company.mission || '',
          workArrangements: company.workArrangements || [],
          createdAt: company.createdAt,
          updatedAt: company.updatedAt
        };
      }
    }
    
    // If no company is found, return undefined
    return undefined;
  }

  async getEmployerDashboard(userId: number): Promise<any> {
    const user = this.users.get(userId);
    const company = user?.companyId ? this.companies.get(user.companyId) : undefined;
    
    const matches = this.matches.filter(match => match.employerId === userId.toString());
    
    // Get job postings for this employer
    const jobs = Array.from(this.jobPostings.values())
      .filter(job => job.employerId === userId || (user?.companyId && job.companyId === user.companyId));
    
    // Count profile views
    let profileViews = 0;
    
    // Count the number of jobseeker profiles that have this employer in their viewedBy array
    Array.from(this.jobseekerProfiles.values()).forEach(profile => {
      if (profile.viewedBy && profile.viewedBy.includes(userId)) {
        profileViews++;
      }
    });
    
    return {
      stats: {
        activeJobs: jobs.length,
        profileViews: profileViews,
        matches: matches.length,
        interviews: 0
      },
      company: company ? {
        id: company.id,
        name: company.name,
        profileCompletion: company.profileCompletion || 0
      } : null,
      jobs: jobs.map(job => ({
        id: job.id,
        title: job.title,
        department: job.department,
        location: job.location,
        workType: job.workType, // Use workType instead of workArrangements
        employmentType: job.employmentType,
        status: job.status,
        matchCount: Math.floor(Math.random() * 10) // Temporary random count until proper matching is implemented
      })),
      recentMatches: matches.slice(0, 5).map(match => {
        return {
          id: match.id,
          name: 'Anonymous Profile', // Jobseeker profiles are anonymous until a certain point
          matchDate: match.matchedAt,
          status: match.status === 'interview_scheduled' ? 'interview-scheduled' : 'matched',
          statusText: match.status === 'interview_scheduled' ? 
            'Interview scheduled' : 'New match'
        };
      })
    };
  }

  async getEmployerPotentialMatches(userId: number): Promise<any[]> {
    // Get jobseekers this employer hasn't swiped on yet
    const swipedJobseekerIds = this.swipes
      .filter(swipe => swipe.employerId === userId.toString())
      .map(swipe => swipe.jobseekerId);
    
    const potentialJobseekers = Array.from(this.jobseekerProfiles.values())
      .filter(profile => !swipedJobseekerIds.includes(profile.userId))
      .slice(0, 5); // Limit to 5 potential matches
    
    return potentialJobseekers.map(jobseeker => {
      return {
        id: jobseeker.userId.toString(),
        education: {
          degree: jobseeker.degreeLevel || 'Bachelor\'s',
          major: jobseeker.major || 'Computer Science',
          school: jobseeker.school || 'University of Technology'
        },
        locations: jobseeker.preferredLocations || ['San Francisco, CA', 'Seattle, WA', 'Remote'],
        sliderValues: jobseeker.sliderValues || {
          'schedule': 75,
          'collaboration-preference': 40,
          'execution': 60
        }
      };
    });
  }

  async handleEmployerSwipe(employerId: number, jobseekerId: string, interested: boolean): Promise<any> {
    const swipe: Swipe = {
      id: `swipe_${Date.now()}_${employerId}_${jobseekerId}`,
      employerId: employerId.toString(),
      jobseekerId: parseInt(jobseekerId),
      interested,
      createdAt: new Date()
    };
    
    this.swipes.push(swipe);
    
    // Check if there's a match (jobseeker already swiped right on this employer)
    if (interested) {
      const jobseekerSwipe = this.swipes.find(s => 
        s.jobseekerId === parseInt(jobseekerId) && 
        s.employerId === employerId.toString() &&
        s.interested
      );
      
      if (jobseekerSwipe) {
        // Create a match
        const match: Match = {
          id: `match_${Date.now()}_${jobseekerId}_${employerId}`,
          jobseekerId: parseInt(jobseekerId),
          employerId: employerId.toString(),
          matchedAt: new Date(),
          status: 'new'
        };
        
        this.matches.push(match);
        return { match, isMatch: true };
      }
    }
    
    return { isMatch: false };
  }

  async getEmployerRecentMatches(userId: number): Promise<any[]> {
    return this.matches
      .filter(match => match.employerId === userId.toString())
      .sort((a, b) => {
        const aTime = a.matchedAt ? a.matchedAt.getTime() : 0;
        const bTime = b.matchedAt ? b.matchedAt.getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 10)
      .map(match => {
        return {
          id: match.id,
          name: 'Anonymous Profile', // Jobseeker profiles are anonymous until a certain point
          matchDate: match.matchedAt,
          status: match.status === 'interview_scheduled' 
            ? 'interview-scheduled' 
            : (match.status === 'mutual-match' ? 'mutual-match' : 'matched'),
          statusText: match.status === 'interview_scheduled' 
            ? 'Interview scheduled' 
            : (match.status === 'mutual-match' ? 'Mutual match' : 'New match')
        };
      });
  }
  
  // Company methods
  async getCompany(companyId: number): Promise<Company | undefined> {
    return this.companies.get(companyId);
  }
  
  async createCompany(companyData: any, creatorUserId: number): Promise<Company> {
    const id = this.companyId++;
    
    const company: Company = {
      id,
      ...companyData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.companies.set(id, company);
    
    // Update the creator user to be an admin of this company
    const user = this.users.get(creatorUserId);
    if (user) {
      this.users.set(creatorUserId, {
        ...user,
        companyId: id,
        companyRole: 'admin'
      });
    }
    
    return company;
  }
  
  async updateCompany(companyId: number, companyData: any): Promise<Company> {
    const company = this.companies.get(companyId);
    
    if (!company) {
      throw new Error(`Company with id ${companyId} not found`);
    }
    
    // Calculate profile completion based on the data provided
    let profileCompletion = 0;
    
    // Step 1: Essential Information (25%)
    if (companyData.name && companyData.adminName && companyData.adminEmail &&
        companyData.headquarters && companyData.size && companyData.yearFounded) {
      profileCompletion = 25;
      
      // Step 2: About the Company (50%)
      if ((companyData.industries && companyData.industries.length > 0) &&
          (companyData.functionalAreas && companyData.functionalAreas.length > 0) && 
          companyData.about && companyData.mission) {
        profileCompletion = 50;
        
        // Step 3: Expectations, Compensation & Benefits (75%)
        if ((companyData.workArrangements && companyData.workArrangements.length > 0) &&
            companyData.compensationLevel && 
            (companyData.benefits && companyData.benefits.length > 0)) {
          profileCompletion = 75;
          
          // Step 4: Development Programs (100%)
          // We don't require these to be filled, but the user needs to have made 
          // a conscious decision about whether to include them
          if (typeof companyData.hasInterns === 'boolean' && 
              typeof companyData.hasApprentices === 'boolean' && 
              typeof companyData.hasDevelopmentPrograms === 'boolean') {
            profileCompletion = 100;
          }
        }
      }
    }
    
    const updatedCompany: Company = {
      ...company,
      ...companyData,
      profileCompletion: companyData.profileCompletion || profileCompletion,
      updatedAt: new Date()
    };
    
    this.companies.set(companyId, updatedCompany);
    return updatedCompany;
  }
  
  // Company profile draft methods
  async saveCompanyProfileDraft(userId: number, draftData: any, companyId?: number, step?: number): Promise<any> {
    // Create a draft key that combines userId and companyId if available
    const draftKey = companyId ? `${userId}_${companyId}` : `${userId}`;
    const currentStep = step || 1;
    
    // Get existing drafts for this user/company
    const existingDrafts = Array.from(this.companyProfileDrafts.values())
      .filter(draft => 
        (draft.userId === userId) && 
        (companyId ? draft.companyId === companyId : true)
      );
    
    // If there's an existing draft, update it
    if (existingDrafts.length > 0) {
      const existingDraft = existingDrafts[0];
      const updatedDraft = {
        ...existingDraft,
        draftData,
        step: currentStep,
        updatedAt: new Date()
      };
      
      this.companyProfileDrafts.set(existingDraft.id, updatedDraft);
      return updatedDraft;
    } 
    // Otherwise create a new draft
    else {
      const draftId = `draft_${Date.now()}`;
      const newDraft = {
        id: draftId,
        userId,
        companyId,
        draftData,
        step: currentStep,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.companyProfileDrafts.set(draftId, newDraft);
      return newDraft;
    }
  }
  
  async getCompanyProfileDraft(userId: number, companyId?: number): Promise<any | undefined> {
    // Get drafts for this user and optionally for a specific company
    const drafts = Array.from(this.companyProfileDrafts.values())
      .filter(draft => 
        (draft.userId === userId) && 
        (companyId ? draft.companyId === companyId : true)
      );
    
    return drafts.length > 0 ? drafts[0] : undefined;
  }
  
  async getCompanyTeamMembers(companyId: number): Promise<any[]> {
    return Array.from(this.users.values())
      .filter(user => user.companyId === companyId)
      .map(user => ({
        id: user.id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        role: user.companyRole || 'recruiter',
        isAdmin: user.companyRole === 'admin'
      }));
  }
  
  async createCompanyInvite(inviteData: any): Promise<CompanyInvite> {
    const invite: CompanyInvite = {
      id: `inv_${Date.now()}`,
      ...inviteData,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.companyInvites.push(invite);
    return invite;
  }
  
  async getCompanyInvites(companyId: number): Promise<CompanyInvite[]> {
    return this.companyInvites.filter(invite => invite.companyId === companyId);
  }
  
  async updateUserCompanyRole(userId: number, companyId: number, role: string): Promise<User> {
    const user = this.users.get(userId);
    
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }
    
    if (user.companyId !== companyId) {
      throw new Error(`User ${userId} does not belong to company ${companyId}`);
    }
    
    const updatedUser: User = {
      ...user,
      companyRole: role,
      updatedAt: new Date()
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async removeUserFromCompany(userId: number, companyId: number): Promise<void> {
    const user = this.users.get(userId);
    
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }
    
    if (user.companyId !== companyId) {
      throw new Error(`User ${userId} does not belong to company ${companyId}`);
    }
    
    const updatedUser: User = {
      ...user,
      companyId: null,
      companyRole: null,
      updatedAt: new Date()
    };
    
    this.users.set(userId, updatedUser);
  }
  
  // Job posting methods
  async getJobPosting(jobId: string): Promise<JobPosting | undefined> {
    return this.jobPostings.get(jobId);
  }
  
  async getEmployerJobPostings(userId: number): Promise<JobPosting[]> {
    return Array.from(this.jobPostings.values())
      .filter(job => job.employerId === userId);
  }
  
  async getCompanyJobPostings(companyId: number): Promise<JobPosting[]> {
    return Array.from(this.jobPostings.values())
      .filter(job => job.companyId === companyId);
  }
  
  async createJobPosting(jobData: any): Promise<JobPosting> {
    const jobId = `job_${Date.now()}`;
    
    const job: JobPosting = {
      id: jobId,
      ...jobData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.jobPostings.set(jobId, job);
    return job;
  }
  
  async updateJobPosting(jobId: string, jobData: any): Promise<JobPosting> {
    const job = this.jobPostings.get(jobId);
    
    if (!job) {
      throw new Error(`Job posting with id ${jobId} not found`);
    }
    
    const updatedJob: JobPosting = {
      ...job,
      ...jobData,
      updatedAt: new Date()
    };
    
    this.jobPostings.set(jobId, updatedJob);
    return updatedJob;
  }
  
  async updateJobStatus(jobId: string, status: string): Promise<JobPosting> {
    const job = this.jobPostings.get(jobId);
    
    if (!job) {
      throw new Error(`Job posting with id ${jobId} not found`);
    }
    
    const updatedJob: JobPosting = {
      ...job,
      status,
      updatedAt: new Date()
    };
    
    this.jobPostings.set(jobId, updatedJob);
    return updatedJob;
  }
  
  async deleteJobPosting(jobId: string): Promise<void> {
    if (!this.jobPostings.has(jobId)) {
      throw new Error(`Job posting with id ${jobId} not found`);
    }
    
    this.jobPostings.delete(jobId);
  }
  
  /**
   * Reset negative swipes for a jobseeker to enable reusing profiles for testing
   * Only remove swipes where the jobseeker was not interested (preserve matches)
   * This is a development/testing feature
   */
  async resetJobseekerSwipes(jobseekerId: number): Promise<{ count: number }> {
    // Get all negative swipes by this jobseeker
    const negativeSwipes = this.swipes.filter(swipe => 
      swipe.jobseekerId === jobseekerId && !swipe.interested
    );
    
    // Create a new swipes array without the negative swipes
    this.swipes = this.swipes.filter(swipe => 
      !(swipe.jobseekerId === jobseekerId && !swipe.interested)
    );
    
    return { count: negativeSwipes.length };
  }
  
  /**
   * Get a company invite by its ID
   */
  async getCompanyInvite(inviteId: string): Promise<CompanyInvite | undefined> {
    return this.companyInvites.find(invite => invite.id === inviteId);
  }
  
  /**
   * Delete a company invite
   */
  async deleteCompanyInvite(inviteId: string): Promise<void> {
    const index = this.companyInvites.findIndex(invite => invite.id === inviteId);
    if (index !== -1) {
      this.companyInvites.splice(index, 1);
    }
  }
  
  /**
   * Update a company invite
   */
  async updateCompanyInvite(inviteId: string, updateData: Partial<CompanyInvite>): Promise<CompanyInvite> {
    const index = this.companyInvites.findIndex(invite => invite.id === inviteId);
    if (index === -1) {
      throw new Error(`Invite with id ${inviteId} not found`);
    }
    
    const invite = this.companyInvites[index];
    const updatedInvite = {
      ...invite,
      ...updateData,
      updatedAt: new Date()
    };
    
    this.companyInvites[index] = updatedInvite;
    return updatedInvite;
  }
  
  /**
   * Submit a company profile draft to create or update a real company profile
   */
  async submitCompanyProfileDraft(userId: number, draftId: string): Promise<Company> {
    // Get the draft
    const draft = Array.from(this.companyProfileDrafts.values())
      .find(d => d.id === draftId && d.userId === userId);
    
    if (!draft) {
      throw new Error(`Draft with id ${draftId} not found for user ${userId}`);
    }
    
    // If this is updating an existing company
    if (draft.companyId) {
      const company = this.companies.get(draft.companyId);
      if (!company) {
        throw new Error(`Company with id ${draft.companyId} not found`);
      }
      
      // Update the company with the draft data
      const updatedCompany = await this.updateCompany(draft.companyId, draft.draftData);
      
      // Delete the draft after submission
      this.companyProfileDrafts.delete(draftId);
      
      return updatedCompany;
    } 
    // If this is creating a new company
    else {
      // Create the company with the draft data
      const company = await this.createCompany(draft.draftData, userId);
      
      // Delete the draft after submission
      this.companyProfileDrafts.delete(draftId);
      
      return company;
    }
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true,
      tableName: 'session',
      schemaName: 'public',
      // Enhanced session configuration
      ttl: 30 * 24 * 60 * 60, // Match 30-day cookie (in seconds)
      pruneSessionInterval: 12 * 60 * 60, // Clean up every 12 hours
      errorLog: (err) => {
        console.error('Session store error:', err);
      }
    });
  }
  
  // Company profile draft methods
  async saveCompanyProfileDraft(userId: number, draftData: any, companyId?: number, step?: number, draftType?: string): Promise<any> {
    try {
      const currentStep = step || 1;
      const currentDraftType = draftType || 'create';
      
      console.log(`DB: Saving draft for user ID ${userId}${companyId ? `, company ID ${companyId}` : ''}, step ${currentStep}, type: ${currentDraftType}`);
      
      // Debug to ensure we're receiving valid data
      console.log(`Draft data sample: ${JSON.stringify(draftData).substring(0, 100)}...`);
      
      try {
        // First try using Drizzle ORM to insert/update the data
        const { companyProfileDrafts } = await import('@shared/schema');
        const { eq, and, isNull } = await import('drizzle-orm');
        
        // Check if a draft already exists for this user/company combination
        const draftResults = await db.select()
          .from(companyProfileDrafts)
          .where(and(
            eq(companyProfileDrafts.userId, userId),
            companyId ? eq(companyProfileDrafts.companyId, companyId) : isNull(companyProfileDrafts.companyId)
          ));
          
        if (draftResults.length > 0) {
          // Update existing draft
          const existingDraft = draftResults[0];
          console.log(`Found existing draft with ID ${existingDraft.id}, updating`);
          
          const [updatedDraft] = await db.update(companyProfileDrafts)
            .set({
              draftData,
              step: currentStep,
              draftType: currentDraftType,
              lastActive: new Date(),
              updatedAt: new Date()
            })
            .where(eq(companyProfileDrafts.id, existingDraft.id))
            .returning();
            
          return updatedDraft;
        } else {
          // Create new draft
          console.log(`No existing draft found, creating new one for user ${userId}${companyId ? ` and company ${companyId}` : ''}`);
          
          const [newDraft] = await db.insert(companyProfileDrafts)
            .values({
              userId,
              companyId: companyId || null, 
              draftData,
              step: currentStep,
              draftType: currentDraftType,
              lastActive: new Date()
            })
            .returning();
            
          return newDraft;
        }
      } catch (ormError) {
        console.error('Error using Drizzle ORM for draft operation:', ormError);
        
        // Fallback to direct SQL queries if ORM approach fails
        console.log('Falling back to direct SQL query approach');
        
        // Check if a draft already exists for this user/company
        const existingDraftQuery = await db.execute(sql`
          SELECT * FROM company_profile_drafts 
          WHERE user_id = ${userId} 
          ${companyId ? sql`AND company_id = ${companyId}` : sql`AND company_id IS NULL`}
          LIMIT 1
        `);
        
        if (existingDraftQuery.rows.length > 0) {
          // Update existing draft
          const existingDraft = existingDraftQuery.rows[0];
          console.log(`Found existing draft with ID ${existingDraft.id} via SQL, updating`);
          
          const result = await db.execute(sql`
            UPDATE company_profile_drafts
            SET draft_data = ${JSON.stringify(draftData)},
                step = ${currentStep},
                draft_type = ${currentDraftType},
                last_active = NOW(),
                updated_at = NOW()
            WHERE id = ${existingDraft.id}
            RETURNING *
          `);
          
          if (result.rows.length === 0) {
            throw new Error('Update operation did not return a result');
          }
          
          return result.rows[0];
        } else {
          // Create new draft
          console.log(`No existing draft found via SQL, creating new one for user ${userId}${companyId ? ` and company ${companyId}` : ''}`);
          
          const result = await db.execute(sql`
            INSERT INTO company_profile_drafts (
              user_id, 
              company_id, 
              draft_data, 
              step,
              draft_type,
              last_active,
              created_at, 
              updated_at
            )
            VALUES (
              ${userId}, 
              ${companyId || null}, 
              ${JSON.stringify(draftData)}, 
              ${currentStep},
              ${currentDraftType},
              NOW(),
              NOW(), 
              NOW()
            )
            RETURNING *
          `);
          
          if (result.rows.length === 0) {
            throw new Error('Insert operation did not return a result');
          }
          
          return result.rows[0];
        }
      }
    } catch (error) {
      console.error('Error saving company profile draft:', error);
      throw new Error(`Failed to save company profile draft: ${(error as Error).message}`);
    }
  }
  
  async getCompanyProfileDraft(userId: number, companyId?: number): Promise<any | undefined> {
    try {
      console.log(`DB: Retrieving draft for user ID ${userId}${companyId ? ` and company ID ${companyId}` : ''}`);
      
      try {
        // Try using Drizzle ORM first
        const { companyProfileDrafts } = await import('@shared/schema');
        const { eq, and, isNull, desc } = await import('drizzle-orm');
        
        const draftResults = await db.select()
          .from(companyProfileDrafts)
          .where(and(
            eq(companyProfileDrafts.userId, userId),
            companyId ? eq(companyProfileDrafts.companyId, companyId) : isNull(companyProfileDrafts.companyId)
          ))
          .orderBy(desc(companyProfileDrafts.updatedAt))
          .limit(1);
          
        if (draftResults.length > 0) {
          console.log(`Found draft via ORM with ID ${draftResults[0].id}`);
          return draftResults[0];
        }
        
        return undefined;
      } catch (ormError) {
        console.error('Error using Drizzle ORM to fetch draft:', ormError);
        
        // Fallback to direct SQL
        console.log('Falling back to direct SQL query to fetch draft');
        
        const result = await db.execute(sql`
          SELECT * FROM company_profile_drafts 
          WHERE user_id = ${userId} 
          ${companyId ? sql`AND company_id = ${companyId}` : sql`AND company_id IS NULL`}
          ORDER BY updated_at DESC
          LIMIT 1
        `);
        
        if (result.rows.length > 0) {
          console.log(`Found draft via SQL with ID ${result.rows[0].id}`);
          return result.rows[0];
        }
        
        console.log(`No draft found for user ${userId}${companyId ? ` and company ${companyId}` : ''}`);
        return undefined;
      }
    } catch (error) {
      console.error('Error retrieving company profile draft:', error);
      return undefined;
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      if (!id) {
        console.warn('getUser called with invalid id:', id);
        return undefined;
      }
      
      const [user] = await db.select().from(users).where(eq(users.id, id));
      
      if (!user) {
        console.warn(`User with ID ${id} not found in database`);
      }
      
      return user;
    } catch (error) {
      console.error('Error retrieving user from database:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      if (!username) {
        console.warn('getUserByUsername called with invalid username:', username);
        return undefined;
      }
      
      const [user] = await db.select().from(users).where(eq(users.username, username));
      
      if (!user) {
        console.warn(`User with username "${username}" not found in database`);
      }
      
      return user;
    } catch (error) {
      console.error('Error retrieving user by username from database:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
      
    if (!updatedUser) {
      throw new Error(`User with id ${id} not found`);
    }
    
    return updatedUser;
  }

  // Jobseeker profile methods
  async createJobseekerProfile(userId: number, profileData: any): Promise<JobseekerProfile> {
    try {
      // First check if profile already exists
      const [existingProfile] = await db
        .select()
        .from(jobseekerProfiles)
        .where(eq(jobseekerProfiles.userId, userId));
      
      if (existingProfile) {
        // Profile exists, update it
        console.log(`Updating existing profile for user ${userId}`);
        const [updatedProfile] = await db
          .update(jobseekerProfiles)
          .set({
            ...profileData,
            updatedAt: new Date()
          })
          .where(eq(jobseekerProfiles.userId, userId))
          .returning();
        
        console.log(`Profile updated for user ${userId}`);
        return updatedProfile;
      } else {
        // Profile doesn't exist, create a new one
        console.log(`Creating new profile for user ${userId}`);
        const insertData = {
          userId,
          ...profileData
        };
        
        const [newProfile] = await db.insert(jobseekerProfiles).values([insertData]).returning();
        console.log(`New profile created for user ${userId}`);
        return newProfile;
      }
    } catch (error) {
      console.error(`Error in createJobseekerProfile for user ${userId}:`, error);
      throw error;
    }
  }

  async saveJobseekerProfileDraft(userId: number, draftData: any): Promise<any> {
    try {
      // Use a raw SQL query to handle draft data saving with upsert pattern
      const result = await db.execute(sql`
        INSERT INTO jobseeker_profile_drafts (user_id, draft_data, updated_at)
        VALUES (${userId}, ${JSON.stringify(draftData)}, NOW())
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          draft_data = ${JSON.stringify(draftData)},
          updated_at = NOW()
        RETURNING *
      `);
      
      console.log('Saved jobseeker profile draft:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('Error saving jobseeker profile draft:', error);
      throw new Error(`Failed to save draft: ${(error as Error).message}`);
    }
  }

  async getJobseekerProfile(userId: number): Promise<JobseekerProfile | undefined> {
    const [profile] = await db
      .select()
      .from(jobseekerProfiles)
      .where(eq(jobseekerProfiles.userId, userId));
    
    return profile;
  }

  async getJobseekerDashboard(userId: number): Promise<any> {
    // Get jobseeker profile
    const [profile] = await db
      .select()
      .from(jobseekerProfiles)
      .where(eq(jobseekerProfiles.userId, userId));
    
    // Get user data
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    // Calculate profile completion percentage based on completed steps
    // Step 1 = 33%, Step 2 = 66%, Step 3 = 100%
    let profileCompletionPercentage = 0;
    
    console.log(`DEBUG - Calculating profile completion for user ${userId}:`, {
      userExists: !!user,
      profileExists: !!profile,
      firstName: user?.firstName || 'N/A',
      lastName: user?.lastName || 'N/A',
      hasEmail: !!user?.email,
      school: profile?.school || 'N/A',
      degreeLevel: profile?.degreeLevel || 'N/A',
      hasFunctionalPrefs: !!profile?.functionalPreferences,
      hasIndustryPrefs: !!profile?.industryPreferences,
      hasSliderValues: profile?.sliderValues ? Object.keys(profile?.sliderValues || {}).length > 0 : false
    });
    
    // If we have basic user info (name, email), we've at least completed step 1
    if (user && user.firstName && user.lastName && user.email) {
      profileCompletionPercentage = 33;
      console.log("User " + userId + " has completed Step 1 (33%)");
      
      // Check if we have education and portfolio info (step 2)
      if (profile) {
        // Education, functional preferences, industry preferences, and location preferences
        // should be filled out for step 2
        const hasEducation = profile.school && profile.degreeLevel;
        
        // Check functional preferences in different formats
        let hasFunctionalPreferences = false;
        if (profile.functionalPreferences) {
          if (Array.isArray(profile.functionalPreferences)) {
            hasFunctionalPreferences = profile.functionalPreferences.length > 0;
          } else if (typeof profile.functionalPreferences === 'string') {
            // If it's a string, check if it's not empty
            hasFunctionalPreferences = profile.functionalPreferences.trim() !== '';
          } else if (typeof profile.functionalPreferences === 'object') {
            // If it's an object, check if it has keys
            hasFunctionalPreferences = Object.keys(profile.functionalPreferences).length > 0;
          }
        }
        
        // Check industry preferences
        const hasIndustryPreferences = Array.isArray(profile.industryPreferences) && 
          profile.industryPreferences.length > 0;
        
        // Log step 2 data
        console.log("User " + userId + " step 2 checks:", { hasEducation, hasFunctionalPreferences, hasIndustryPreferences });
        
        if (hasEducation || hasFunctionalPreferences || hasIndustryPreferences) {
          profileCompletionPercentage = 66;
          console.log("User " + userId + " has completed Step 2 (66%)");
          
          // Check if we have slider values (step 3)
          let hasSliderValues = false;
          
          if (profile.sliderValues) {
            if (typeof profile.sliderValues === 'object') {
              hasSliderValues = Object.keys(profile.sliderValues).length > 0;
            } else if (typeof profile.sliderValues === 'string' && profile.sliderValues.toString().trim() !== '') {
              try {
                // Try to parse it as JSON if it's a string
                const parsed = JSON.parse(profile.sliderValues.toString());
                hasSliderValues = Object.keys(parsed).length > 0;
              } catch (e) {
                // If it can't be parsed as JSON, assume it has some value
                hasSliderValues = true;
              }
            }
          }
          
          console.log("User " + userId + " step 3 check - hasSliderValues:", hasSliderValues);
          
          if (hasSliderValues) {
            profileCompletionPercentage = 100;
            console.log("User " + userId + " has completed Step 3 (100%)");
          }
        }
      }
    }
    
    console.log("Profile completion for " + userId + ": " + profileCompletionPercentage + "%");
    
    // Count matches - these will always be actual database counts
    const matchCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(matches)
      .where(eq(matches.jobseekerId, userId));
    
    // Get recent matches
    const recentMatches = await db
      .select({
        id: matches.id,
        employerId: matches.employerId,
        matchDate: matches.matchedAt,
        status: matches.status
      })
      .from(matches)
      .where(eq(matches.jobseekerId, userId))
      .orderBy(desc(matches.matchedAt))
      .limit(5);
    
    // Get employer names for matches
    const recentMatchesWithNames = await Promise.all(
      recentMatches.map(async (match) => {
        const [employer] = await db
          .select({
            id: users.id,
            companyName: users.companyName
          })
          .from(users)
          .where(eq(users.id, match.employerId));
        
        const [employerProfile] = await db
          .select({
            companyName: employerProfiles.companyName
          })
          .from(employerProfiles)
          .where(eq(employerProfiles.userId, match.employerId));
        
        return {
          id: match.id,
          name: employerProfile?.companyName || employer?.companyName || 'Unknown Company',
          matchDate: match.matchDate,
          status: match.status === 'interview_scheduled' ? 'interview-scheduled' : 'matched',
          statusText: match.status === 'interview_scheduled' ? 'Interview scheduled' : 'New match'
        };
      })
    );
    
    // Count profile views (if viewedBy field exists)
    let profileViews = 0;
    if (profile?.viewedBy && Array.isArray(profile.viewedBy)) {
      profileViews = profile.viewedBy.length;
    }
    
    return {
      stats: {
        profileCompletion: {
          percentage: profileCompletionPercentage
          // No fake increase
        },
        profileViews: profileViews, // Use actual view data if available
        matches: matchCount[0]?.count || 0 // This is already based on actual data
      },
      recentMatches: recentMatchesWithNames
    };
  }

  async getJobseekerPotentialMatches(userId: number): Promise<any[]> {
    try {
      console.log(`====== Getting potential matches for jobseeker: ${userId} ======`);
      
      // Check if jobseeker profile exists
      const [profile] = await db
        .select()
        .from(jobseekerProfiles)
        .where(eq(jobseekerProfiles.userId, userId));
      
      console.log(`Jobseeker profile exists: ${!!profile}`);
      
      // If no profile exists, create a basic profile draft to avoid errors
      if (!profile) {
        // Get user data
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, userId));
          
        if (user) {
          // Create a minimal profile to ensure the rest of the functionality works
          console.log("Creating minimal jobseeker profile for user " + userId);
          try {
            await db.insert(jobseekerProfiles).values({
              userId: userId,
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              email: user.email || user.username,
              schoolEmail: '',
              school: '',
              degreeLevel: '',
              major: '',
              portfolioUrl: '',
              preferredLocations: [],
              workArrangements: [],
              industryPreferences: [],
              functionalPreferences: '',
              sliderValues: {}
            });
            console.log("Created minimal jobseeker profile for user " + userId);
          } catch (err) {
            console.error("Error creating minimal profile: " + err);
          }
        }
      }
      
      // Get employers this jobseeker hasn't swiped on yet
      const swipedEmployerIds = await db
        .select({ employerId: swipes.employerId })
        .from(swipes)
        .where(eq(swipes.jobseekerId, userId));
      
      console.log(`Number of employers already swiped on: ${swipedEmployerIds.length}`);
      
      // Get all companies 
      const allEmployers = await db
        .select({
          id: companies.id,
          name: companies.name,
          email: users.email,
          username: users.username
        })
        .from(companies)
        .innerJoin(users, eq(users.companyId, companies.id));
      
      console.log(`Total companies in database: ${allEmployers.length}`);
      
      // Get company profiles that haven't been swiped on
      const potentialEmployers = await db
        .select({
          id: companies.id,
          userId: users.id,
          name: companies.name,
          about: companies.about,
          industries: companies.industries
        })
        .from(companies)
        .innerJoin(users, eq(users.companyId, companies.id))
        .where(
          sql`${users.id} NOT IN (
            SELECT ${swipes.employerId} FROM ${swipes} 
            WHERE ${swipes.jobseekerId} = ${userId}
          )`
        )
        .limit(5);
      
      console.log(`Number of potential employer matches: ${potentialEmployers.length}`);
      console.log('Potential employer matches:', JSON.stringify(potentialEmployers));
      
      // If no potential employers are available, return an empty array
      if (potentialEmployers.length === 0) {
        console.log('No unreviewed employers available, returning empty array');
        return [];
      }
      
      // Format the results
      return await Promise.all(potentialEmployers.map(async (employer) => {
        // Get job postings for this employer
        const jobPostingsResult = await db
          .select({ title: jobPostings.title })
          .from(jobPostings)
          .where(eq(jobPostings.employerId, parseInt(employer.userId.toString())))
          .limit(5);
        
        // Only show positions from actual job postings, or an empty array
        const positions = jobPostingsResult.length > 0
          ? jobPostingsResult.map(job => job.title)
          : [];
        
        return {
          id: employer.userId.toString(),
          name: employer.name || 'Unknown Company',
          location: employer.industries?.[0] || 'Various Industries',
          description: employer.about || 'No company description available',
          positions
        };
      }));
    } catch (error) {
      console.error('Error in getJobseekerPotentialMatches:', error);
      return []; // Return empty array instead of crashing
    }
  }
  
  /**
   * Check if a mutual match exists between jobseeker and employer, and create one if needed
   * @param jobseekerId - The jobseeker's user ID
   * @param employerId - The employer's user ID
   * @returns Object containing match data and whether it's a new match
   */
  private async checkAndCreateMutualMatch(jobseekerId: number, employerId: number): Promise<{ match: Match | null, isNewMatch: boolean }> {
    try {
      // First check if a match already exists between these users
      const existingMatch = await db.select()
        .from(matches)
        .where(
          and(
            eq(matches.jobseekerId, jobseekerId),
            eq(matches.employerId, employerId)
          )
        ).limit(1);
        
      if (existingMatch.length > 0) {
        console.log(`Match already exists between jobseeker ${jobseekerId} and employer ${employerId}`);
        return { match: existingMatch[0], isNewMatch: false };
      }
      
      // Get the employer's company info
      const [employer] = await db.select()
        .from(users)
        .where(eq(users.id, employerId));
      
      // Check if both users swiped right on each other
      // Note: We can't use the direction field since it doesn't exist in the database yet
      const jobseekerToEmployerSwipe = await db.select()
        .from(swipes)
        .where(
          and(
            eq(swipes.jobseekerId, jobseekerId),
            eq(swipes.employerId, employerId),
            eq(swipes.interested, true)
          )
        ).limit(1);
        
      const employerToJobseekerSwipe = await db.select()
        .from(swipes)
        .where(
          and(
            eq(swipes.employerId, employerId),
            eq(swipes.jobseekerId, jobseekerId),
            eq(swipes.interested, true)
          )
        ).limit(1);
      
      // If both swipes exist and both parties are interested, create a match
      if (jobseekerToEmployerSwipe.length > 0 && employerToJobseekerSwipe.length > 0) {
        // Create match data with only the fields that exist in the database
        const matchData = {
          jobseekerId,
          employerId,
          status: MATCH_STATUS.CONNECTED // Directly creating as a connected match
        };
        
        const [match] = await db.insert(matches).values(matchData).returning();
        console.log(`Created mutual match between jobseeker ${jobseekerId} and employer ${employerId}`);
        return { match, isNewMatch: true };
      }
      
      return { match: null, isNewMatch: false };
    } catch (error) {
      console.error("Error checking/creating mutual match:", error);
      return { match: null, isNewMatch: false };
    }
  }

  async handleJobseekerSwipe(jobseekerId: number, employerId: string, interested: boolean): Promise<any> {
    const employerIdNum = parseInt(employerId);
    
    // Check if user already swiped on this profile
    const existingSwipe = await db.select()
      .from(swipes)
      .where(
        and(
          eq(swipes.jobseekerId, jobseekerId),
          eq(swipes.employerId, employerIdNum)
        )
      ).limit(1);
      
    if (existingSwipe.length > 0) {
      return { error: "Already swiped on this employer", isMatch: false };
    }
    
    // Insert swipe record - only use fields that exist in the database
    const swipeData = {
      jobseekerId,
      employerId: employerIdNum,
      interested
    };
    
    const [swipe] = await db.insert(swipes).values(swipeData).returning();
    
    // Log the swipe for analytics debugging
    console.log(`Recorded jobseeker swipe - Jobseeker ID: ${jobseekerId}, Employer ID: ${employerIdNum}, Interested: ${interested}`);
    
    // Check for a match if jobseeker is interested
    if (interested) {
      try {
        // Use the reusable match checking function
        const { match, isNewMatch } = await this.checkAndCreateMutualMatch(jobseekerId, employerIdNum);
        
        if (match) {
          console.log(`Created a new match between jobseeker ${jobseekerId} and employer ${employerIdNum}`);
          return { match, isMatch: true };
        }
      } catch (error) {
        console.error("Error checking for match:", error);
        return { error: "Failed to check for match", isMatch: false };
      }
    }
    
    return { swipe, isMatch: false };
  }

  async getJobseekerRecentMatches(userId: number): Promise<any[]> {
    const recentMatches = await db
      .select()
      .from(matches)
      .where(eq(matches.jobseekerId, userId))
      .orderBy(desc(matches.matchedAt))
      .limit(10);
    
    return await Promise.all(
      recentMatches.map(async (match) => {
        // Get employer user and company name
        const [employer] = await db
          .select({
            id: users.id,
            companyName: users.companyName,
            companyId: users.companyId
          })
          .from(users)
          .where(eq(users.id, match.employerId));
        
        // Get company info if available
        const [company] = await db
          .select({
            name: companies.name
          })
          .from(companies)
          .where(
            eq(companies.id, employer?.companyId || 0)
          );
        
        return {
          id: match.id,
          name: company?.name || employer?.companyName || 'Unknown Company',
          matchDate: match.matchedAt,
          status: match.status === MATCH_STATUS.INTERVIEW_SCHEDULED 
            ? 'interview-scheduled' 
            : (match.status === MATCH_STATUS.CONNECTED ? 'connected' : 'matched'),
          statusText: match.status === MATCH_STATUS.INTERVIEW_SCHEDULED 
            ? 'Interview scheduled' 
            : (match.status === MATCH_STATUS.CONNECTED ? 'Connected' : 'New match')
        };
      })
    );
  }

  // Employer profile methods
  async createEmployerProfile(userId: number, profileData: any): Promise<any> {
    // Check if the user already has a company
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (user?.companyId) {
      // If user already has a company, update it
      const [company] = await db
        .update(companies)
        .set({
          name: profileData.companyName,
          about: profileData.aboutCompany,
          industries: profileData.companyIndustry ? [profileData.companyIndustry] : null,
          size: profileData.companySize,
          yearFounded: profileData.yearFounded,
          values: profileData.companyValues,
          mission: profileData.companyMission,
          website: profileData.companyWebsite,
          updatedAt: new Date()
        })
        .where(eq(companies.id, user.companyId))
        .returning();
      
      return {
        id: company.id,
        userId,
        companyName: company.name,
        aboutCompany: company.about,
        companyIndustry: company.industries?.[0] || null,
        companySize: company.size,
        yearFounded: company.yearFounded,
        companyValues: company.values,
        companyMission: company.mission,
        companyWebsite: company.website,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt
      };
    } else {
      // Create a new company
      const [company] = await db.insert(companies)
        .values({
          name: profileData.companyName,
          about: profileData.aboutCompany,
          industries: profileData.companyIndustry ? [profileData.companyIndustry] : null,
          size: profileData.companySize,
          yearFounded: profileData.yearFounded,
          values: profileData.companyValues,
          mission: profileData.companyMission,
          website: profileData.companyWebsite,
          createdBy: userId,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      // Update the user to link to this company
      await db.update(users)
        .set({
          companyId: company.id,
          companyRole: 'admin'
        })
        .where(eq(users.id, userId));
      
      return {
        id: company.id,
        userId,
        companyName: company.name,
        aboutCompany: company.about,
        companyIndustry: company.industries?.[0] || null,
        companySize: company.size,
        yearFounded: company.yearFounded,
        companyValues: company.values,
        companyMission: company.mission,
        companyWebsite: company.website,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt
      };
    }
  }

  async saveEmployerProfileDraft(userId: number, draftData: any): Promise<any> {
    try {
      // Use a raw SQL query to handle draft data saving with upsert pattern
      const result = await db.execute(sql`
        INSERT INTO employer_profile_drafts (user_id, draft_data, updated_at)
        VALUES (${userId}, ${JSON.stringify(draftData)}, NOW())
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          draft_data = ${JSON.stringify(draftData)},
          updated_at = NOW()
        RETURNING *
      `);
      
      console.log('Saved employer profile draft:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('Error saving employer profile draft:', error);
      throw new Error(`Failed to save draft: ${(error as Error).message}`);
    }
  }

  async getEmployerProfile(userId: number): Promise<any> {
    // Get user first to find their company
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user?.companyId) {
      return undefined;
    }
    
    // Get the company
    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, user.companyId));
    
    // Map company fields to employer profile format for backward compatibility
    if (company) {
      return {
        id: company.id,
        userId: userId,
        companyName: company.name,
        aboutCompany: company.about,
        companyIndustry: company.industries?.[0] || null,
        companySize: company.size,
        yearFounded: company.yearFounded,
        companyValues: company.values,
        companyMission: company.mission,
        companyWebsite: company.website,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt
      };
    }
    
    return undefined;
  }
  
  async getEmployerProfileDraft(userId: number): Promise<any | undefined> {
    try {
      // Get the draft using a direct SQL query
      const result = await db.execute(sql`
        SELECT draft_data FROM employer_profile_drafts 
        WHERE user_id = ${userId}
        LIMIT 1
      `);
      
      // Check if we got any results and return the draft data
      if (result.rows && result.rows.length > 0) {
        return result.rows[0].draft_data;
      }
      
      return undefined;
    } catch (error) {
      console.error("Error fetching employer profile draft:", error);
      // If the table doesn't exist yet, return undefined instead of throwing
      return undefined;
    }
  }
  
  async getJobseekerProfileDraft(userId: number): Promise<any | undefined> {
    try {
      // Get the draft using a direct SQL query
      const result = await db.execute(sql`
        SELECT draft_data FROM jobseeker_profile_drafts 
        WHERE user_id = ${userId}
        LIMIT 1
      `);
      
      // Check if we got any results and return the draft data
      if (result.rows && result.rows.length > 0) {
        return result.rows[0].draft_data;
      }
      
      return undefined;
    } catch (error) {
      console.error("Error fetching jobseeker profile draft:", error);
      // If the table doesn't exist yet, return undefined instead of throwing
      return undefined;
    }
  }

  async getEmployerDashboard(userId: number): Promise<any> {
    // Count matches
    const matchCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(matches)
      .where(eq(matches.employerId, userId));
    
    // Count active job postings
    const jobsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(jobPostings)
      .where(
        and(
          eq(jobPostings.employerId, userId),
          eq(jobPostings.status, 'active')
        )
      );
    
    // Get recent matches
    const recentMatches = await db
      .select()
      .from(matches)
      .where(eq(matches.employerId, userId))
      .orderBy(desc(matches.matchedAt))
      .limit(5);
    
    // Get job postings
    const jobs = await db
      .select()
      .from(jobPostings)
      .where(eq(jobPostings.employerId, userId))
      .limit(10);
    
    // Get employer swipe analytics - count likes and rejections
    const employerLikesQuery = await db
      .select({ count: sql<number>`count(*)` })
      .from(swipes)
      .where(
        and(
          eq(swipes.employerId, userId),
          eq(swipes.interested, true)
        )
      );
    
    const employerRejectionsQuery = await db
      .select({ count: sql<number>`count(*)` })
      .from(swipes)
      .where(
        and(
          eq(swipes.employerId, userId),
          eq(swipes.interested, false)
        )
      );
    
    const employerLikes = employerLikesQuery[0]?.count || 0;
    const employerRejections = employerRejectionsQuery[0]?.count || 0;
    const employerTotalSwipes = employerLikes + employerRejections;
    const employerLikeRatio = employerTotalSwipes > 0 ? Math.round((employerLikes / employerTotalSwipes) * 100) : 0;
    
    // Get jobseeker swipe analytics for this employer - count likes and rejections
    // This queries for swipes where jobseekers have swiped on this employer profile
    const jobseekerLikesQuery = await db
      .select({ count: sql<number>`count(*)` })
      .from(swipes)
      .where(
        and(
          isNotNull(swipes.jobseekerId),
          eq(swipes.employerId, userId),
          eq(swipes.interested, true),
          // Making sure the one who swiped is actually a jobseeker
          sql`EXISTS(
            SELECT 1 FROM ${users} 
            WHERE ${users.id} = ${swipes.jobseekerId} 
            AND ${users.userType} = 'jobseeker'
          )`
        )
      );
    
    const jobseekerRejectionsQuery = await db
      .select({ count: sql<number>`count(*)` })
      .from(swipes)
      .where(
        and(
          isNotNull(swipes.jobseekerId),
          eq(swipes.employerId, userId),
          eq(swipes.interested, false),
          // Making sure the one who swiped is actually a jobseeker
          sql`EXISTS(
            SELECT 1 FROM ${users} 
            WHERE ${users.id} = ${swipes.jobseekerId} 
            AND ${users.userType} = 'jobseeker'
          )`
        )
      );
    
    const jobseekerLikes = jobseekerLikesQuery[0]?.count || 0;
    const jobseekerRejections = jobseekerRejectionsQuery[0]?.count || 0;
    const jobseekerTotalSwipes = jobseekerLikes + jobseekerRejections;
    
    // Calculate the ratio only if there are swipes to avoid incorrect 0%
    const jobseekerLikeRatio = jobseekerTotalSwipes > 0 
      ? Math.round((jobseekerLikes / jobseekerTotalSwipes) * 100) 
      : 0;
    
    // Log this data for debugging
    console.log(`Jobseeker swipe analytics for employer ${userId}:`, {
      likes: jobseekerLikes,
      rejections: jobseekerRejections,
      totalSwipes: jobseekerTotalSwipes,
      likeRatio: jobseekerLikeRatio
    });
    
    const formattedJobs = jobs.map(job => ({
      id: job.id,
      title: job.title,
      department: job.department,
      location: job.location,
      workType: job.workType,
      employmentType: job.employmentType,
      status: job.status,
      matchCount: 0 // Would need a join to count matches per job
    }));
    
    // Use actual job postings from database, empty array if none exist
    const displayJobs = formattedJobs;
    
    // Count how many jobseekers have viewed the employer's profile
    const profileViewsQuery = await db
      .select({ count: sql<number>`count(*)` })
      .from(jobseekerProfiles)
      .where(
        and(
          isNotNull(jobseekerProfiles.viewedBy),
          sql`jsonb_array_length(${jobseekerProfiles.viewedBy}) > 0`,
          sql`EXISTS(SELECT 1 FROM jsonb_array_elements_text(${jobseekerProfiles.viewedBy}) AS elem WHERE elem = ${userId.toString()})`
        )
      );
    
    const profileViews = profileViewsQuery[0]?.count || 0;
      
    return {
      stats: {
        activeJobs: jobsCount[0]?.count || 0,
        profileViews: profileViews,
        matches: matchCount[0]?.count || 0,
        interviews: 0, // Set to 0 as we don't have interview scheduling yet
        swipeAnalytics: {
          employer: {
            likes: employerLikes,
            rejections: employerRejections,
            totalSwipes: employerTotalSwipes,
            likeRatio: employerLikeRatio
          },
          jobseeker: {
            likes: jobseekerLikes,
            rejections: jobseekerRejections,
            totalSwipes: jobseekerTotalSwipes,
            likeRatio: jobseekerLikeRatio
          }
        }
      },
      jobs: displayJobs,
      recentMatches: recentMatches.map(match => ({
        id: match.id,
        name: 'Anonymous Profile', // Jobseeker profiles are anonymous until a certain point
        matchDate: match.matchedAt,
        status: match.status === MATCH_STATUS.INTERVIEW_SCHEDULED 
          ? 'interview-scheduled' 
          : (match.status === MATCH_STATUS.CONNECTED ? 'connected' : 'matched'),
        statusText: match.status === MATCH_STATUS.INTERVIEW_SCHEDULED 
          ? 'Interview scheduled' 
          : (match.status === MATCH_STATUS.CONNECTED ? 'Connected' : 'New match')
      }))
    };
  }

  async getEmployerPotentialMatches(userId: number): Promise<any[]> {
    // Debug log to trace execution
    console.log(`Getting potential matches for employer: ${userId}`);
    
    try {
      // Get jobseekers this employer has swiped on
      const swipedResults = await db
        .select({ jobseekerId: swipes.jobseekerId })
        .from(swipes)
        .where(eq(swipes.employerId, userId));
      
      const swipedJobseekerIds = swipedResults.map(item => item.jobseekerId);
      console.log(`Already swiped on ${swipedJobseekerIds.length} profiles`);
      
      // Get all jobseeker profiles with full JOIN to users table
      // This gives us access to more complete profile data
      const allProfiles = await db
        .select({
          profile: jobseekerProfiles,
          user: users
        })
        .from(jobseekerProfiles)
        .innerJoin(users, eq(jobseekerProfiles.userId, users.id));
      
      console.log(`Total jobseeker profiles in system: ${allProfiles.length}`);
      
      // First try to get profiles that haven't been swiped on yet
      let potentialJobseekers = allProfiles.filter(item => 
        !swipedJobseekerIds.includes(item.profile.userId)
      );
      
      console.log(`Unreviewed profiles available: ${potentialJobseekers.length}`);
      
      // If no unreviewed profiles are available, return an empty array
      // This ensures users don't see the same profiles they've already swiped on
      if (potentialJobseekers.length === 0) {
        console.log('No unreviewed profiles available, returning empty array');
        return [];
      }
      
      console.log(`Potential matches (before filtering): ${potentialJobseekers.length}`);
      
      // Filter profiles based on completion requirements:
      // 1. Section 1 (Education) MUST be completed
      // 2. Section 2 (Locations/Work Preferences) MUST be completed 
      // 3. At least three (3) sections of sliders MUST be completed
      const filteredProfiles = potentialJobseekers.filter(item => {
        const profile = item.profile;
        
        // Debug each profile to identify completion status
        console.log("Examining profile:", {
          userId: profile.userId,
          hasEducation: !!profile.school || !!profile.degreeLevel || !!profile.major,
          hasSliderValues: !!profile.sliderValues,
          sliderValuesSample: profile.sliderValues ? typeof profile.sliderValues : 'null',
          sliderValuesCount: profile.sliderValues ? Object.keys(profile.sliderValues).length : 0,
          preferredLocations: profile.preferredLocations ? 
            (Array.isArray(profile.preferredLocations) ? 
              profile.preferredLocations.length : typeof profile.preferredLocations) : 'null',
          workArrangements: profile.workArrangements ? 
            (Array.isArray(profile.workArrangements) ? 
              profile.workArrangements.length : typeof profile.workArrangements) : 'null',
        });
        
        // Section 1: Education MUST be completed (at least one of these fields must be filled)
        const educationCompleted = !!(profile.school || profile.degreeLevel || profile.major);
        
        // Section 2: Locations/Work Preferences MUST be completed
        const hasLocations = Array.isArray(profile.preferredLocations) && profile.preferredLocations.length > 0;
        const hasWorkArrangements = Array.isArray(profile.workArrangements) && profile.workArrangements.length > 0;
        const locationsCompleted = hasLocations || hasWorkArrangements;
        
        // Section 3: At least three (3) sections of sliders MUST be completed
        // Count how many slider values are filled to estimate completed sections
        // Each slider category has approximately 6 sliders on average
        let slidersCompleted = false;
        if (profile.sliderValues && typeof profile.sliderValues === 'object') {
          const sliderCount = Object.keys(profile.sliderValues).length;
          // Require at least 15 sliders (approximately 3 categories with ~5 sliders each)
          slidersCompleted = sliderCount >= 15;
        }
        
        // Log the completion status
        console.log(`Profile ${profile.userId} completion status:`, {
          educationCompleted,
          locationsCompleted,
          slidersCompleted,
          verdict: educationCompleted && locationsCompleted && slidersCompleted ? 'PASS' : 'FAIL'
        });
        
        // Only return profiles that meet all requirements
        return educationCompleted && locationsCompleted && slidersCompleted;
      });
      
      console.log(`Potential matches (after filtering): ${filteredProfiles.length}`);
      
      // Format the results with anonymized but useful data
      console.log(`Formatting ${filteredProfiles.length} profiles for client...`);
      
      // If there's at least one profile, log its raw data for debugging
      if (filteredProfiles.length > 0) {
        console.log("Raw profile data (first profile):", JSON.stringify(filteredProfiles[0]));
      }
      
      const formattedProfiles = filteredProfiles.map(item => {
        const jobseeker = item.profile;
        const userData = item.user;
        
        // Create a profile with ACTUAL user data
        const formattedProfile = {
          id: jobseeker.userId.toString(),
          education: {
            degree: jobseeker.degreeLevel || 'Unspecified',
            major: jobseeker.major || 'Unspecified',
            school: jobseeker.school || 'Unspecified'
          },
          // Use the actual user data if available, otherwise provide sensible defaults
          locations: Array.isArray(jobseeker.preferredLocations) 
            ? jobseeker.preferredLocations 
            : (jobseeker.preferredLocations ? [jobseeker.preferredLocations] : ['Remote']),
          
          // This is the critical part: use the actual slider values from the database
          sliderValues: jobseeker.sliderValues || {
            'schedule': 50,
            'collaboration-preference': 50,
            'execution': 50
          },
          
          workArrangements: Array.isArray(jobseeker.workArrangements) 
            ? jobseeker.workArrangements 
            : (jobseeker.workArrangements ? [jobseeker.workArrangements] : ['remote']),
          
          industryPreferences: Array.isArray(jobseeker.industryPreferences) 
            ? jobseeker.industryPreferences 
            : (jobseeker.industryPreferences ? [jobseeker.industryPreferences] : ['Technology'])
        };
        
        console.log(`Formatted profile ${jobseeker.userId} with sliderValues:`, formattedProfile.sliderValues);
        
        return formattedProfile;
      });
      
      console.log(`Returning ${formattedProfiles.length} formatted profiles to client:`, 
        formattedProfiles.length > 0 ? JSON.stringify(formattedProfiles[0]) : 'No profiles');
      
      // Return the formatted profiles
      return formattedProfiles;
    } catch (error) {
      console.error("Error getting potential matches:", error);
      return [];
    }
  }

  async handleEmployerSwipe(employerId: number, jobseekerId: string, interested: boolean): Promise<any> {
    const jobseekerIdNum = parseInt(jobseekerId);
    
    // Check if employer already swiped on this profile
    const existingSwipe = await db.select()
      .from(swipes)
      .where(
        and(
          eq(swipes.employerId, employerId),
          eq(swipes.jobseekerId, jobseekerIdNum)
        )
      ).limit(1);
      
    if (existingSwipe.length > 0) {
      return { error: "Already swiped on this jobseeker", isMatch: false };
    }
    
    // Get the employer's company info
    const [employer] = await db.select()
      .from(users)
      .where(eq(users.id, employerId));
      
    // Insert swipe record - only use fields that exist in the database
    const swipeData = {
      employerId,
      jobseekerId: jobseekerIdNum,
      interested
    };
    
    const [swipe] = await db.insert(swipes).values(swipeData).returning();
    
    // Log the swipe for analytics debugging
    console.log(`Recorded employer swipe - Employer ID: ${employerId}, Jobseeker ID: ${jobseekerIdNum}, Interested: ${interested}`);
    
    // Check for a match if employer is interested
    if (interested) {
      try {
        // Use the reusable match checking function
        const { match, isNewMatch } = await this.checkAndCreateMutualMatch(jobseekerIdNum, employerId);
        
        if (match) {
          console.log(`Created a new match between employer ${employerId} and jobseeker ${jobseekerIdNum}`);
          return { match, isMatch: true };
        }
      } catch (error) {
        console.error("Error checking for match:", error);
        return { error: "Failed to check for match", isMatch: false };
      }
    }
    
    return { swipe, isMatch: false };
  }

  async getEmployerRecentMatches(userId: number): Promise<any[]> {
    const recentMatches = await db
      .select()
      .from(matches)
      .where(eq(matches.employerId, userId))
      .orderBy(desc(matches.matchedAt))
      .limit(10);
    
    const matchesWithProfiles = await Promise.all(
      recentMatches.map(async (match) => {
        if (match.status === MATCH_STATUS.CONNECTED) {
          // If mutual match, include full jobseeker profile info
          const [jobseekerUser] = await db
            .select({
              id: users.id,
              firstName: users.firstName,
              lastName: users.lastName,
              email: users.email,
              phone: users.phone
            })
            .from(users)
            .where(eq(users.id, match.jobseekerId));
            
          // Get the jobseeker profile for additional information
          const [jobseekerProfile] = await db
            .select()
            .from(jobseekerProfiles)
            .where(eq(jobseekerProfiles.userId, match.jobseekerId));
            
          const fullName = `${jobseekerUser?.firstName || ''} ${jobseekerUser?.lastName || ''}`.trim();
          
          return {
            id: match.id,
            name: fullName || 'Anonymous Profile',
            matchDate: match.matchedAt,
            status: match.status === MATCH_STATUS.INTERVIEW_SCHEDULED 
              ? 'interview-scheduled' 
              : 'connected',
            statusText: match.status === MATCH_STATUS.INTERVIEW_SCHEDULED 
              ? 'Interview scheduled' 
              : 'Connected',
            contactInfo: {
              firstName: jobseekerUser?.firstName,
              lastName: jobseekerUser?.lastName,
              email: jobseekerUser?.email,
              phone: jobseekerUser?.phone,
              school: jobseekerProfile?.school,
              major: jobseekerProfile?.major
            }
          };
        } else {
          // For non-mutual matches, keep profile anonymous
          return {
            id: match.id,
            name: 'Anonymous Profile',
            matchDate: match.matchedAt,
            status: match.status === MATCH_STATUS.INTERVIEW_SCHEDULED 
              ? 'interview-scheduled' 
              : 'matched',
            statusText: match.status === MATCH_STATUS.INTERVIEW_SCHEDULED 
              ? 'Interview scheduled' 
              : 'New match'
          };
        }
      })
    );
    
    return matchesWithProfiles;
  }

  async recordJobseekerProfileView(jobseekerId: number, viewerId: number): Promise<void> {
    try {
      // Get the jobseeker profile
      const [profile] = await db
        .select()
        .from(jobseekerProfiles)
        .where(eq(jobseekerProfiles.userId, jobseekerId));

      if (!profile) {
        console.error(`No profile found for jobseeker ${jobseekerId}`);
        return;
      }

      // Parse current viewedBy array (if it exists) or create an empty array
      const currentViewedBy = profile.viewedBy || [];
      const viewerIdStr = viewerId.toString();
      
      // Only add the viewer if they haven't viewed this profile before
      if (!currentViewedBy.includes(viewerIdStr) && !currentViewedBy.includes(viewerId)) {
        // Add the new viewer to the array - ensure it's added as a string for consistency
        const updatedViewedBy = [...currentViewedBy, viewerIdStr];
        
        // Update the profile with the new viewedBy array
        await db
          .update(jobseekerProfiles)
          .set({ viewedBy: updatedViewedBy })
          .where(eq(jobseekerProfiles.userId, jobseekerId));
        
        console.log(`Recorded profile view: Employer ${viewerId} viewed Jobseeker ${jobseekerId}`);
      } else {
        console.log(`Employer ${viewerId} has already viewed Jobseeker ${jobseekerId}`);
      }
    } catch (error) {
      console.error('Error recording profile view:', error);
    }
  }
  
  // Company methods
  async getCompany(companyId: number): Promise<Company | undefined> {
    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId));
      
    return company;
  }
  
  async createCompany(companyData: any, creatorUserId: number): Promise<Company> {
    const [company] = await db
      .insert(companies)
      .values(companyData)
      .returning();
    
    // Update the creator user to be an admin of this company
    await db
      .update(users)
      .set({
        companyId: company.id,
        companyRole: 'admin',
        updatedAt: new Date()
      })
      .where(eq(users.id, creatorUserId));
    
    return company;
  }
  
  async updateCompany(companyId: number, companyData: any): Promise<Company> {
    const [updatedCompany] = await db
      .update(companies)
      .set({
        ...companyData,
        updatedAt: new Date()
      })
      .where(eq(companies.id, companyId))
      .returning();
    
    if (!updatedCompany) {
      throw new Error(`Company with id ${companyId} not found`);
    }
    
    return updatedCompany;
  }
  
  async getCompanyTeamMembers(companyId: number): Promise<any[]> {
    const teamMembers = await db
      .select()
      .from(users)
      .where(eq(users.companyId, companyId));
    
    return teamMembers.map(user => ({
      id: user.id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      role: user.companyRole || 'recruiter',
      isAdmin: user.companyRole === 'admin'
    }));
  }
  
  async createCompanyInvite(inviteData: any): Promise<CompanyInvite> {
    const [invite] = await db
      .insert(companyInvites)
      .values({
        ...inviteData,
        status: 'pending'
      })
      .returning();
    
    return invite;
  }
  
  async getCompanyInvites(companyId: number): Promise<CompanyInvite[]> {
    return db
      .select()
      .from(companyInvites)
      .where(eq(companyInvites.companyId, companyId));
  }
  
  async getCompanyInvite(inviteId: string): Promise<CompanyInvite | undefined> {
    const [invite] = await db
      .select()
      .from(companyInvites)
      .where(eq(companyInvites.id, inviteId));
      
    return invite;
  }
  
  async deleteCompanyInvite(inviteId: string): Promise<void> {
    await db
      .delete(companyInvites)
      .where(eq(companyInvites.id, inviteId));
  }
  
  async updateCompanyInvite(inviteId: string, updateData: Partial<CompanyInvite>): Promise<CompanyInvite> {
    const [updatedInvite] = await db
      .update(companyInvites)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(companyInvites.id, inviteId))
      .returning();
      
    if (!updatedInvite) {
      throw new Error(`Invite with id ${inviteId} not found`);
    }
    
    return updatedInvite;
  }
  
  async updateUserCompanyRole(userId: number, companyId: number, role: string): Promise<User> {
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
    
    if (!updatedUser) {
      throw new Error(`User with id ${userId} not found or does not belong to company ${companyId}`);
    }
    
    return updatedUser;
  }
  
  async removeUserFromCompany(userId: number, companyId: number): Promise<void> {
    const result = await db
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
    
    if (result.rowCount === 0) {
      throw new Error(`User with id ${userId} not found or does not belong to company ${companyId}`);
    }
  }
  
  // Job posting methods
  async getJobPosting(jobId: string): Promise<JobPosting | undefined> {
    const [job] = await db
      .select()
      .from(jobPostings)
      .where(eq(jobPostings.id, jobId));
      
    return job;
  }
  
  async getEmployerJobPostings(userId: number): Promise<JobPosting[]> {
    return db
      .select()
      .from(jobPostings)
      .where(eq(jobPostings.employerId, userId));
  }
  
  async getCompanyJobPostings(companyId: number): Promise<JobPosting[]> {
    return db
      .select()
      .from(jobPostings)
      .where(eq(jobPostings.companyId, companyId));
  }
  
  async createJobPosting(jobData: any): Promise<JobPosting> {
    const [job] = await db
      .insert(jobPostings)
      .values(jobData)
      .returning();
    
    return job;
  }
  
  async updateJobPosting(jobId: string, jobData: any): Promise<JobPosting> {
    const [updatedJob] = await db
      .update(jobPostings)
      .set({
        ...jobData,
        updatedAt: new Date()
      })
      .where(eq(jobPostings.id, jobId))
      .returning();
    
    if (!updatedJob) {
      throw new Error(`Job posting with id ${jobId} not found`);
    }
    
    return updatedJob;
  }
  
  async updateJobStatus(jobId: string, status: string): Promise<JobPosting> {
    const [updatedJob] = await db
      .update(jobPostings)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(eq(jobPostings.id, jobId))
      .returning();
    
    if (!updatedJob) {
      throw new Error(`Job posting with id ${jobId} not found`);
    }
    
    return updatedJob;
  }
  
  async deleteJobPosting(jobId: string): Promise<void> {
    const result = await db
      .delete(jobPostings)
      .where(eq(jobPostings.id, jobId));
    
    if (result.rowCount === 0) {
      throw new Error(`Job posting with id ${jobId} not found`);
    }
  }

  /**
   * Reset negative swipes for a jobseeker to enable reusing profiles for testing
   * Only remove swipes where the jobseeker was not interested (preserve matches)
   * This is a development/testing feature
   */
  async resetJobseekerSwipes(jobseekerId: number): Promise<{ count: number }> {
    console.log(`Resetting negative swipes for jobseeker: ${jobseekerId}`);
    
    // Only delete swipes where interested = false (rejected profiles)
    // This preserves matches and positive swipes
    const result = await db
      .delete(swipes)
      .where(
        and(
          eq(swipes.jobseekerId, jobseekerId),
          eq(swipes.interested, false)
        )
      );
    
    console.log(`Deleted ${result.rowCount} negative swipes for jobseeker ${jobseekerId}`);
    
    return { count: result.rowCount || 0 };
  }

  /**
   * Reset negative swipes for an employer to enable reusing profiles for testing
   * Only remove swipes where the employer was not interested (preserve matches)
   * This is a development/testing feature
   */
  async resetEmployerSwipes(employerId: number): Promise<{ count: number }> {
    console.log(`Resetting negative swipes for employer: ${employerId}`);
    
    // Only delete swipes where interested = false (rejected profiles)
    // This preserves matches and positive swipes
    const result = await db
      .delete(swipes)
      .where(
        and(
          eq(swipes.employerId, employerId),
          eq(swipes.interested, false)
        )
      );
    
    console.log(`Deleted ${result.rowCount} negative swipes for employer ${employerId}`);
    
    return { count: result.rowCount || 0 };
  }
  
  /**
   * Submit a company profile draft to create or update a real company profile
   * @param userId The user ID of the person submitting the draft
   * @param draftId The ID of the draft to submit
   * @returns The created or updated company
   */
  async submitCompanyProfileDraft(userId: number, draftId: string): Promise<Company> {
    console.log(`Submitting company profile draft ${draftId} for user ${userId}`);
    
    // Find the draft
    const [draft] = await db
      .select()
      .from(companyProfileDrafts)
      .where(eq(companyProfileDrafts.id, draftId));
    
    if (!draft) {
      throw new Error(`Draft with ID ${draftId} not found`);
    }
    
    // Verify the user owns this draft
    if (draft.userId !== userId) {
      throw new Error(`User ${userId} does not own draft ${draftId}`);
    }
    
    console.log(`Found draft for user ${userId}, draft type: ${draft.draftType}`);
    
    // Use a transaction to ensure atomicity
    return await db.transaction(async (tx) => {
      let company: Company;
      
      if (draft.draftType === 'create' || !draft.companyId) {
        // Create a new company
        console.log(`Creating new company from draft ${draftId}`);
        
        const [newCompany] = await tx
          .insert(companies)
          .values({
            ...draft.draftData,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
        
        // Also update the user's company association
        await tx
          .update(users)
          .set({
            companyId: newCompany.id,
            companyRole: 'admin',
            updatedAt: new Date()
          })
          .where(eq(users.id, userId));
        
        company = newCompany;
      } else {
        // Update existing company
        console.log(`Updating company ${draft.companyId} from draft ${draftId}`);
        
        const [updatedCompany] = await tx
          .update(companies)
          .set({
            ...draft.draftData,
            updatedAt: new Date()
          })
          .where(eq(companies.id, draft.companyId))
          .returning();
        
        company = updatedCompany;
      }
      
      // Delete the draft since it's been applied
      console.log(`Deleting draft ${draftId} after successful application`);
      await tx
        .delete(companyProfileDrafts)
        .where(eq(companyProfileDrafts.id, draftId));
      
      return company;
    });
  }
}

export const storage = new DatabaseStorage();
