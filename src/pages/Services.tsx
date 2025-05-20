
import React, { useState } from "react";
import { useServices } from "@/domains/services/hooks/useServices";
import { Service } from "@/domains/services/types";
import { ServiceForm } from "@/components/services/ServiceForm";
import { ServicesTable } from "@/components/services/ServicesTable";
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
  const { services, isLoading, createService, updateService, deleteService, isCreating, isUpdating, isDeleting } = useServices();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  const handleCreateSubmit = (data: Omit<Service, 'id' | 'created_at' | 'updated_at'>) => {
    createService(data, {
      onSuccess: () => {
        setIsSheetOpen(false);
      }
    });
  };

  const handleUpdateSubmit = (data: Omit<Service, 'id' | 'created_at' | 'updated_at'>) => {
    if (currentService) {
      updateService({ ...data, id: currentService.id }, {
        onSuccess: () => {
          setIsSheetOpen(false);
          setCurrentService(null);
        }
      });
    }
  };

  const handleEdit = (service: Service) => {
    setCurrentService(service);
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Services</h1>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>{currentService ? "Edit" : "Create"} Service</SheetTitle>
              <SheetDescription>
                {currentService
                  ? "Update the service information in the form below."
                  : "Fill out the service information in the form below."}
              </SheetDescription>
            </SheetHeader>
            <div className="py-6">
              <ServiceForm
                onSubmit={currentService ? handleUpdateSubmit : handleCreateSubmit}
                defaultValues={currentService || undefined}
                isSubmitting={currentService ? isUpdating : isCreating}
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
        <ServicesTable
          services={services}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

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
