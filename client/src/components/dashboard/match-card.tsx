import React from 'react';
import { Button } from '@/components/ui/button';
import { USER_TYPES } from '@/lib/constants';
import { getInitials } from '@/lib/utils';

interface JobseekerMatch {
  id: string;
  sliderValues: Record<string, number>;
  education: {
    degree: string;
    major: string;
    school: string;
  };
  locations: string[];
}

interface EmployerMatch {
  id: string;
  name: string;
  location: string;
  description: string;
  positions: string[];
  logo?: string;
}

interface MatchCardProps {
  userType: string;
  data: JobseekerMatch | EmployerMatch;
  onInterested: (id: string) => void;
  onNotInterested: (id: string) => void;
  isPending?: boolean;
}

export default function MatchCard({ userType, data, onInterested, onNotInterested, isPending = false }: MatchCardProps) {
  if (userType === USER_TYPES.JOBSEEKER) {
    const employer = data as EmployerMatch;
    return (
      <div className="relative mx-auto bg-white shadow-md rounded-lg max-w-md overflow-hidden">
        <img 
          className="h-48 w-full object-cover" 
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" 
          alt="Company building"
        />
        
        <div className="p-5">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center">
              {employer.logo ? (
                <img src={employer.logo} alt={`${employer.name} logo`} className="h-8 w-8" />
              ) : (
                <span className="text-lg font-bold text-gray-700">{getInitials(employer.name)}</span>
              )}
            </div>
            <div className="ml-4">
              <h4 className="text-xl font-semibold text-gray-900">{employer.name}</h4>
              <p className="text-gray-600 text-sm">{employer.location}</p>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-700">
              {employer.description}
            </p>
          </div>
          
          <div className="mb-4">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Hiring for</h5>
            <div className="flex flex-wrap gap-2">
              {employer.positions.map((position, index) => (
                <span 
                  key={index} 
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                >
                  {position}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mt-6 flex justify-between">
            <Button
              onClick={() => onNotInterested(employer.id)}
              disabled={isPending}
              variant="outline"
              className="flex-1 mr-2 border border-gray-300 rounded-md py-2 px-3 flex items-center justify-center text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <svg className="h-5 w-5 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              Not Interested
            </Button>
            <Button
              onClick={() => onInterested(employer.id)}
              disabled={isPending}
              className="flex-1 ml-2 bg-primary border border-transparent rounded-md py-2 px-3 flex items-center justify-center text-sm font-medium text-white hover:bg-primary-600"
            >
              <svg className="h-5 w-5 text-white mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
              Interested
            </Button>
          </div>
        </div>
      </div>
    );
  } else {
    // Employer viewing jobseeker
    const jobseeker = data as JobseekerMatch;
    
    // Select a few key sliders to display
    const sliderSamples = [
      { id: 'schedule', left: 'Fixed Schedule', right: 'Flexible Hours' },
      { id: 'collaboration-preference', left: 'Collaborative', right: 'Independent' },
      { id: 'execution', left: 'Methodical Execution', right: 'Rapid Iteration' }
    ];
    
    return (
      <div className="relative mx-auto bg-white shadow-md rounded-lg max-w-md overflow-hidden">
        <div className="px-5 pt-5">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex-shrink-0 flex items-center justify-center">
              <svg className="h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <h4 className="text-xl font-semibold text-gray-900">Anonymous Profile</h4>
              <p className="text-gray-600 text-sm">{jobseeker.education.major} Student</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">Education</h5>
              <p className="text-sm text-gray-900">
                {jobseeker.education.degree}<br />
                {jobseeker.education.major}<br />
                {jobseeker.education.school}
              </p>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">Location Preferences</h5>
              <p className="text-sm text-gray-900">
                {jobseeker.locations.slice(0, 3).map((loc, i) => (
                  <React.Fragment key={i}>
                    {loc}<br />
                  </React.Fragment>
                ))}
                {jobseeker.locations.length > 3 && '...'}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Work Style</h5>
            
            {sliderSamples.map((slider) => (
              <div key={slider.id} className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{slider.left}</span>
                  <span>{slider.right}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded">
                  <div 
                    className="h-2 bg-primary rounded" 
                    style={{ 
                      width: `${jobseeker.sliderValues[slider.id] || 50}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mb-3">
            <button type="button" className="w-full text-sm text-primary hover:text-primary/80 font-medium">
              View complete profile
            </button>
          </div>
          
          <div className="mt-4 flex justify-between pb-5">
            <Button
              onClick={() => onNotInterested(jobseeker.id)}
              disabled={isPending}
              variant="outline"
              className="flex-1 mr-2 border border-gray-300 rounded-md py-2 px-3 flex items-center justify-center text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <svg className="h-5 w-5 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              Not Interested
            </Button>
            <Button
              onClick={() => onInterested(jobseeker.id)}
              disabled={isPending}
              className="flex-1 ml-2 bg-primary border border-transparent rounded-md py-2 px-3 flex items-center justify-center text-sm font-medium text-white hover:bg-primary-600"
            >
              <svg className="h-5 w-5 text-white mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
              Interested
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
