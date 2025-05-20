
import React, { useState } from "react";
import { useClients } from "@/domains/clients/hooks/useClients";
import { Client, ClientFormData } from "@/domains/clients/types";
import { ClientForm } from "@/components/clients/ClientForm";
import { ClientsTable } from "@/components/clients/ClientsTable";
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

export const Clients = () => {
  const { 
    clients, 
    isLoading, 
    createClient, 
    updateClient, 
    deleteClient, 
    sendMagicLink,
    isCreating, 
    isUpdating, 
    isDeleting,
    isSendingMagicLink
  } = useClients();
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  const handleCreateSubmit = (data: ClientFormData) => {
    createClient(data, {
      onSuccess: () => {
        setIsSheetOpen(false);
      }
    });
  };

  const handleUpdateSubmit = (data: ClientFormData) => {
    if (currentClient) {
      updateClient({ ...data, id: currentClient.id }, {
        onSuccess: () => {
          setIsSheetOpen(false);
          setCurrentClient(null);
        }
      });
    }
  };

  const handleEdit = (client: Client) => {
    setCurrentClient(client);
    setIsSheetOpen(true);
  };

  const handleDelete = (id: string) => {
    setClientToDelete(id);
  };

  const handleSendMagicLink = (email: string) => {
    sendMagicLink(email);
  };

  const confirmDelete = () => {
    if (clientToDelete) {
      deleteClient(clientToDelete, {
        onSuccess: () => {
          setClientToDelete(null);
        }
      });
    }
  };

  const onSheetClose = () => {
    setIsSheetOpen(false);
    setCurrentClient(null);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Clients</h1>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>{currentClient ? "Edit" : "Create"} Client</SheetTitle>
              <SheetDescription>
                {currentClient
                  ? "Update the client information in the form below."
                  : "Fill out the client information in the form below."}
              </SheetDescription>
            </SheetHeader>
            <div className="py-6">
              <ClientForm
                onSubmit={currentClient ? handleUpdateSubmit : handleCreateSubmit}
                defaultValues={currentClient || {}}
                isSubmitting={currentClient ? isUpdating : isCreating}
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
        <ClientsTable
          clients={clients}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSendMagicLink={handleSendMagicLink}
          isSendingMagicLink={isSendingMagicLink}
        />
      )}

      <AlertDialog open={!!clientToDelete} onOpenChange={(open) => !open && setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this client and all associated data. This action cannot be undone.
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
