'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Trash2 } from 'lucide-react';
import type { SaleRecord, SaleItem } from '@/types';

interface NewSaleItem extends Omit<SaleItem, 'id' | 'total'> {
  tempId: string; // for client-side list management
}

export default function SalesPage() {
  const [salesRecords, setSalesRecords] = useState<SaleRecord[]>([]);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'online'>('cash');
  const [currentOrderItems, setCurrentOrderItems] = useState<NewSaleItem[]>([]);
  
  // Effect to ensure client-side only state initialization if needed
  useEffect(() => {
    // Load initial sales records from local storage or API if desired
    const initialRecords: SaleRecord[] = [
      { id: 'S001', date: new Date().toLocaleDateString(), items: [{id: 'I001', name: 'Pizza Margherita', quantity: 2, price: 12, total: 24}], totalAmount: 24, paymentMethod: 'card' },
      { id: 'S002', date: new Date().toLocaleDateString(), items: [{id: 'I002', name: 'Coca Cola', quantity: 4, price: 2.5, total: 10}, {id: 'I003', name: 'Fries', quantity: 2, price: 4, total: 8}], totalAmount: 18, paymentMethod: 'cash' },
    ];
    setSalesRecords(initialRecords);
  }, []);


  const handleAddItemToOrder = () => {
    if (!itemName || quantity <= 0 || price <= 0) {
      alert('Please fill item name, quantity, and price correctly.');
      return;
    }
    const newItem: NewSaleItem = {
      tempId: Date.now().toString(), // Simple unique ID for the list
      name: itemName,
      quantity,
      price,
    };
    setCurrentOrderItems([...currentOrderItems, newItem]);
    setItemName('');
    setQuantity(1);
    setPrice(0);
  };

  const handleRemoveItemFromOrder = (tempId: string) => {
    setCurrentOrderItems(currentOrderItems.filter(item => item.tempId !== tempId));
  };

  const handleSubmitSale = (e: FormEvent) => {
    e.preventDefault();
    if (currentOrderItems.length === 0) {
      alert('Please add items to the order.');
      return;
    }

    const newSale: SaleRecord = {
      id: `S${Math.random().toString(36).substr(2, 5)}`, // Generate a simple unique ID
      date: new Date().toLocaleDateString(),
      items: currentOrderItems.map(item => ({...item, id: `I${Math.random().toString(36).substr(2, 5)}`, total: item.quantity * item.price })),
      totalAmount: currentOrderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0),
      paymentMethod,
    };
    setSalesRecords([newSale, ...salesRecords]);
    setCurrentOrderItems([]);
    // Optionally reset payment method or keep it for next sale
  };

  return (
    <>
      <PageHeader title="Sales Tracker" description="Record and manage daily sales.">
        {/* Placeholder for report generation buttons */}
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Record New Sale</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitSale} className="space-y-4">
              <div>
                <Label htmlFor="itemName">Item Name</Label>
                <Input id="itemName" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="e.g., Pizza" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} min="1" />
                </div>
                <div>
                  <Label htmlFor="price">Price (per item) (PKR)</Label>
                  <Input id="price" type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value))} min="0" step="0.01" />
                </div>
              </div>
              <Button type="button" variant="outline" onClick={handleAddItemToOrder} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Item to Order
              </Button>

              {currentOrderItems.length > 0 && (
                <div className="mt-4 space-y-2 border-t pt-4">
                  <h4 className="font-medium">Current Order:</h4>
                  <ul className="space-y-1 text-sm">
                    {currentOrderItems.map(item => (
                      <li key={item.tempId} className="flex justify-between items-center">
                        <span>{item.name} (x{item.quantity}) - PKR {(item.quantity * item.price).toFixed(2)}</span>
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItemFromOrder(item.tempId)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                  <p className="font-semibold">Total: PKR {currentOrderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2)}</p>
                </div>
              )}
              
              <div className="pt-4 border-t">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={(value: 'cash' | 'card' | 'online') => setPaymentMethod(value)}>
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Complete Sale
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales History</CardTitle>
            <CardDescription>Daily, weekly, and monthly sales reports will be available here.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesRecords.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.id}</TableCell>
                    <TableCell>{sale.date}</TableCell>
                    <TableCell>{sale.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</TableCell>
                    <TableCell>{sale.paymentMethod.charAt(0).toUpperCase() + sale.paymentMethod.slice(1)}</TableCell>
                    <TableCell className="text-right">PKR {sale.totalAmount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             {salesRecords.length === 0 && <p className="text-center text-muted-foreground py-4">No sales records yet.</p>}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
