
// src/app/sales/page.tsx
'use client';

import { useState, type FormEvent, useEffect, ChangeEvent } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Trash2, UtensilsCrossed } from 'lucide-react';
import type { SaleRecord, SaleItem, MenuItem } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SalesReports from '@/components/sales/SalesReports'; // New component for reports
import { format } from 'date-fns';

interface NewSaleItem extends Omit<SaleItem, 'id' | 'total'> {
  tempId: string; // for client-side list management
}

interface MenuSelectionItem extends MenuItem {
  selected: boolean;
  quantity: number;
}

const MENU_LOCAL_STORAGE_KEY = 'quoriam-menu-items';
const SALES_LOCAL_STORAGE_KEY = 'quoriam-sales-records';


export default function SalesPage() {
  const [salesRecords, setSalesRecords] = useState<SaleRecord[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuSelection, setMenuSelection] = useState<MenuSelectionItem[]>([]);
  
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'online' | 'credit'>('cash');
  const [currentOrderItems, setCurrentOrderItems] = useState<NewSaleItem[]>([]);

  const [showCustomItemForm, setShowCustomItemForm] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    // Load menu items
    const storedMenuItems = localStorage.getItem(MENU_LOCAL_STORAGE_KEY);
    let loadedMenuItems: MenuItem[] = [];
    if (storedMenuItems) {
      try {
        loadedMenuItems = JSON.parse(storedMenuItems);
        setMenuItems(loadedMenuItems);
      } catch (error) {
        console.error("Error parsing menu items from localStorage:", error);
        localStorage.removeItem(MENU_LOCAL_STORAGE_KEY);
      }
    }
    // Initialize menuSelection based on loadedMenuItems
    setMenuSelection(
      loadedMenuItems.map(item => ({ ...item, selected: false, quantity: 1 }))
    );

    // Load initial sales records
    const storedSales = localStorage.getItem(SALES_LOCAL_STORAGE_KEY);
    if (storedSales) {
      try {
        setSalesRecords(JSON.parse(storedSales));
      } catch (error) {
        console.error("Error parsing sales records from localStorage:", error);
        localStorage.removeItem(SALES_LOCAL_STORAGE_KEY);
      }
    } else {
        // Fallback to placeholder if nothing in local storage, with standardized date format
        const initialRecords: SaleRecord[] = [
          { id: 'S001', date: format(new Date(), 'yyyy-MM-dd'), items: [{id: 'I001', name: 'Pizza Margherita', quantity: 2, price: 1200, total: 2400}], totalAmount: 2400, paymentMethod: 'card' },
          { id: 'S002', date: format(new Date(Date.now() - 86400000 * 1 ), 'yyyy-MM-dd'), items: [{id: 'I002', name: 'Coca Cola', quantity: 4, price: 150, total: 600}, {id: 'I003', name: 'Fries', quantity: 2, price: 300, total: 600}], totalAmount: 1200, paymentMethod: 'cash' },
        ];
        setSalesRecords(initialRecords);
    }
  }, []);

  // Update menuSelection when menuItems change (e.g., after adding a custom item)
  useEffect(() => {
    setMenuSelection(
      menuItems.map(item => {
        const existingSelection = menuSelection.find(ms => ms.id === item.id);
        return { 
          ...item, 
          selected: existingSelection?.selected || false, 
          quantity: existingSelection?.quantity || 1 
        };
      })
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuItems]); 

  // Save sales records to local storage
  useEffect(() => {
    if (salesRecords.length > 0 || localStorage.getItem(SALES_LOCAL_STORAGE_KEY)) {
        localStorage.setItem(SALES_LOCAL_STORAGE_KEY, JSON.stringify(salesRecords));
    }
  }, [salesRecords]);

  const handleMenuSelectionChange = (itemId: string, checked: boolean) => {
    setMenuSelection(prevSelection =>
      prevSelection.map(item =>
        item.id === itemId 
          ? { ...item, selected: checked, quantity: checked ? (item.quantity > 0 ? item.quantity : 1) : 1 } 
          : item
      )
    );
  };

  const handleMenuSelectionQuantityChange = (itemId: string, quantity: number) => {
    setMenuSelection(prevSelection =>
      prevSelection.map(item =>
        item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item // Ensure quantity is at least 1 if selected
      )
    );
  };

  const handleAddSelectedItemsToOrder = () => {
    const itemsToAdd = menuSelection.filter(item => item.selected && item.quantity > 0);
    if (itemsToAdd.length === 0) {
      toast({ title: "No items selected", description: "Please select items and specify quantities.", variant: "destructive"});
      return;
    }

    const newOrderItems: NewSaleItem[] = itemsToAdd.map(item => ({
      tempId: `${Date.now().toString()}-${item.id}`,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));

    setCurrentOrderItems(prevOrderItems => [...prevOrderItems, ...newOrderItems]);

    // Reset selection state
    setMenuSelection(prevSelection =>
      prevSelection.map(item => ({ ...item, selected: false, quantity: 1 }))
    );
    toast({ title: "Items Added", description: `${itemsToAdd.length} item(s) added to the current order.` });
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
      quantity: 1, 
      price: newMenuItem.price,
    };
    setCurrentOrderItems(prevOrderItems => [...prevOrderItems, newItemForOrder]);
    
    // Add to menu items state and localStorage
    const updatedMenuItems = [...menuItems, newMenuItem];
    setMenuItems(updatedMenuItems); // This will trigger the useEffect to update menuSelection
    localStorage.setItem(MENU_LOCAL_STORAGE_KEY, JSON.stringify(updatedMenuItems));

    toast({ title: "Success", description: `${newMenuItem.name} added to order and menu.` });

    // Reset custom item form
    setCustomItemName('');
    setCustomItemPrice('');
    setShowCustomItemForm(false);
  };


  const handleSubmitSale = (e: FormEvent) => {
    e.preventDefault();
    if (currentOrderItems.length === 0) {
      toast({ title: "Error", description: "Please add items to the order before completing sale.", variant: "destructive"});
      return;
    }

    const newSale: SaleRecord = {
      id: `S${Date.now().toString().slice(-5)}`,
      date: format(new Date(), 'yyyy-MM-dd'), // Standardized date format
      items: currentOrderItems.map(item => ({ ...item, id: `I${Date.now().toString().slice(-5)}-${Math.random().toString(36).substr(2, 3)}`, total: item.quantity * item.price })),
      totalAmount: currentOrderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0),
      paymentMethod,
    };
    setSalesRecords(prevRecords => [newSale, ...prevRecords]);
    setCurrentOrderItems([]);
    setPaymentMethod('cash'); // Reset payment method
    toast({ title: "Sale Recorded!", description: `Sale ID: ${newSale.id} completed successfully.`});
  };

  const currentOrderTotal = currentOrderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  return (
    <>
      <PageHeader title="Sales Management" description="Record sales and view sales reports." />
      
      <Tabs defaultValue="recordSale" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="recordSale">Record Sale</TabsTrigger>
          <TabsTrigger value="salesReports">Sales Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="recordSale">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Record New Sale</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitSale} className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Select Menu Items</Label>
                    <ScrollArea className="h-[300px] w-full rounded-md border p-3"> {/* Adjusted height */}
                      {menuSelection.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No menu items available. Add items in Menu page.</p>}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3"> {/* Adjusted grid for potentially narrower card */}
                        {menuSelection.map(item => (
                          <div key={item.id} className="border rounded-md p-3 flex flex-col space-y-2 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex-1 pr-2">
                                <Label htmlFor={`item-select-${item.id}`} className="text-sm font-medium leading-tight cursor-pointer block">
                                  {item.name}
                                </Label>
                                <p className="text-xs text-muted-foreground">PKR {item.price.toFixed(2)}</p>
                              </div>
                              <Checkbox
                                id={`item-select-${item.id}`}
                                checked={item.selected}
                                onCheckedChange={(checked) => handleMenuSelectionChange(item.id, !!checked)}
                                aria-label={`Select ${item.name}`}
                                className="mt-1 flex-shrink-0"
                              />
                            </div>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e: ChangeEvent<HTMLInputElement>) => handleMenuSelectionQuantityChange(item.id, parseInt(e.target.value) || 1)}
                              className="w-full h-8 text-sm"
                              min="1"
                              disabled={!item.selected}
                              aria-label={`Quantity for ${item.name}`}
                              placeholder="Qty"
                            />
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                  
                  <Button type="button" variant="outline" onClick={handleAddSelectedItemsToOrder} className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Selected Items to Order
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
                      <ScrollArea className="max-h-32 pr-2"> {/* Adjusted height */}
                        <div className="space-y-1">
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
                      </ScrollArea>
                      <p className="font-semibold text-right pt-1">Order Total: PKR {currentOrderTotal.toFixed(2)}</p>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={(value: 'cash' | 'card' | 'online' | 'credit') => setPaymentMethod(value)}>
                      <SelectTrigger id="paymentMethod">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="credit">Credit</SelectItem>
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
                <CardDescription>Most recent sales. Detailed reports available in "Sales Reports" tab.</CardDescription>
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
                    {salesRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                          No sales records yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      salesRecords.slice(0, 10).map((sale) => ( // Show only recent sales here
                        <TableRow key={sale.id}>
                          <TableCell className="font-medium">{sale.id}</TableCell>
                          <TableCell>{sale.date}</TableCell>
                          <TableCell>{sale.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</TableCell>
                          <TableCell>{sale.paymentMethod.charAt(0).toUpperCase() + sale.paymentMethod.slice(1)}</TableCell>
                          <TableCell className="text-right">PKR {sale.totalAmount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="salesReports">
           <SalesReports allSalesData={salesRecords} menuItems={menuItems} />
        </TabsContent>
      </Tabs>
    </>
  );
}

    