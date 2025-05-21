
'use client';

import type { SaleRecord } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AppLogo } from '@/components/layout/app-logo'; // Assuming you have AppLogo
import { format } from 'date-fns';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleRecord: SaleRecord | null;
}

export default function ReceiptModal({ isOpen, onClose, saleRecord }: ReceiptModalProps) {
  if (!saleRecord) return null;

  const handlePrint = () => {
    // Temporarily hide non-receipt elements for printing
    const elementsToHide = document.querySelectorAll('.hide-on-print');
    elementsToHide.forEach(el => el.classList.add('!hidden'));
    
    // For elements that are specifically for print
    const printOnlyElements = document.querySelectorAll('.print-only');
    printOnlyElements.forEach(el => el.classList.remove('hidden'));


    window.print();

    // Restore visibility after printing
    elementsToHide.forEach(el => el.classList.remove('!hidden'));
    printOnlyElements.forEach(el => el.classList.add('hidden'));
  };
  
  const formattedDateTime = saleRecord.dateTime ? format(new Date(saleRecord.dateTime), "PPP p") : 'N/A';

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
              <span>Cashier:</span>
              <span>{saleRecord.cashierName}</span>
            </div>
            <Separator className="my-3" />
            <h3 className="font-semibold text-md mb-1">Items Purchased:</h3>
            <ScrollArea className="max-h-[200px] pr-3 -mr-3 mb-2">
              {saleRecord.items.map(item => (
                <div key={item.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-2 mb-1 items-center">
                  <span className="truncate col-span-1">{item.name}</span>
                  <span className="text-right text-muted-foreground text-xs whitespace-nowrap">x{item.quantity}</span>
                  <span className="text-right text-muted-foreground text-xs whitespace-nowrap">@ {item.price.toFixed(2)}</span>
                  <span className="text-right font-medium whitespace-nowrap">{(item.quantity * item.price).toFixed(2)}</span>
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

          <p className="text-center text-xs text-muted-foreground mt-6">
            Thank you for your purchase!
          </p>
        </div>
        <DialogFooter className="p-6 pt-0 border-t mt-4 hide-on-print">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <Button onClick={handlePrint}>Print Receipt</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
