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
import { Download, Eye } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface InvoicesTableProps {
  invoices: Array<{
    id: string;
    number: string;
    status: string;
    issue_date: string;
    due_date: string;
    total_amount: number;
    clients?: { name: string };
    pdf_url?: string;
  }>;
}

export const InvoicesTable: React.FC<InvoicesTableProps> = ({ invoices }) => {
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default";
      case "pending":
        return "outline";
      case "partial":
        return "secondary";
      case "cancelled":
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

  const handleDownload = (invoice: { id: string; number: string; pdf_url?: string }) => {
    // In a real app, this would generate and download a PDF
    // For now, we'll simulate the functionality
    if (invoice.pdf_url) {
      // If we have a PDF URL, we would redirect to it
      window.open(invoice.pdf_url, '_blank');
    } else {
      // Otherwise, we'd generate a PDF on the fly
      toast.success(`Invoice ${invoice.number} is being generated for download`);
      
      // Create a demo PDF download
      setTimeout(() => {
        const dummyContent = `
          Invoice #${invoice.number}
          This is a sample invoice PDF content
          Generated on ${new Date().toLocaleString()}
        `;
        
        const blob = new Blob([dummyContent], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoice.number}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success(`Invoice ${invoice.number} downloaded successfully`);
      }, 1000);
    }
  };

  const handleView = (invoice: { id: string; number: string; pdf_url?: string }) => {
    if (invoice.pdf_url) {
      window.open(invoice.pdf_url, '_blank');
    } else {
      toast.info(`Generating invoice preview for ${invoice.number}`);
      // In a real app, this would show a PDF viewer
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Issue Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center h-24">
                No invoices found
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">
                  {invoice.number}
                </TableCell>
                <TableCell>
                  {invoice.clients?.name || "Unknown Client"}
                </TableCell>
                <TableCell>
                  {formatDate(invoice.issue_date)}
                </TableCell>
                <TableCell>
                  {formatDate(invoice.due_date)}
                </TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariant(invoice.status)}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${invoice.total_amount.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleView(invoice)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDownload(invoice)}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
