import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { getInitials } from '@/lib/utils';
import { formatDate } from '@/lib/utils';

export interface Match {
  id: string;
  name: string;
  matchDate: Date | string | number | null;
  status: 'interview-scheduled' | 'shared-jobs' | 'matched' | 'message-received';
  statusText?: string;
}

interface RecentMatchesProps {
  matches: Match[];
  emptyMessage: string;
  viewAllLink: string;
}

export default function RecentMatches({ matches, emptyMessage, viewAllLink }: RecentMatchesProps) {
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'interview-scheduled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Interview Scheduled
          </span>
        );
      case 'shared-jobs':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Shared Jobs
          </span>
        );
      case 'matched':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Matched
          </span>
        );
      case 'message-received':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Message Received
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Matches</h3>
        <p className="mt-1 text-sm text-gray-500">Companies you've matched with recently.</p>
      </div>
      
      {matches.length > 0 ? (
        <>
          <ul className="divide-y divide-gray-200">
            {matches.map((match) => (
              <li key={match.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="font-medium text-gray-700">{getInitials(match.name)}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{match.name}</div>
                        <div className="text-sm text-gray-500">Matched {formatDate(match.matchDate)}</div>
                      </div>
                    </div>
                    <div>
                      <Button 
                        variant="outline"
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-primary bg-primary-100 hover:bg-primary-200 focus:outline-none"
                      >
                        Message
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm text-gray-500">
                      {getStatusBadge(match.status)}
                      {match.statusText && <span className="ml-2">{match.statusText}</span>}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="px-4 py-4 sm:px-6 border-t border-gray-200">
            <Link href={viewAllLink} className="text-sm font-medium text-primary hover:text-primary/80">
              View all matches <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </>
      ) : (
        <div className="px-4 py-12 text-center text-gray-500">
          <p>{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}
