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
  <div className="bg-white overflow-hidden shadow-sm rounded-lg">
    <div className="px-4 py-5 sm:p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 ${color} rounded-md p-3`}>
          {icon}
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd>
              <div className="text-lg font-medium text-gray-900">{value}</div>
              {subtext && <div className="text-xs text-gray-500 mt-1">{subtext}</div>}
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
  };
}

export default function OverviewStats({ userType, stats }: OverviewStatsProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {userType === USER_TYPES.JOBSEEKER && stats.profileCompletion && (
          <div className={`bg-white overflow-hidden shadow-sm rounded-lg ${stats.profileCompletion.percentage < 100 ? 'ring-2 ring-primary' : ''}`}>
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary rounded-md p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Profile Completion</dt>
                    <dd>
                      <div className="flex items-center">
                        <div className="text-lg font-medium text-gray-900">{stats.profileCompletion.percentage}%</div>
                        {stats.profileCompletion.increase && (
                          <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                            <svg className="self-center flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="sr-only">Increased by</span>
                            {stats.profileCompletion.increase}%
                          </div>
                        )}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-primary-100">
                    <div 
                      style={{ width: `${stats.profileCompletion.percentage}%` }} 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
                    ></div>
                  </div>
                </div>
                <div className="mt-3">
                  <Link href="/jobseeker/profile" className="text-sm font-medium text-primary hover:text-primary/80">
                    Complete your profile <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
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
            link={{ url: "/employer/jobs", text: "View all jobs" }}
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
              url: userType === USER_TYPES.EMPLOYER ? "/employer/matches" : "/jobseeker/matches", 
              text: "View all matches" 
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
          link={{ 
            url: userType === USER_TYPES.EMPLOYER ? "/employer/calendar" : "/jobseeker/calendar", 
            text: "View calendar" 
          }}
        />
      </div>
      
      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">
            Performance Metrics
          </span>
        </div>
      </div>

      {/* Placeholder for data visualizations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-64 flex items-center justify-center">
          <p className="text-gray-400 text-center">Application Activity<br/>Coming soon</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-64 flex items-center justify-center">
          <p className="text-gray-400 text-center">Match Statistics<br/>Coming soon</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-64 flex items-center justify-center">
          <p className="text-gray-400 text-center">Engagement Metrics<br/>Coming soon</p>
        </div>
      </div>
    </div>
  );
}
