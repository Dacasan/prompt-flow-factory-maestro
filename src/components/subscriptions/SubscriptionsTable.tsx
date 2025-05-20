
import React from "react";
import { ExtendedSubscription } from "@/domains/subscriptions/hooks/useSubscriptions";
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
import { Ban, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface SubscriptionsTableProps {
  subscriptions: ExtendedSubscription[];
  onCancel: (id: string) => void;
  isCanceling?: boolean;
}

export const SubscriptionsTable: React.FC<SubscriptionsTableProps> = ({ 
  subscriptions, 
  onCancel,
  isCanceling = false 
}) => {
  // Helper function to get badge variant based on status
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <Badge variant="outline">Active</Badge>;
      case 'canceled':
        return <Badge variant="destructive">Canceled</Badge>;
      case 'past_due':
        return <Badge variant="secondary">Past Due</Badge>;
      case 'unpaid':
        return <Badge variant="secondary">Unpaid</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (subscriptions.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">No subscriptions found</p>
      </div>
    );
  }

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
          {subscriptions.map((subscription) => (
            <TableRow key={subscription.id}>
              <TableCell>{subscription.clients?.name}</TableCell>
              <TableCell>{subscription.services?.name}</TableCell>
              <TableCell>${subscription.services?.price.toFixed(2)}/month</TableCell>
              <TableCell>{getStatusBadge(subscription.status || 'active')}</TableCell>
              <TableCell>
                {subscription.current_period_start && subscription.current_period_end && (
                  <>
                    {format(new Date(subscription.current_period_start), 'MMM d')} - 
                    {format(new Date(subscription.current_period_end), 'MMM d, yyyy')}
                  </>
                )}
              </TableCell>
              <TableCell className="text-right">
                {subscription.status === 'active' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCancel(subscription.id)}
                    className="text-destructive"
                    disabled={isCanceling}
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
