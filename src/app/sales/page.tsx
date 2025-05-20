// src/app/sales/page.tsx
'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Trash2, UtensilsCrossed } from 'lucide-react';
import type { SaleRecord, SaleItem, MenuItem } from '@/types';
import { useToast } from "@/hooks/use-toast";

interface NewSaleItem extends Omit<SaleItem, 'id' | 'total'> {
  tempId: string; // for client-side list management
}

const MENU_LOCAL_STORAGE_KEY = 'quoriam-menu-items';
const SALES_LOCAL_STORAGE_KEY = 'quoriam-sales-records';


export default function SalesPage() {
  const [salesRecords, setSalesRecords] = useState<SaleRecord[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<string | undefined>(undefined);
  const [itemName, setItemName] = useState(''); // Still used for display in order items, or if no menu item selected
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'online'>('cash');
  const [currentOrderItems, setCurrentOrderItems] = useState<NewSaleItem[]>([]);

  const [showCustomItemForm, setShowCustomItemForm] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    // Load menu items
    const storedMenuItems = localStorage.getItem(MENU_LOCAL_STORAGE_KEY);
    if (storedMenuItems) {
      setMenuItems(JSON.parse(storedMenuItems));
    }

    // Load initial sales records
    const storedSales = localStorage.getItem(SALES_LOCAL_STORAGE_KEY);
    if (storedSales) {
        setSalesRecords(JSON.parse(storedSales));
    } else {
        // Fallback to placeholder if nothing in local storage
        const initialRecords: SaleRecord[] = [
          { id: 'S001', date: new Date().toLocaleDateString(), items: [{id: 'I001', name: 'Pizza Margherita', quantity: 2, price: 1200, total: 2400}], totalAmount: 2400, paymentMethod: 'card' },
          { id: 'S002', date: new Date().toLocaleDateString(), items: [{id: 'I002', name: 'Coca Cola', quantity: 4, price: 150, total: 600}, {id: 'I003', name: 'Fries', quantity: 2, price: 300, total: 600}], totalAmount: 1200, paymentMethod: 'cash' },
        ];
        setSalesRecords(initialRecords);
    }
  }, []);

  // Save sales records to local storage
  useEffect(() => {
    if (salesRecords.length > 0 || localStorage.getItem(SALES_LOCAL_STORAGE_KEY)) {
        localStorage.setItem(SALES_LOCAL_STORAGE_KEY, JSON.stringify(salesRecords));
    }
  }, [salesRecords]);


  const handleMenuItemSelect = (itemId: string) => {
    const selectedItem = menuItems.find(item => item.id === itemId);
    if (selectedItem) {
      setSelectedMenuItemId(itemId);
      setItemName(selectedItem.name); // Set item name for display
      setPrice(selectedItem.price);
    } else {
      setSelectedMenuItemId(undefined);
      setItemName('');
      setPrice(0);
    }
  };

  const handleAddItemToOrder = () => {
    if (!itemName || quantity <= 0 || price <= 0) {
      toast({ title: "Error", description: "Please select an item and ensure quantity/price are valid.", variant: "destructive"});
      return;
    }
    const newItem: NewSaleItem = {
      tempId: Date.now().toString(),
      name: itemName,
      quantity,
      price,
    };
    setCurrentOrderItems([...currentOrderItems, newItem]);
    // Reset fields for next item entry
    setSelectedMenuItemId(undefined); // Important to clear selection
    setItemName('');
    setQuantity(1);
    setPrice(0);
    // Focus the select input after adding an item
    document.getElementById('menuItemSelect')?.focus();
  };

  const handleRemoveItemFromOrder = (tempId: string) => {
    setCurrentOrderItems(currentOrderItems.filter(item => item.tempId !== tempId));
  };

  const handleAddCustomItemToOrderAndMenu = () => {
    if (!customItemName || !customItemPrice || parseFloat(customItemPrice) <= 0) {
      toast({ title: "Error", description: "Custom item name and price are required.", variant: "destructive"});
      return;
    }
    const newMenuItem: MenuItem = {
      id: Date.now().toString(),
      name: customItemName,
      price: parseFloat(customItemPrice),
    };

    // Add to current order
    const newItemForOrder: NewSaleItem = {
      tempId: `custom-${newMenuItem.id}`,
      name: newMenuItem.name,
      quantity: 1, // Default to 1, can be adjusted if needed
      price: newMenuItem.price,
    };
    setCurrentOrderItems(prevOrderItems => [...prevOrderItems, newItemForOrder]);
    
    // Add to menu items state and localStorage
    const updatedMenuItems = [...menuItems, newMenuItem];
    setMenuItems(updatedMenuItems);
    localStorage.setItem(MENU_LOCAL_STORAGE_KEY, JSON.stringify(updatedMenuItems));

    toast({ title: "Success", description: `${newMenuItem.name} added to order and menu.` });

    // Reset custom item form
    setCustomItemName('');
    setCustomItemPrice('');
    setShowCustomItemForm(false);
     // Reset main form fields as well
    setSelectedMenuItemId(undefined);
    setItemName(''); // Clear main item name
    setQuantity(1);
    setPrice(0);
  };


  const handleSubmitSale = (e: FormEvent) => {
    e.preventDefault();
    if (currentOrderItems.length === 0) {
      toast({ title: "Error", description: "Please add items to the order before completing sale.", variant: "destructive"});
      return;
    }

    const newSale: SaleRecord = {
      id: `S${Date.now().toString().slice(-5)}`,
      date: new Date().toLocaleDateString(),
      items: currentOrderItems.map(item => ({ ...item, id: `I${Date.now().toString().slice(-5)}-${Math.random().toString(36).substr(2, 3)}`, total: item.quantity * item.price })),
      totalAmount: currentOrderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0),
      paymentMethod,
    };
    setSalesRecords(prevRecords => [newSale, ...prevRecords]);
    setCurrentOrderItems([]);
    setSelectedMenuItemId(undefined);
    setItemName('');
    setQuantity(1);
    setPrice(0);
    setPaymentMethod('cash'); // Reset payment method
    toast({ title: "Sale Recorded!", description: `Sale ID: ${newSale.id} completed successfully.`});
  };

  const currentOrderTotal = currentOrderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  return (
    <>
      <PageHeader title="Sales Tracker" description="Record and manage daily sales using pre-saved menu items." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Record New Sale</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitSale} className="space-y-4">
              <div>
                <Label htmlFor="menuItemSelect">Select Menu Item</Label>
                <Select value={selectedMenuItemId} onValueChange={handleMenuItemSelect} name="menuItemSelect" >
                  <SelectTrigger id="menuItemSelect">
                    <SelectValue placeholder="Choose an item..." />
                  </SelectTrigger>
                  <SelectContent>
                    {menuItems.length === 0 && <SelectItem value="no-items" disabled>No menu items available. Add items in Menu page.</SelectItem>}
                    {menuItems.map(item => (
                      <SelectItem key={item.id} value={item.id}>{item.name} - PKR {item.price.toFixed(2)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))} min="1" />
                </div>
                <div>
                  <Label htmlFor="price">Price (per item) (PKR)</Label>
                  <Input id="price" type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value))} min="0" step="0.01" />
                </div>
              </div>
              
              <Button type="button" variant="outline" onClick={handleAddItemToOrder} className="w-full" disabled={!selectedMenuItemId && !itemName}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Item to Order
              </Button>

              {!showCustomItemForm && (
                <Button type="button" variant="secondary" onClick={() => setShowCustomItemForm(true)} className="w-full">
                  <UtensilsCrossed className="mr-2 h-4 w-4" /> Add New Custom Item
                </Button>
              )}

              {showCustomItemForm && (
                <div className="space-y-3 border p-3 rounded-md bg-muted/50">
                  <h4 className="font-medium text-sm text-center">Add Custom Item</h4>
                  <div>
                    <Label htmlFor="customItemName" className="text-xs">Custom Item Name</Label>
                    <Input id="customItemName" value={customItemName} onChange={(e) => setCustomItemName(e.target.value)} placeholder="e.g., Special Deal" />
                  </div>
                  <div>
                    <Label htmlFor="customItemPrice" className="text-xs">Custom Item Price (PKR)</Label>
                    <Input id="customItemPrice" type="number" value={customItemPrice} onChange={(e) => setCustomItemPrice(e.target.value)} placeholder="e.g., 500" min="0" step="0.01" />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" onClick={handleAddCustomItemToOrderAndMenu} className="flex-1">Add to Order & Menu</Button>
                    <Button type="button" variant="ghost" onClick={() => setShowCustomItemForm(false)} className="flex-1">Cancel</Button>
                  </div>
                </div>
              )}


              {currentOrderItems.length > 0 && (
                <div className="mt-4 space-y-2 border-t pt-4">
                  <h4 className="font-medium">Current Order Items:</h4>
                  <div className="max-h-40 overflow-y-auto pr-2 space-y-1">
                    {currentOrderItems.map(item => (
                      <div key={item.tempId} className="flex justify-between items-center p-1.5 bg-background rounded text-sm">
                        <span>{item.name} (x{item.quantity})</span>
                        <div className="flex items-center gap-2">
                           <span>PKR {(item.quantity * item.price).toFixed(2)}</span>
                           <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveItemFromOrder(item.tempId)}>
                            <Trash2 className="h-3 w-3 text-destructive" />
                           </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="font-semibold text-right pt-1">Order Total: PKR {currentOrderTotal.toFixed(2)}</p>
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

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={currentOrderItems.length === 0}>
                Complete Sale (Total: PKR {currentOrderTotal.toFixed(2)})
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
