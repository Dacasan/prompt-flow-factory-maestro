
import React, { useState } from "react";
import { useServices } from "@/domains/services/hooks/useServices";
import { useClients } from "@/domains/clients/hooks/useClients";
import { Service } from "@/domains/services/types";
import { ServiceForm } from "@/components/services/ServiceForm";
import { SubscriptionForm } from "@/components/subscriptions/SubscriptionForm";
import { ServicesTable } from "@/components/services/ServicesTable";
import { SubscriptionsTable } from "@/components/subscriptions/SubscriptionsTable";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSubscriptions } from "@/domains/subscriptions/hooks/useSubscriptions";
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

export const Services = () => {
  const { services, isLoading: isServicesLoading, createService, updateService, deleteService, isCreating: isCreatingService, isUpdating: isUpdatingService, isDeleting: isDeleting } = useServices();
  const { subscriptions, isLoading: isSubscriptionsLoading, createSubscription, cancelSubscription, isCreating: isCreatingSubscription, isCanceling } = useSubscriptions();
  const { clients } = useClients();
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<string>("services");
  const [sheetMode, setSheetMode] = useState<"service" | "subscription">("service");
  
  const recurringServices = services.filter(service => service.type === 'recurring');
  
  const handleCreateServiceSubmit = (data: any) => {
    // Ensure required fields are present
    const serviceData = {
      ...data,
      name: data.name || "",
      price: data.price || 0,
      type: data.type || "one_time",
      duration: data.duration || 30, // Setting a default duration
      is_active: true
    };
    
    createService(serviceData, {
      onSuccess: () => {
        setIsSheetOpen(false);
      }
    });
  };

  const handleUpdateSubmit = (data: any) => {
    if (currentService) {
      // Ensure required fields are present
      const serviceData = {
        ...data,
        name: data.name || "",
        price: data.price || 0,
        type: data.type || currentService.type,
        duration: data.duration || 30, // Setting a default duration
        id: currentService.id
      };

      updateService(serviceData, {
        onSuccess: () => {
          setIsSheetOpen(false);
          setCurrentService(null);
        }
      });
    }
  };

  const handleCreateSubscription = (data: {
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

  const handleEdit = (service: Service) => {
    setCurrentService(service);
    setSheetMode("service");
    setIsSheetOpen(true);
  };

  const handleDelete = (id: string) => {
    setServiceToDelete(id);
  };

  const confirmDelete = () => {
    if (serviceToDelete) {
      deleteService(serviceToDelete, {
        onSuccess: () => {
          setServiceToDelete(null);
        }
      });
    }
  };

  const onSheetClose = () => {
    setIsSheetOpen(false);
    setCurrentService(null);
  };

  const openCreateSubscriptionSheet = () => {
    setSheetMode("subscription");
    setIsSheetOpen(true);
  };
  
  const openCreateServiceSheet = () => {
    setSheetMode("service");
    setIsSheetOpen(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Services</h1>
        <div className="flex gap-3">
          <Button onClick={openCreateServiceSheet}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Service
          </Button>
          {recurringServices.length > 0 && (
            <Button variant="outline" onClick={openCreateSubscriptionSheet}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Subscription
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Services</h2>
          {isServicesLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ServicesTable
              services={services}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
        
        {recurringServices.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Active Subscriptions</h2>
            {isSubscriptionsLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <SubscriptionsTable 
                subscriptions={subscriptions} 
                onCancel={cancelSubscription}
                isCanceling={isCanceling}
              />
            )}
          </div>
        )}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            {sheetMode === "service" ? (
              <>
                <SheetTitle>{currentService ? "Edit" : "Create"} Service</SheetTitle>
                <SheetDescription>
                  {currentService
                    ? "Update the service information in the form below."
                    : "Fill out the service information in the form below."}
                </SheetDescription>
              </>
            ) : (
              <>
                <SheetTitle>Create Subscription</SheetTitle>
                <SheetDescription>
                  Create a new recurring subscription for a client.
                </SheetDescription>
              </>
            )}
          </SheetHeader>
          <div className="py-6">
            {sheetMode === "service" ? (
              <ServiceForm
                onSubmit={currentService ? handleUpdateSubmit : handleCreateServiceSubmit}
                defaultValues={currentService || undefined}
                isSubmitting={currentService ? isUpdatingService : isCreatingService}
              />
            ) : (
              <SubscriptionForm
                clients={clients}
                services={recurringServices}
                onSubscriptionCreate={handleCreateSubscription}
                isSubmitting={isCreatingSubscription}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!serviceToDelete} onOpenChange={(open) => !open && setServiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this service and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
