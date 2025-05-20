
import React from "react";
import { TeamMember } from "@/domains/team/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

interface TeamMembersTableProps {
  members: TeamMember[];
  onSendMagicLink?: (email: string) => void;
  isSendingMagicLink?: boolean;
}

export const TeamMembersTable: React.FC<TeamMembersTableProps> = ({
  members,
  onSendMagicLink,
  isSendingMagicLink = false
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">User</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24">
                No team members found
              </TableCell>
            </TableRow>
          ) : (
            members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <Avatar>
                    <AvatarImage src={member.avatar_url || undefined} alt={member.full_name} />
                    <AvatarFallback>{member.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{member.full_name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>
                  <Badge variant={member.role === 'admin' ? "default" : "outline"}>
                    {member.role === 'admin' ? 'Administrator' : 'Team Member'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {member.last_sign_in_at
                    ? `${formatDistanceToNow(new Date(member.last_sign_in_at))} ago`
                    : "Never"}
                </TableCell>
                <TableCell className="text-right">
                  {onSendMagicLink && (
                    <Button variant="outline" size="sm" onClick={() => onSendMagicLink(member.email)} disabled={isSendingMagicLink}>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Magic Link
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
