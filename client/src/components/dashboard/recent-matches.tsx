import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { getInitials } from '@/lib/utils';
import { formatDate } from '@/lib/utils';

export interface Match {
  id: string;
  name: string;
  matchDate: Date | string | number | null;
  status: 'interview-scheduled' | 'shared-jobs' | 'matched' | 'message-received' | 'mutual-match';
  statusText?: string;
}

interface RecentMatchesProps {
  matches: Match[];
  emptyMessage: string;
  viewAllLink: string;
  isEmployer?: boolean;
}

export default function RecentMatches({ matches, emptyMessage, viewAllLink, isEmployer = false }: RecentMatchesProps) {
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
      case 'mutual-match':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Mutual Match
          </span>
        );
      case 'matched':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Pending Match
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
    <div className="bg-white dark:bg-gray-700 shadow-md rounded-lg overflow-hidden border border-border transform transition-all hover:shadow-lg">
      <div className="px-4 py-5 border-b border-border sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-foreground">Recent Matches</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {isEmployer 
            ? "Jobseekers you've matched with recently." 
            : "Companies you've matched with recently."}
        </p>
      </div>
      
      {matches.length > 0 ? (
        <>
          <ul className="divide-y divide-border">
            {matches.map((match) => (
              <li key={match.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="font-medium text-foreground">{getInitials(match.name)}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-foreground">{match.name}</div>
                        <div className="text-sm text-muted-foreground">Matched {formatDate(match.matchDate)}</div>
                      </div>
                    </div>
                    <div>
                      {match.status === 'mutual-match' ? (
                        <Button 
                          variant="outline"
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-primary bg-primary/10 hover:bg-primary/20 focus:outline-none"
                        >
                          Message
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground px-2">Waiting for match</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm text-muted-foreground">
                      {getStatusBadge(match.status)}
                      {match.statusText && <span className="ml-2">{match.statusText}</span>}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="px-4 py-4 sm:px-6 border-t border-border">
            <Link href={viewAllLink} className="text-sm font-medium text-primary hover:text-primary/80">
              View all matches <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </>
      ) : (
        <div className="px-4 py-12 text-center text-muted-foreground">
          <p>{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}
