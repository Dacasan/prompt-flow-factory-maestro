
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

interface TicketsTableProps {
  tickets: {
    id: string;
    title: string;
    description?: string;
    status: string;
    client_id: string;
    created_by?: string;
    assigned_to?: string;
    created_at: string;
    clients?: { name: string; email: string };
    profiles?: { full_name: string; avatar_url?: string };
    assigned?: { full_name: string; avatar_url?: string };
  }[];
  team: {
    id: string;
    full_name: string;
    avatar_url?: string;
  }[];
  onUpdateStatus: (id: string, status: string) => void;
  isUpdating: boolean;
}

export const TicketsTable: React.FC<TicketsTableProps> = ({
  tickets,
  team,
  onUpdateStatus,
  isUpdating
}) => {
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "open":
        return "default";
      case "in_progress":
        return "outline";
      case "resolved":
        return "secondary";
      case "closed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PP");
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24">
                No tickets found
              </TableCell>
            </TableRow>
          ) : (
            tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell className="font-medium">
                  {ticket.title}
                  {ticket.description && (
                    <p className="text-sm text-muted-foreground truncate max-w-xs">
                      {ticket.description}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  {ticket.clients?.name || "Unknown Client"}
                </TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariant(ticket.status)}>
                    {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  {formatDate(ticket.created_at)}
                </TableCell>
                <TableCell>
                  {ticket.assigned ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={ticket.assigned?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {ticket.assigned.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{ticket.assigned.full_name}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Select 
                    defaultValue={ticket.status}
                    disabled={isUpdating}
                    onValueChange={(value) => onUpdateStatus(ticket.id, value)}
                  >
                    <SelectTrigger className="w-[140px] h-8 text-xs">
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
