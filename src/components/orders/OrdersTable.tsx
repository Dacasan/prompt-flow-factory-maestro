
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
import { format } from "date-fns";
import { Order } from "@/domains/orders/types";

interface OrdersTableProps {
  orders: {
    id: string;
    status: string;
    client_id: string;
    service_id: string;
    total_amount: number;
    created_at: string;
    estimated_delivery_date?: string | null;
    clients?: { name: string; email: string };
    services?: { name: string; price: number; type: string };
  }[];
  onCancel: (id: string) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({ orders, onCancel }) => {
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "outline";
      case "in_progress":
        return "default";
      case "completed":
        return "secondary"; // Changed from "success" to "secondary"
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not set";
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
            <TableHead>Client</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Estimated Delivery</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center h-24">
                No orders found
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  {order.clients?.name || "Unknown Client"}
                </TableCell>
                <TableCell>
                  {order.services?.name || "Unknown Service"}
                </TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariant(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  ${order.total_amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  {formatDate(order.created_at)}
                </TableCell>
                <TableCell>
                  {formatDate(order.estimated_delivery_date)}
                </TableCell>
                <TableCell className="text-right">
                  {order.status !== "cancelled" && order.status !== "completed" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCancel(order.id)}
                      className="text-destructive hover:text-destructive/90"
                    >
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
