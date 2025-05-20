
import React, { useState } from "react";
import { useOrders, ExtendedOrder } from "@/domains/orders/hooks/useOrders";
import { OrderForm } from "@/components/orders/OrderForm";
import { OrdersTable } from "@/components/orders/OrdersTable";
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

export const Orders = () => {
  const { 
    orders, 
    clients,
    services,
    isLoading, 
    createOrder,
    updateOrderStatus,
    isCreating, 
    isUpdating
  } = useOrders();
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);

  const handleCreateSubmit = (data: any) => {
    createOrder(data, {
      onSuccess: () => {
        setIsSheetOpen(false);
      }
    });
  };

  const handleCancel = (id: string) => {
    setOrderToCancel(id);
  };

  const confirmCancel = () => {
    if (orderToCancel) {
      updateOrderStatus({
        id: orderToCancel,
        status: "cancelled"
      }, {
        onSuccess: () => {
          setOrderToCancel(null);
        }
      });
    }
  };

  const onSheetClose = () => {
    setIsSheetOpen(false);
  };
  
  // Convert ExtendedOrder[] to match OrdersTableProps format
  const formattedOrders = orders.map(order => ({
    id: order.id || '',
    status: order.status || 'pending',
    client_id: order.client_id || '',
    service_id: order.service_id || '',
    total_amount: order.total_amount || 0,
    created_at: order.created_at || '',
    estimated_delivery_date: order.estimated_delivery_date,
    clients: order.clients,
    services: order.services
  }));

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Orders</h1>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Order
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Create Order</SheetTitle>
              <SheetDescription>
                Fill out the order information in the form below.
              </SheetDescription>
            </SheetHeader>
            <div className="py-6">
              <OrderForm
                clients={clients || []}
                services={services || []}
                onOrderCreate={handleCreateSubmit}
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
        <OrdersTable
          orders={formattedOrders}
          onCancel={handleCancel}
        />
      )}

      <AlertDialog open={!!orderToCancel} onOpenChange={(open) => !open && setOrderToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will cancel this order. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} disabled={isUpdating} className="bg-destructive hover:bg-destructive/90">
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Canceling...
                </>
              ) : (
                "Cancel Order"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
