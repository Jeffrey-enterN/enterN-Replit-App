import { 
  users, 
  User, 
  InsertUser, 
  JobseekerProfile,
  jobseekerProfiles,
  InsertJobseekerProfile,
  EmployerProfile,
  employerProfiles,
  InsertEmployerProfile,
  Match,
  matches,
  InsertMatch,
  JobPosting,
  jobPostings,
  InsertJobPosting,
  Swipe,
  swipes,
  InsertSwipe
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
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
  getJobseekerDashboard(userId: number): Promise<any>;
  getJobseekerPotentialMatches(userId: number): Promise<any[]>;
  handleJobseekerSwipe(jobseekerId: number, employerId: string, interested: boolean): Promise<any>;
  getJobseekerRecentMatches(userId: number): Promise<any[]>;

  // Employer profile methods
  createEmployerProfile(userId: number, profileData: any): Promise<EmployerProfile>;
  saveEmployerProfileDraft(userId: number, draftData: any): Promise<any>;
  getEmployerProfile(userId: number): Promise<EmployerProfile | undefined>;
  getEmployerDashboard(userId: number): Promise<any>;
  getEmployerPotentialMatches(userId: number): Promise<any[]>;
  handleEmployerSwipe(employerId: number, jobseekerId: string, interested: boolean): Promise<any>;
  getEmployerRecentMatches(userId: number): Promise<any[]>;

  // Session store
  sessionStore: SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private jobseekerProfiles: Map<number, JobseekerProfile>;
  private employerProfiles: Map<number, EmployerProfile>;
  private swipes: Swipe[];
  private matches: Match[];
  private jobPostings: Map<string, JobPosting>;
  private jobseekerProfileDrafts: Map<number, any>;
  private employerProfileDrafts: Map<number, any>;
  
  currentId: number;
  sessionStore: SessionStore;

  constructor() {
    this.users = new Map();
    this.jobseekerProfiles = new Map();
    this.employerProfiles = new Map();
    this.swipes = [];
    this.matches = [];
    this.jobPostings = new Map();
    this.jobseekerProfileDrafts = new Map();
    this.employerProfileDrafts = new Map();
    this.currentId = 1;
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
    const user: User = { 
      ...insertUser, 
      id, 
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

  async getJobseekerDashboard(userId: number): Promise<any> {
    const profile = this.jobseekerProfiles.get(userId);
    const user = this.users.get(userId);
    
    // Calculate profile completion percentage more accurately
    let completionScore = 0;
    let totalFields = 0;
    
    // Basic user fields (firstName, lastName, email, phone)
    if (user) {
      totalFields += 4;
      if (user.firstName) completionScore += 1;
      if (user.lastName) completionScore += 1;
      if (user.email) completionScore += 1;
      if (user.phone) completionScore += 1;
    }
    
    // Profile fields
    if (profile) {
      // Education fields
      totalFields += 3;
      if (profile.education.degree) completionScore += 1;
      if (profile.education.school) completionScore += 1;
      if (profile.education.major) completionScore += 1;
      
      // Experience fields
      totalFields += 3;
      if (profile.experience.length > 0) {
        completionScore += 3; // Full score if there's at least one experience entry
      }
      
      // Skills fields
      totalFields += 1;
      if (profile.skills.length > 0) completionScore += 1;
      
      // Sliders
      totalFields += 1;
      if (Object.keys(profile.sliderValues).length > 0) completionScore += 1;
      
      // Location preferences
      totalFields += 1;
      if (profile.locationPreferences.length > 0) completionScore += 1;
    }
    
    const profileCompletionPercentage = Math.round((completionScore / totalFields) * 100) || 0;
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
        const employer = Array.from(this.employerProfiles.values())
          .find(profile => profile.userId.toString() === match.employerId);
        
        return {
          id: match.id,
          name: employer?.companyName || 'Unknown Company',
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
    
    const potentialEmployers = Array.from(this.employerProfiles.values())
      .filter(profile => !swipedEmployerIds.includes(profile.userId.toString()))
      .slice(0, 5); // Limit to 5 potential matches
    
    return potentialEmployers.map(employer => {
      // Get job postings for this employer
      const jobPostings = Array.from(this.jobPostings.values())
        .filter(posting => posting.employerId === employer.userId)
        .map(posting => posting.title);
      
      return {
        id: employer.userId.toString(),
        name: employer.companyName,
        location: employer.headquarters,
        description: employer.aboutCompany,
        positions: jobPostings.length > 0 ? jobPostings : ['Software Engineer', 'Product Manager', 'UX Designer'] // Mock data if no postings
      };
    });
  }

  async handleJobseekerSwipe(jobseekerId: number, employerId: string, interested: boolean): Promise<any> {
    const swipe: Swipe = {
      id: `swipe_${Date.now()}_${jobseekerId}_${employerId}`,
      jobseekerId,
      employerId,
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
          employerId,
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
      .sort((a, b) => b.matchedAt.getTime() - a.matchedAt.getTime())
      .slice(0, 10)
      .map(match => {
        const employer = Array.from(this.employerProfiles.values())
          .find(profile => profile.userId.toString() === match.employerId);
        
        return {
          id: match.id,
          name: employer?.companyName || 'Unknown Company',
          matchDate: match.matchedAt,
          status: match.status === 'interview_scheduled' ? 'interview-scheduled' : 'matched',
          statusText: match.status === 'interview_scheduled' ? 
            'Interview scheduled' : 'New match'
        };
      });
  }

  // Employer profile methods
  async createEmployerProfile(userId: number, profileData: any): Promise<EmployerProfile> {
    const profile: EmployerProfile = {
      id: `ep_${Date.now()}`,
      userId,
      ...profileData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.employerProfiles.set(userId, profile);
    return profile;
  }

  async saveEmployerProfileDraft(userId: number, draftData: any): Promise<any> {
    const draft = {
      ...draftData,
      updatedAt: new Date()
    };
    this.employerProfileDrafts.set(userId, draft);
    return draft;
  }

  async getEmployerProfile(userId: number): Promise<EmployerProfile | undefined> {
    return this.employerProfiles.get(userId);
  }

  async getEmployerDashboard(userId: number): Promise<any> {
    const profile = this.employerProfiles.get(userId);
    
    const matches = this.matches.filter(match => match.employerId === userId.toString());
    
    // Mock job postings for this employer
    const jobs = Array.from(this.jobPostings.values())
      .filter(job => job.employerId === userId);
    
    // If no job postings in storage, return mock data
    const mockJobs = jobs.length === 0 ? [
      {
        id: 'job1',
        title: 'Software Engineer',
        department: 'Engineering',
        location: 'San Francisco, CA',
        workType: 'Onsite',
        employmentType: 'Full-time',
        status: 'Active',
        matchCount: 5
      },
      {
        id: 'job2',
        title: 'Product Designer',
        department: 'Design',
        location: 'Remote',
        workType: 'Remote',
        employmentType: 'Full-time',
        status: 'Active',
        matchCount: 3
      }
    ] : jobs;
    
    return {
      stats: {
        activeJobs: mockJobs.length,
        profileViews: 42,
        matches: matches.length,
        interviews: 3
      },
      jobs: mockJobs,
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
      .sort((a, b) => b.matchedAt.getTime() - a.matchedAt.getTime())
      .slice(0, 10)
      .map(match => {
        return {
          id: match.id,
          name: 'Anonymous Profile', // Jobseeker profiles are anonymous until a certain point
          matchDate: match.matchedAt,
          status: match.status === 'interview_scheduled' ? 'interview-scheduled' : 'matched',
          statusText: match.status === 'interview_scheduled' ? 
            'Interview scheduled' : 'New match'
        };
      });
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true,
      tableName: 'session',
      schemaName: 'public'
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
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
    const insertData = {
      userId,
      ...profileData
    };
    
    const [profile] = await db.insert(jobseekerProfiles).values([insertData]).returning();
    return profile;
  }

  async saveJobseekerProfileDraft(userId: number, draftData: any): Promise<any> {
    // Get existing profile
    const [existingProfile] = await db
      .select()
      .from(jobseekerProfiles)
      .where(eq(jobseekerProfiles.userId, userId));
    
    if (existingProfile) {
      // Update existing profile
      const [updatedProfile] = await db
        .update(jobseekerProfiles)
        .set({
          ...draftData,
          updatedAt: new Date()
        })
        .where(eq(jobseekerProfiles.userId, userId))
        .returning();
      
      return updatedProfile;
    } else {
      // Create a new profile draft
      const insertData = {
        userId,
        ...draftData
      };
      
      const [profile] = await db.insert(jobseekerProfiles).values([insertData]).returning();
      return profile;
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
    
    // Calculate profile completion percentage more accurately
    let completionScore = 0;
    let totalFields = 0;
    
    // Basic user fields (firstName, lastName, email, phone)
    if (user) {
      totalFields += 4;
      if (user.firstName) completionScore += 1;
      if (user.lastName) completionScore += 1;
      if (user.email) completionScore += 1;
      if (user.phone) completionScore += 1;
    }
    
    // Profile fields
    if (profile) {
      // Education fields
      if (profile.education) {
        totalFields += 3;
        if (profile.education.degree) completionScore += 1;
        if (profile.education.school) completionScore += 1;
        if (profile.education.major) completionScore += 1;
      }
      
      // Experience - check if it exists and has at least one entry
      if (profile.experience) {
        totalFields += 1;
        if (Array.isArray(profile.experience) && profile.experience.length > 0) {
          completionScore += 1;
        }
      }
      
      // Skills - check if it exists and has entries
      if (profile.skills) {
        totalFields += 1;
        if (Array.isArray(profile.skills) && profile.skills.length > 0) {
          completionScore += 1;
        }
      }
      
      // Slider values - check if they exist and have entries
      if (profile.sliderValues) {
        totalFields += 1;
        if (Object.keys(profile.sliderValues).length > 0) {
          completionScore += 1;
        }
      }
      
      // Location preferences - check if they exist and have entries
      if (profile.locationPreferences) {
        totalFields += 1;
        if (Array.isArray(profile.locationPreferences) && profile.locationPreferences.length > 0) {
          completionScore += 1;
        }
      }
    }
    
    // Calculate the percentage, default to 0 if no fields are found
    const profileCompletionPercentage = totalFields > 0 
      ? Math.round((completionScore / totalFields) * 100) 
      : 0;
    
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
    
    return {
      stats: {
        profileCompletion: {
          percentage: profileCompletionPercentage
          // Removed the fake increase percentage
        },
        profileViews: 0, // Set to 0 as we don't have actual profile view data yet
        matches: matchCount[0]?.count || 0 // This is already based on actual data
      },
      recentMatches: recentMatchesWithNames
    };
  }

  async getJobseekerPotentialMatches(userId: number): Promise<any[]> {
    try {
      // Check if jobseeker profile exists
      const [profile] = await db
        .select()
        .from(jobseekerProfiles)
        .where(eq(jobseekerProfiles.userId, userId));
      
      // If no profile exists, create a basic profile draft to avoid errors
      if (!profile) {
        // Get user data
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, userId));
          
        if (user) {
          // Create a minimal profile to ensure the rest of the functionality works
          console.log(`Creating minimal jobseeker profile for user ${userId}`);
          try {
            await db.insert(jobseekerProfiles).values({
              userId,
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
            console.log(`Created minimal jobseeker profile for user ${userId}`);
          } catch (err) {
            console.error(`Error creating minimal profile: ${err}`);
          }
        }
      }
      
      // Get employers this jobseeker hasn't swiped on yet
      const swipedEmployerIds = await db
        .select({ employerId: swipes.employerId })
        .from(swipes)
        .where(eq(swipes.jobseekerId, userId));
      
      // Get employer profiles that haven't been swiped on
      const potentialEmployers = await db
        .select({
          userId: employerProfiles.userId,
          companyName: employerProfiles.companyName,
          headquarters: employerProfiles.headquarters,
          aboutCompany: employerProfiles.aboutCompany
        })
        .from(employerProfiles)
        .where(
          sql`${employerProfiles.userId} NOT IN (
            SELECT ${swipes.employerId} FROM ${swipes} 
            WHERE ${swipes.jobseekerId} = ${userId}
          )`
        )
        .limit(5);
      
      // Format the results
      return await Promise.all(potentialEmployers.map(async (employer) => {
        // Get job postings for this employer
        const jobPostingsResult = await db
          .select({ title: jobPostings.title })
          .from(jobPostings)
          .where(eq(jobPostings.employerId, employer.userId))
          .limit(5);
        
        const positions = jobPostingsResult.length > 0
          ? jobPostingsResult.map(job => job.title)
          : ['Software Engineer', 'Product Manager', 'UX Designer'];
        
        return {
          id: employer.userId.toString(),
          name: employer.companyName || 'Unknown Company',
          location: employer.headquarters || 'Remote',
          description: employer.aboutCompany || 'No company description available',
          positions
        };
      }));
    } catch (error) {
      console.error('Error in getJobseekerPotentialMatches:', error);
      return []; // Return empty array instead of crashing
    }
  }

  async handleJobseekerSwipe(jobseekerId: number, employerId: string, interested: boolean): Promise<any> {
    // Insert swipe record
    const employerIdNum = parseInt(employerId);
    const swipeData = {
      jobseekerId,
      employerId: employerIdNum,
      interested
    };
    
    const [swipe] = await db.insert(swipes).values([swipeData]).returning();
    
    // Check if there's a match (employer already swiped right on this jobseeker)
    if (interested) {
      const [employerSwipe] = await db
        .select()
        .from(swipes)
        .where(
          and(
            eq(swipes.employerId, employerIdNum),
            eq(swipes.jobseekerId, jobseekerId),
            eq(swipes.interested, true)
          )
        );
      
      if (employerSwipe) {
        // Create a match
        const matchData = {
          jobseekerId,
          employerId: employerIdNum,
          status: 'new'
        };
        
        const [match] = await db.insert(matches).values([matchData]).returning();
        return { match, isMatch: true };
      }
    }
    
    return { isMatch: false };
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
          matchDate: match.matchedAt,
          status: match.status === 'interview_scheduled' ? 'interview-scheduled' : 'matched',
          statusText: match.status === 'interview_scheduled' ? 'Interview scheduled' : 'New match'
        };
      })
    );
  }

  // Employer profile methods
  async createEmployerProfile(userId: number, profileData: any): Promise<EmployerProfile> {
    const insertData = {
      userId,
      ...profileData
    };
    
    const [profile] = await db.insert(employerProfiles).values([insertData]).returning();
    return profile;
  }

  async saveEmployerProfileDraft(userId: number, draftData: any): Promise<any> {
    // Get existing profile
    const [existingProfile] = await db
      .select()
      .from(employerProfiles)
      .where(eq(employerProfiles.userId, userId));
    
    if (existingProfile) {
      // Update existing profile
      const [updatedProfile] = await db
        .update(employerProfiles)
        .set({
          ...draftData,
          updatedAt: new Date()
        })
        .where(eq(employerProfiles.userId, userId))
        .returning();
      
      return updatedProfile;
    } else {
      // Create a new profile draft
      const insertData = {
        userId,
        ...draftData
      };
      
      const [profile] = await db.insert(employerProfiles).values([insertData]).returning();
      return profile;
    }
  }

  async getEmployerProfile(userId: number): Promise<EmployerProfile | undefined> {
    const [profile] = await db
      .select()
      .from(employerProfiles)
      .where(eq(employerProfiles.userId, userId));
    
    return profile;
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
    
    // If no job postings in storage, return mock data
    const displayJobs = formattedJobs.length === 0 ? [
      {
        id: 'job1',
        title: 'Software Engineer',
        department: 'Engineering',
        location: 'San Francisco, CA',
        workType: 'Onsite',
        employmentType: 'Full-time',
        status: 'Active',
        matchCount: 5
      },
      {
        id: 'job2',
        title: 'Product Designer',
        department: 'Design',
        location: 'Remote',
        workType: 'Remote',
        employmentType: 'Full-time',
        status: 'Active',
        matchCount: 3
      }
    ] : formattedJobs;
    
    return {
      stats: {
        activeJobs: jobsCount[0]?.count || 0,
        profileViews: 0, // Set to 0 as we don't have a profile view tracking mechanism yet
        matches: matchCount[0]?.count || 0,
        interviews: 0 // Set to 0 as we don't have interview scheduling yet
      },
      jobs: displayJobs,
      recentMatches: recentMatches.map(match => ({
        id: match.id,
        name: 'Anonymous Profile', // Jobseeker profiles are anonymous until a certain point
        matchDate: match.matchedAt,
        status: match.status === 'interview_scheduled' ? 'interview-scheduled' : 'matched',
        statusText: match.status === 'interview_scheduled' ? 'Interview scheduled' : 'New match'
      }))
    };
  }

  async getEmployerPotentialMatches(userId: number): Promise<any[]> {
    // Get jobseekers this employer hasn't swiped on yet
    const swipedJobseekerIds = await db
      .select({ jobseekerId: swipes.jobseekerId })
      .from(swipes)
      .where(eq(swipes.employerId, userId));
    
    const jobseekerIdsSet = new Set(swipedJobseekerIds.map(s => s.jobseekerId));
    
    // Get jobseeker profiles that haven't been swiped on
    const potentialJobseekers = await db
      .select()
      .from(jobseekerProfiles)
      .where(sql`${jobseekerProfiles.userId} NOT IN (
        SELECT ${swipes.jobseekerId} FROM ${swipes} 
        WHERE ${swipes.employerId} = ${userId}
      )`)
      .limit(5);
    
    // Format the results
    return potentialJobseekers.map(jobseeker => ({
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
    }));
  }

  async handleEmployerSwipe(employerId: number, jobseekerId: string, interested: boolean): Promise<any> {
    // Insert swipe record
    const jobseekerIdNum = parseInt(jobseekerId);
    const swipeData = {
      employerId,
      jobseekerId: jobseekerIdNum,
      interested
    };
    
    const [swipe] = await db.insert(swipes).values([swipeData]).returning();
    
    // Check if there's a match (jobseeker already swiped right on this employer)
    if (interested) {
      const [jobseekerSwipe] = await db
        .select()
        .from(swipes)
        .where(
          and(
            eq(swipes.jobseekerId, jobseekerIdNum),
            eq(swipes.employerId, employerId),
            eq(swipes.interested, true)
          )
        );
      
      if (jobseekerSwipe) {
        // Create a match
        const matchData = {
          jobseekerId: jobseekerIdNum,
          employerId,
          status: 'new'
        };
        
        const [match] = await db.insert(matches).values([matchData]).returning();
        return { match, isMatch: true };
      }
    }
    
    return { isMatch: false };
  }

  async getEmployerRecentMatches(userId: number): Promise<any[]> {
    const recentMatches = await db
      .select()
      .from(matches)
      .where(eq(matches.employerId, userId))
      .orderBy(desc(matches.matchedAt))
      .limit(10);
    
    return recentMatches.map(match => ({
      id: match.id,
      name: 'Anonymous Profile', // Jobseeker profiles are anonymous until a certain point
      matchDate: match.matchedAt,
      status: match.status === 'interview_scheduled' ? 'interview-scheduled' : 'matched',
      statusText: match.status === 'interview_scheduled' ? 'Interview scheduled' : 'New match'
    }));
  }
}

export const storage = new DatabaseStorage();
