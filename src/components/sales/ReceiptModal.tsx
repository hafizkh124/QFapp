
'use client';

import type { SaleRecord } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AppLogo } from '@/components/layout/app-logo';
import { format } from 'date-fns';
import { Share2, Printer } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleRecord: SaleRecord | null;
}

export default function ReceiptModal({ isOpen, onClose, saleRecord }: ReceiptModalProps) {
  const { toast } = useToast();

  if (!saleRecord) return null;

  const handlePrint = () => {
    const elementsToHide = document.querySelectorAll('.hide-on-print');
    elementsToHide.forEach(el => el.classList.add('!hidden'));

    const printOnlyElements = document.querySelectorAll('.print-only');
    printOnlyElements.forEach(el => el.classList.remove('hidden'));

    window.print();

    elementsToHide.forEach(el => el.classList.remove('!hidden'));
    printOnlyElements.forEach(el => el.classList.add('hidden'));
  };

  const formattedDateTime = saleRecord.dateTime ? format(new Date(saleRecord.dateTime), "PPP p") : 'N/A';

  const generateShareableText = (): string => {
    if (!saleRecord) return "No receipt data available.";

    let text = `Quoriam Foods Receipt\n`;
    text += `-------------------------\n`;
    text += `Order ID: ${saleRecord.id}\n`;
    text += `Date & Time: ${formattedDateTime}\n`;
    text += `Order Type: ${saleRecord.orderType}\n`;
    text += `Cashier ID: ${saleRecord.employeeId}\n`; // Displaying Employee ID
    text += `-------------------------\n`;
    text += `Items Purchased:\n`;
    saleRecord.items.forEach(item => {
      text += `- ${item.name} (x${item.quantity}) @ PKR ${item.price.toFixed(2)} = PKR ${(item.quantity * item.price).toFixed(2)}\n`;
    });
    text += `-------------------------\n`;
    text += `Total Amount: PKR ${saleRecord.totalAmount.toFixed(2)}\n`;
    text += `Payment Method: ${saleRecord.paymentMethod.charAt(0).toUpperCase() + saleRecord.paymentMethod.slice(1)}\n`;
    text += `-------------------------\n`;
    text += `Thank you for your purchase!`;
    return text;
  };

  const handleShare = async () => {
    if (!saleRecord) return;

    const shareData = {
      title: `Quoriam Foods Receipt - Order ${saleRecord.id}`,
      text: generateShareableText(),
      // url: window.location.href, // Optional: You can share a URL to view the receipt if you have one
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({ title: "Receipt Shared", description: "The receipt details have been shared." });
      } catch (error) {
        console.error('Error sharing:', error);
        // Check if it's an AbortError (user cancelled the share dialog)
        if (error instanceof DOMException && error.name === 'AbortError') {
            toast({
                variant: "default", // Or "info" if you create one
                title: "Share Cancelled",
                description: "You cancelled the share operation.",
            });
        } else {
            toast({
              variant: "destructive",
              title: "Share Failed",
              description: "Could not share the receipt at this time.",
            });
        }
      }
    } else {
      console.log("Shareable Receipt Text:\n", shareData.text);
      toast({
        title: "Share Not Available",
        description: "Web Share API is not supported on this browser. Receipt details logged to console.",
      });
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0" aria-describedby="receipt-modal-description">
        <div id="receipt-content" className="p-6">
          <DialogHeader className="mb-4 text-center">
            <div className="flex justify-center mb-2">
                <AppLogo className="w-12 h-12 text-primary" />
            </div>
            <DialogTitle className="text-2xl">Quoriam Foods</DialogTitle>
            <p className="text-sm text-muted-foreground">Your Trusted Taste</p>
          </DialogHeader>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Order ID:</span>
              <span className="font-mono">{saleRecord.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Date & Time:</span>
              <span>{formattedDateTime}</span>
            </div>
            <div className="flex justify-between">
              <span>Order Type:</span>
              <span>{saleRecord.orderType}</span>
            </div>
             <div className="flex justify-between">
              <span>Cashier ID:</span>
              <span>{saleRecord.employeeId}</span>
            </div>
            <Separator className="my-3" />
            <h3 className="font-semibold text-md mb-1 items-purchased-header">Items Purchased:</h3>
            <ScrollArea className="max-h-[200px] pr-3 -mr-3 mb-2">
              {saleRecord.items.map(item => (
                <div key={item.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-2 mb-1 items-center item-row">
                  <span className="truncate col-span-1 item-name">{item.name}</span>
                  <span className="text-right text-muted-foreground text-xs whitespace-nowrap item-qty">x{item.quantity}</span>
                  <span className="text-right text-muted-foreground text-xs whitespace-nowrap item-price">@ PKR {item.price.toFixed(2)}</span>
                  <span className="text-right font-medium whitespace-nowrap item-total">PKR {(item.quantity * item.price).toFixed(2)}</span>
                </div>
              ))}
            </ScrollArea>
            <Separator className="my-3" />
            <div className="flex justify-between font-semibold text-md">
              <span>Total Amount:</span>
              <span>PKR {saleRecord.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Payment Method:</span>
              <span>{saleRecord.paymentMethod.charAt(0).toUpperCase() + saleRecord.paymentMethod.slice(1)}</span>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6 thank-you-message">
            Thank you for your purchase!
          </p>
        </div>
        <DialogFooter className="p-6 pt-0 border-t mt-4 hide-on-print flex-wrap sm:flex-nowrap justify-center sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
          <Button variant="outline" onClick={handleShare} className="w-full sm:w-auto">
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
          <Button onClick={handlePrint} className="w-full sm:w-auto">
            <Printer className="mr-2 h-4 w-4" /> Print Receipt
          </Button>
           <DialogClose asChild>
            <Button variant="outline" className="w-full sm:w-auto">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
