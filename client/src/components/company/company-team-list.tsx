import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { MoreHorizontal, Shield, Trash2, UserCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { getInitials } from '@/lib/utils';

interface TeamMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isAdmin: boolean;
}

interface CompanyTeamListProps {
  teamMembers: TeamMember[];
  currentUserId: number;
}

export default function CompanyTeamList({ teamMembers, currentUserId }: CompanyTeamListProps) {
  const { toast } = useToast();
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  
  const removeTeamMemberMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest('DELETE', `/api/employer/company/team/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Team Member Removed',
        description: 'The team member has been removed from your company',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/employer/company/team'] });
      setMemberToRemove(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const response = await apiRequest('PUT', `/api/employer/company/team/${userId}/role`, {
        role,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Role Updated',
        description: 'The team member\'s role has been updated',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/employer/company/team'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleRemoveTeamMember = () => {
    if (memberToRemove) {
      removeTeamMemberMutation.mutate(memberToRemove.id);
    }
  };

  const handleRoleChange = (userId: number, role: string) => {
    updateRoleMutation.mutate({ userId, role });
  };

  if (teamMembers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No team members found. Invite colleagues to join your company.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="py-3 text-left font-medium text-sm text-gray-500">User</th>
              <th className="py-3 text-left font-medium text-sm text-gray-500">Email</th>
              <th className="py-3 text-left font-medium text-sm text-gray-500">Role</th>
              <th className="py-3 text-right font-medium text-sm text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teamMembers.map((member) => (
              <tr key={member.id} className="border-b hover:bg-gray-50">
                <td className="py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-3">
                      {getInitials(`${member.firstName} ${member.lastName}`)}
                    </div>
                    <div>
                      <p className="font-medium">
                        {member.firstName} {member.lastName}
                        {member.id === currentUserId && (
                          <span className="ml-2 text-xs text-gray-500">(You)</span>
                        )}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 text-gray-600">{member.email}</td>
                <td className="py-4">
                  <div className="flex items-center">
                    {member.isAdmin && (
                      <Shield className="h-4 w-4 text-primary mr-2" />
                    )}
                    <Badge variant={member.isAdmin ? "default" : "outline"}>
                      {member.role}
                    </Badge>
                  </div>
                </td>
                <td className="py-4 text-right">
                  {member.id !== currentUserId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => handleRoleChange(member.id, 'recruiter')}
                          disabled={member.role === 'recruiter' || updateRoleMutation.isPending}
                        >
                          <UserCircle className="mr-2 h-4 w-4" />
                          Make Recruiter
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(member.id, 'admin')}
                          disabled={member.role === 'admin' || updateRoleMutation.isPending}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Make Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setMemberToRemove(member)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToRemove?.firstName} {memberToRemove?.lastName} from your company?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveTeamMember}
              disabled={removeTeamMemberMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {removeTeamMemberMutation.isPending ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}