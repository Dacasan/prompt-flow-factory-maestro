
import React, { useState } from "react";
import { useSubscriptions } from "@/domains/subscriptions/hooks/useSubscriptions";
import { SubscriptionForm } from "@/components/subscriptions/SubscriptionForm";
import { SubscriptionsTable } from "@/components/subscriptions/SubscriptionsTable";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Subscriptions = () => {
  const { 
    subscriptions, 
    clients, 
    services,
    isLoading, 
    createSubscription, 
    cancelSubscription,
    isCreating,
    isCanceling 
  } = useSubscriptions();
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [subscriptionToCancel, setSubscriptionToCancel] = useState<string | null>(null);

  const handleCreateSubmit = (data: {
    client_id: string;
    service_id: string;
    current_period_start: string;
    current_period_end: string;
  }) => {
    createSubscription(data, {
      onSuccess: () => {
        setIsSheetOpen(false);
      }
    });
  };

  const handleCancelSubscription = (id: string) => {
    setSubscriptionToCancel(id);
  };

  const confirmCancel = () => {
    if (subscriptionToCancel) {
      cancelSubscription(subscriptionToCancel, {
        onSuccess: () => {
          setSubscriptionToCancel(null);
        }
      });
    }
  };

  // Filter services to only show recurring ones
  const recurringServices = services.filter(service => service.type === 'recurring');

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Subscriptions</h1>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Subscription
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Create Subscription</SheetTitle>
              <SheetDescription>
                Create a new recurring subscription for a client.
              </SheetDescription>
            </SheetHeader>
            <div className="py-6">
              <SubscriptionForm
                onSubmit={handleCreateSubmit}
                clients={clients}
                services={recurringServices}
                isSubmitting={isCreating}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <SubscriptionsTable
          subscriptions={subscriptions}
          onCancel={handleCancelSubscription}
        />
      )}

      <AlertDialog open={!!subscriptionToCancel} onOpenChange={(open) => !open && setSubscriptionToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the subscription. The client will no longer be charged for this service but will have access until the end of the current billing period.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCanceling}>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} disabled={isCanceling} className="bg-destructive hover:bg-destructive/90">
              {isCanceling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Canceling...
                </>
              ) : (
                "Cancel Subscription"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
