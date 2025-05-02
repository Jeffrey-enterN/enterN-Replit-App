import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, MoreVertical, ShieldAlert, UserCog, UserMinus, UserPlus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import CompanyInviteForm from './company-invite-form';

interface TeamMember {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  companyRole: string;
  username: string;
}

interface Invite {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

interface CompanyTeamPanelProps {
  companyId: number;
  userId: number;
  isAdmin: boolean;
}

export default function CompanyTeamPanel({ companyId, userId, isAdmin }: CompanyTeamPanelProps) {
  const { toast } = useToast();
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('recruiter');

  // Fetch team members
  const { data: teamMembers, isLoading: isLoadingTeam } = useQuery({
    queryKey: [`/api/employer/company/${companyId}/team`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/employer/company/${companyId}/team`);
      const data = await response.json();
      return data as TeamMember[];
    },
    enabled: !!companyId,
  });

  // Fetch invites
  const { data: invites, isLoading: isLoadingInvites } = useQuery({
    queryKey: [`/api/employer/company/${companyId}/invites`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/employer/company/${companyId}/invites`);
      const data = await response.json();
      return data as Invite[];
    },
    enabled: !!companyId && isAdmin,
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: number; role: string }) => {
      const response = await apiRequest('PUT', `/api/employer/company/${companyId}/team/${memberId}/role`, {
        role,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Role Updated',
        description: 'Team member role has been updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/employer/company/${companyId}/team`] });
      setIsRoleDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Remove team member mutation
  const removeTeamMemberMutation = useMutation({
    mutationFn: async (memberId: number) => {
      const response = await apiRequest('DELETE', `/api/employer/company/${companyId}/team/${memberId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Team Member Removed',
        description: 'The team member has been removed from your company',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/employer/company/${companyId}/team`] });
      setIsRemoveDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Cancel invite mutation
  const cancelInviteMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      const response = await apiRequest('DELETE', `/api/employer/company/invite/${inviteId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Invitation Cancelled',
        description: 'The invitation has been cancelled',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/employer/company/${companyId}/invites`] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Resend invite mutation
  const resendInviteMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      const response = await apiRequest('POST', `/api/employer/company/invite/${inviteId}/resend`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Invitation Resent',
        description: 'The invitation has been sent again',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/employer/company/${companyId}/invites`] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleRoleChange = (memberId: number, role: string) => {
    setSelectedMemberId(memberId);
    setSelectedRole(role);
    setIsRoleDialogOpen(true);
  };

  const confirmRoleChange = () => {
    if (selectedMemberId) {
      updateRoleMutation.mutate({ memberId: selectedMemberId, role: selectedRole });
    }
  };

  const handleRemoveMember = (memberId: number) => {
    setSelectedMemberId(memberId);
    setIsRemoveDialogOpen(true);
  };

  const confirmRemoveMember = () => {
    if (selectedMemberId) {
      removeTeamMemberMutation.mutate(selectedMemberId);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'hiring_manager':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getInviteStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatName = (member: TeamMember) => {
    if (member.firstName && member.lastName) {
      return `${member.firstName} ${member.lastName}`;
    }
    return member.username || member.email || 'Unknown User';
  };

  const getInitials = (member: TeamMember) => {
    if (member.firstName && member.lastName) {
      return `${member.firstName[0]}${member.lastName[0]}`.toUpperCase();
    }
    return member.username ? member.username[0].toUpperCase() : 'U';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Company Team</CardTitle>
        <CardDescription>
          Manage your company team members and invitations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="members" className="space-y-4">
          <TabsList>
            <TabsTrigger value="members">Team Members</TabsTrigger>
            {isAdmin && <TabsTrigger value="invites">Pending Invites</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="members" className="space-y-4">
            {isLoadingTeam ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : teamMembers && teamMembers.length > 0 ? (
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>{getInitials(member)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{formatName(member)}</div>
                        <div className="text-sm text-muted-foreground">{member.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${getRoleBadgeColor(member.companyRole)}`}>
                        {member.companyRole === 'hiring_manager' ? 'Hiring Manager' : 
                         member.companyRole.charAt(0).toUpperCase() + member.companyRole.slice(1)}
                      </Badge>
                      
                      {isAdmin && member.id !== userId && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleRoleChange(member.id, member.companyRole)}>
                              <UserCog className="mr-2 h-4 w-4" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-red-600"
                            >
                              <UserMinus className="mr-2 h-4 w-4" />
                              Remove from Company
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No team members found
              </div>
            )}
            
            {isAdmin && (
              <div className="mt-6 pt-4 border-t">
                <CompanyInviteForm companyId={companyId} />
              </div>
            )}
          </TabsContent>
          
          {isAdmin && (
            <TabsContent value="invites" className="space-y-4">
              {isLoadingInvites ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : invites && invites.length > 0 ? (
                <div className="space-y-3">
                  {invites.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <div className="font-medium">{invite.email}</div>
                        <div className="flex mt-1 space-x-2">
                          <Badge className={getRoleBadgeColor(invite.role)}>
                            {invite.role === 'hiring_manager' ? 'Hiring Manager' : 
                             invite.role.charAt(0).toUpperCase() + invite.role.slice(1)}
                          </Badge>
                          <Badge className={getInviteStatusBadgeColor(invite.status)}>
                            {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Sent: {new Date(invite.createdAt).toLocaleDateString()}
                          {invite.status === 'pending' && ` • Expires: ${new Date(invite.expiresAt).toLocaleDateString()}`}
                        </div>
                      </div>
                      <div>
                        {invite.status === 'pending' ? (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => resendInviteMutation.mutate(invite.id)}
                              disabled={resendInviteMutation.isPending}
                            >
                              {resendInviteMutation.isPending && (
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              )}
                              Resend
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => cancelInviteMutation.mutate(invite.id)}
                              disabled={cancelInviteMutation.isPending}
                            >
                              {cancelInviteMutation.isPending && (
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              )}
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cancelInviteMutation.mutate(invite.id)}
                            disabled={cancelInviteMutation.isPending}
                          >
                            {cancelInviteMutation.isPending && (
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            )}
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No pending invitations
                </div>
              )}
              
              <div className="mt-6 pt-4 border-t">
                <CompanyInviteForm companyId={companyId} />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>

      {/* Role Change Dialog */}
      <AlertDialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Team Member Role</AlertDialogTitle>
            <AlertDialogDescription>
              This will change the user's permissions within your company.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recruiter">Recruiter</SelectItem>
                <SelectItem value="hiring_manager">Hiring Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange} disabled={updateRoleMutation.isPending}>
              {updateRoleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Member Dialog */}
      <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="flex items-center space-x-2 text-amber-600 mb-2">
                <ShieldAlert className="h-5 w-5" />
                <span className="font-medium">Warning</span>
              </div>
              This will remove the user from your company. They will no longer have access to your company data or be able to view potential matches.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRemoveMember} 
              disabled={removeTeamMemberMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {removeTeamMemberMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}