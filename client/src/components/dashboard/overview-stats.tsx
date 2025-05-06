import React from 'react';
import { Link } from 'wouter';
import { USER_TYPES } from '@/lib/constants';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  link?: {
    url: string;
    text: string;
  };
  subtext?: string;
}

const StatCard = ({ title, value, icon, color, link, subtext }: StatCardProps) => (
  <div className="bg-card overflow-hidden shadow-sm rounded-lg border">
    <div className="px-4 py-5 sm:p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 ${color} rounded-md p-3`}>
          {icon}
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-muted-foreground truncate">{title}</dt>
            <dd>
              <div className="text-lg font-medium text-foreground">{value}</div>
              {subtext && <div className="text-xs text-muted-foreground mt-1">{subtext}</div>}
            </dd>
          </dl>
        </div>
      </div>
      {link && (
        <div className="mt-5">
          <Link href={link.url} className="text-sm font-medium text-primary hover:text-primary/80">
            {link.text} <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      )}
    </div>
  </div>
);

interface OverviewStatsProps {
  userType: string;
  stats: {
    profileCompletion?: {
      percentage: number;
      increase?: number;
    };
    profileViews?: number;
    matches?: number;
    interviews?: number;
    activeJobs?: number;
    swipeAnalytics?: {
      likes: number;
      rejections: number;
      totalSwipes: number;
      likeRatio: number;
    };
  };
}

export default function OverviewStats({ userType, stats }: OverviewStatsProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {userType === USER_TYPES.JOBSEEKER && (
          <div className="bg-card overflow-hidden shadow-sm rounded-lg border ring-2 ring-primary">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary rounded-md p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-muted-foreground truncate">Your Match Profile</dt>
                    <dd>
                      <div className="flex items-center">
                        <div className="text-lg font-medium text-foreground">Keep Updated</div>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-5">
                <Link href="/jobseeker/profile" className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                  Update Your Match Profile
                </Link>
              </div>
            </div>
          </div>
        )}

        {userType === USER_TYPES.EMPLOYER && stats.activeJobs !== undefined && (
          <StatCard 
            title="Active Jobs"
            value={stats.activeJobs}
            icon={<svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>}
            color="bg-primary"
            link={{ url: "/employer/match-feed", text: "View match feed" }}
          />
        )}
        
        {stats.profileViews !== undefined && (
          <StatCard 
            title="Profile Views"
            value={stats.profileViews}
            icon={<svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>}
            color="bg-accent"
            subtext="Last 7 days"
          />
        )}
        
        {stats.matches !== undefined && (
          <StatCard 
            title={userType === USER_TYPES.EMPLOYER ? "Total Matches" : "Matches"}
            value={stats.matches}
            icon={<svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>}
            color="bg-secondary"
            link={{ 
              url: userType === USER_TYPES.EMPLOYER ? "/employer/match-feed" : "/jobseeker/match-feed", 
              text: "Go to match feed" 
            }}
          />
        )}
        
        {/* Match Feed Entry Card */}
        <StatCard 
          title="Match Feed"
          value="Discover"
          icon={<svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>}
          color="bg-primary"
          link={{ 
            url: userType === USER_TYPES.EMPLOYER ? "/employer/match-feed" : "/jobseeker/match-feed", 
            text: "Enter match feed" 
          }}
        />
        
        {/* Calendar Card */}
        <StatCard 
          title="Calendar"
          value="Schedule"
          icon={<svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>}
          color="bg-secondary"
          subtext="Coming soon"
        />
      </div>
      
      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-background text-muted-foreground">
            Performance Metrics
          </span>
        </div>
      </div>

      {/* Data visualizations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {userType === USER_TYPES.EMPLOYER && stats.swipeAnalytics ? (
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border h-64">
            <h3 className="text-lg font-medium mb-4">Swipe Analytics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Like to Reject Ratio</span>
                  <span className="text-sm font-medium">{stats.swipeAnalytics.likeRatio}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${stats.swipeAnalytics.likeRatio}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-primary">{stats.swipeAnalytics.likes}</div>
                  <div className="text-sm text-muted-foreground mt-1">Likes</div>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-secondary">{stats.swipeAnalytics.rejections}</div>
                  <div className="text-sm text-muted-foreground mt-1">Passes</div>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="text-sm text-muted-foreground">
                  Total Swipes: <span className="font-medium">{stats.swipeAnalytics.totalSwipes}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  A higher like rate may increase your match opportunities.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border h-64 flex items-center justify-center">
            <p className="text-muted-foreground text-center">Application Activity<br/>Coming soon</p>
          </div>
        )}
        
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border h-64 flex items-center justify-center">
          <p className="text-muted-foreground text-center">Match Statistics<br/>Coming soon</p>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border h-64 flex items-center justify-center">
          <p className="text-muted-foreground text-center">Engagement Metrics<br/>Coming soon</p>
        </div>
      </div>
    </div>
  );
}
