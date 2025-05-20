
import React from "react";
import { useSubscriptions } from "@/domains/subscriptions/hooks/useSubscriptions";
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

export const SubscriptionsTable: React.FC = () => {
  const { subscriptions, isLoading, cancelSubscription, isCanceling } = useSubscriptions();

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                  {format(new Date(subscription.current_period_start || new Date()), 'MMM d')} - 
                  {format(new Date(subscription.current_period_end || new Date()), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  {subscription.status === 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelSubscription(subscription.id)}
                      className="text-destructive"
                      disabled={isCanceling}
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
