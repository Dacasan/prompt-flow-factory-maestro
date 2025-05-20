
import React from "react";
import { Subscription } from "@/domains/subscriptions/types";
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
import { Ban } from "lucide-react";
import { format } from "date-fns";

// Extended subscription type with related entities
type ExtendedSubscription = Subscription & {
  clients: { name: string; email: string };
  services: { name: string; price: number; type: string };
};

interface SubscriptionsTableProps {
  subscriptions: ExtendedSubscription[];
  onCancel: (id: string) => void;
}

export const SubscriptionsTable: React.FC<SubscriptionsTableProps> = ({
  subscriptions,
  onCancel,
}) => {
  // Helper function to get badge variant based on status
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'canceled':
        return <Badge variant="destructive">Canceled</Badge>;
      case 'past_due':
        return <Badge variant="warning">Past Due</Badge>;
      case 'unpaid':
        return <Badge variant="secondary">Unpaid</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Current Period</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24">
                No subscriptions found
              </TableCell>
            </TableRow>
          ) : (
            subscriptions.map((subscription) => (
              <TableRow key={subscription.id}>
                <TableCell>{subscription.clients?.name}</TableCell>
                <TableCell>{subscription.services?.name}</TableCell>
                <TableCell>${subscription.services?.price.toFixed(2)}/month</TableCell>
                <TableCell>{getStatusBadge(subscription.status || 'active')}</TableCell>
                <TableCell>
                  {format(new Date(subscription.current_period_start), 'MMM d')} - {format(new Date(subscription.current_period_end), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  {subscription.status === 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCancel(subscription.id)}
                      className="text-destructive"
                    >
                      <Ban className="mr-2 h-4 w-4" />
                      Cancel
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
