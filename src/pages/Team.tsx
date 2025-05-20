
import React, { useState } from "react";
import { useTeam } from "@/domains/team/hooks/useTeam";
import { InvitationData } from "@/domains/team/types";
import { TeamMemberForm } from "@/components/team/TeamMemberForm";
import { TeamMembersTable } from "@/components/team/TeamMembersTable";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export const Team = () => {
  const { teamMembers, isLoading, inviteTeamMember, isInviting } = useTeam();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [invitationLink, setInvitationLink] = useState<string | null>(null);

  const handleInvite = (data: InvitationData) => {
    inviteTeamMember(data, {
      onSuccess: (response) => {
        setInvitationLink(response.inviteLink);
      }
    });
  };

  const onSheetClose = () => {
    setIsSheetOpen(false);
    setInvitationLink(null);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Team Members</h1>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Invite Team Member
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Invite Team Member</SheetTitle>
              <SheetDescription>
                Send an invitation to join your team.
              </SheetDescription>
            </SheetHeader>
            <div className="py-6 space-y-6">
              {invitationLink ? (
                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>Invitation created</AlertTitle>
                  <AlertDescription className="mt-2 break-all">
                    <p className="mb-2">Share this link with the team member:</p>
                    <code className="bg-secondary p-2 rounded-md text-xs block">
                      {invitationLink}
                    </code>
                    <p className="mt-2 text-xs text-muted-foreground">
                      In a production environment, an email would be sent automatically.
                    </p>
                  </AlertDescription>
                </Alert>
              ) : (
                <TeamMemberForm
                  onSubmit={handleInvite}
                  isSubmitting={isInviting}
                />
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <TeamMembersTable members={teamMembers} />
      )}
    </div>
  );
};
