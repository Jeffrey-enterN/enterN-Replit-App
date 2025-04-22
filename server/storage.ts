import { 
  users, 
  User, 
  InsertUser, 
  JobseekerProfile, 
  EmployerProfile, 
  Match, 
  JobPosting,
  Swipe
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Define the SessionStore type
type SessionStore = ReturnType<typeof createMemoryStore>;

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
  sessionStore: session.SessionStore;

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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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
    const profileCompletionPercentage = profile ? 85 : 10; // Mock calculation
    
    const matches = this.matches.filter(match => match.jobseekerId === userId);
    
    return {
      stats: {
        profileCompletion: {
          percentage: profileCompletionPercentage,
          increase: 20
        },
        profileViews: 28,
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

export const storage = new MemStorage();
