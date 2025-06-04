
// src/app/sales/page.tsx
'use client';

import React, { useState, type FormEvent, useEffect, ChangeEvent, useMemo } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Trash2, UtensilsCrossed, Eye, UserCircle, ShieldAlert, ShoppingBag, Car, Utensils, Pencil, CalendarIcon } from 'lucide-react';
import type { SaleRecord, SaleItem, MenuItem, ManagedEmployee, OrderType } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SalesReports from '@/components/sales/SalesReports';
import ReceiptModal from '@/components/sales/ReceiptModal';
import { format, differenceInMilliseconds, parseISO, setHours, setMinutes, setSeconds, setMilliseconds, startOfDay } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface NewSaleItem extends Omit<SaleItem, 'id' | 'total'> {
  tempId: string; // for client-side list management, typically menuItem.id
}

interface MenuSelectionItem extends MenuItem {
  selected: boolean;
  quantity: number;
}

const MENU_ITEMS_LOCAL_STORAGE_KEY = 'quoriam-menu-items';
const MENU_CATEGORIES_LOCAL_STORAGE_KEY = 'quoriam-menu-categories';
const SALES_RECORDS_LOCAL_STORAGE_KEY = 'quoriam-sales-records';
const MANAGED_EMPLOYEES_KEY = 'quoriam-managed-employees-v2';

const NO_CATEGORY_VALUE = "__no_category__";

const defaultFallbackCategories = ["Chicken Items", "Beef Items", "Extras", "Beverages"];

const defaultSalesCashiersFallback: ManagedEmployee[] = [
    { employeeId: 'QE101', employeeName: 'Umar Hayat', role: 'admin', email: 'hafizkh124@gmail.com', password: '1quoriam1', status: 'active', phone: '03001234567' },
    { employeeId: 'QE102', employeeName: 'Abdullah Khubaib', role: 'manager', email: 'khubaib@quoriam.com', password: 'khubaib123', status: 'active', phone: '03011234567' },
    { employeeId: 'QE103', employeeName: 'Shoaib Ashfaq', role: 'employee', email: 'shoaib@quoriam.com', password: 'shoaib123', status: 'active', phone: '03021234567' },
    { employeeId: 'QE104', employeeName: 'Salman Karamat', role: 'employee', email: 'salman@quoriam.com', password: 'salman123', status: 'active', phone: '03031234567' },
    { employeeId: 'QE105', employeeName: 'Suraqa Zohaib', role: 'employee', email: 'suraqa@quoriam.com', password: 'suraqa123', status: 'active', phone: '03041234567' },
    { employeeId: 'QE106', employeeName: 'Bilal Karamat', role: 'employee', email: 'bilal@quoriam.com', password: 'bilal123', status: 'active', phone: '03051234567' },
    { employeeId: 'QE107', employeeName: 'Kaleemullah Qarafi', role: 'employee', email: 'kaleem@quoriam.com', password: 'kaleem123', status: 'active', phone: '03061234567' },
    { employeeId: 'QE108', employeeName: 'Arslan Mushtaq', role: 'employee', email: 'arslan@quoriam.com', password: 'arslan123', status: 'active', phone: '03071234567' },
];

const orderTypeOptions: { value: OrderType; label: string; icon?: React.ElementType }[] = [
  { value: 'Dine-in', label: 'Dine-in (ریسٹورنٹ میں بیٹھ کر)', icon: Utensils },
  { value: 'Takeaway', label: 'Takeaway / Parcel (پارسل)', icon: ShoppingBag },
  { value: 'Delivery', label: 'Delivery (ڈلیوری)', icon: Car },
];

const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;

export default function SalesPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [salesRecords, setSalesRecords] = useState<SaleRecord[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [menuSelection, setMenuSelection] = useState<MenuSelectionItem[]>([]);

  const [saleDate, setSaleDate] = useState<Date | undefined>(new Date());
  const [orderType, setOrderType] = useState<OrderType>('Dine-in');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'online' | 'credit'>('cash');
  const [currentOrderItems, setCurrentOrderItems] = useState<NewSaleItem[]>([]);

  const [cashierList, setCashierList] = useState<ManagedEmployee[]>([]);
  const [selectedCashierId, setSelectedCashierId] = useState<string | undefined>(undefined);

  const [showCustomItemForm, setShowCustomItemForm] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');
  const [customItemCategory, setCustomItemCategory] = useState<string | undefined>(undefined);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<SaleRecord | null>(null);

  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [editOrderOriginalDateTime, setEditOrderOriginalDateTime] = useState<string | null>(null);

  useEffect(() => {
    let loadedCashiers: ManagedEmployee[] = [];
    try {
      const storedManagedEmployees = localStorage.getItem(MANAGED_EMPLOYEES_KEY);
      if (storedManagedEmployees) {
        const parsedEmployees: ManagedEmployee[] = JSON.parse(storedManagedEmployees);
         if (Array.isArray(parsedEmployees) && parsedEmployees.length > 0) {
          loadedCashiers = parsedEmployees.filter(emp => emp.status === 'active');
        }
      }
    } catch (error) {
      console.error("Error loading managed employees from localStorage:", error);
    }
    if(loadedCashiers.length === 0) {
        loadedCashiers = defaultSalesCashiersFallback.filter(emp => emp.status === 'active');
    }
    setCashierList(loadedCashiers);

    const storedCategories = localStorage.getItem(MENU_CATEGORIES_LOCAL_STORAGE_KEY);
    if (storedCategories) {
      try {
        const parsedCategories = JSON.parse(storedCategories);
        if (Array.isArray(parsedCategories) && parsedCategories.length > 0) {
          setAllCategories(parsedCategories);
        } else {
          setAllCategories(defaultFallbackCategories);
        }
      } catch (e) {
        console.error("Error loading categories from localStorage, using defaults.", e);
        setAllCategories(defaultFallbackCategories);
      }
    } else {
      setAllCategories(defaultFallbackCategories);
    }

    const storedMenuItems = localStorage.getItem(MENU_ITEMS_LOCAL_STORAGE_KEY);
    let loadedMenuItems: MenuItem[] = [];
    if (storedMenuItems) {
      try {
        const parsedItems = JSON.parse(storedMenuItems);
        if (Array.isArray(parsedItems)) {
          loadedMenuItems = parsedItems;
          setMenuItems(loadedMenuItems);
        }
      } catch (error) {
        console.error("Error parsing menu items from localStorage:", error);
      }
    }
    setMenuSelection(
      loadedMenuItems.map(item => ({
        ...item,
        selected: false,
        quantity: 1,
      }))
    );

    const storedSales = localStorage.getItem(SALES_RECORDS_LOCAL_STORAGE_KEY);
    if (storedSales) {
      try {
        const parsedSales = JSON.parse(storedSales);
        if (Array.isArray(parsedSales)) {
          setSalesRecords(parsedSales.sort((a,b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()));
        }
      } catch (error) {
        console.error("Error parsing sales records from localStorage:", error);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


 useEffect(() => {
    if (user) {
        if (user.role === 'employee' && user.employeeId) {
            setSelectedCashierId(user.employeeId);
        } else if ((user.role === 'admin' || user.role === 'manager') && cashierList.length > 0 && !selectedCashierId) {
            const selfInList = cashierList.find(c => c.employeeId === user.employeeId);
            setSelectedCashierId(selfInList ? selfInList.employeeId : cashierList[0]?.employeeId);
        }
    }
  }, [user, cashierList, selectedCashierId]);


  useEffect(() => {
    setMenuSelection(
      menuItems.map(item => {
        const existingSelection = menuSelection.find(ms => ms.id === item.id);
        // Check if item is in currentOrderItems to maintain selection state if form resets
        const isInCurrentOrder = currentOrderItems.some(orderItem => orderItem.tempId === item.id);
        return {
          ...item,
          selected: existingSelection?.selected || isInCurrentOrder || false,
          quantity: existingSelection?.quantity || (isInCurrentOrder ? currentOrderItems.find(orderItem => orderItem.tempId === item.id)!.quantity : 1)
        };
      })
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuItems]); // Only re-run if menuItems itself changes. currentOrderItems dependency might cause loops if not handled carefully elsewhere.

  useEffect(() => {
    if (salesRecords.length > 0 || localStorage.getItem(SALES_RECORDS_LOCAL_STORAGE_KEY)) {
        localStorage.setItem(SALES_RECORDS_LOCAL_STORAGE_KEY, JSON.stringify(salesRecords));
    }
  }, [salesRecords]);

  const handleMenuSelectionChange = (itemId: string, checked: boolean) => {
    const selectedMenuItem = menuItems.find(mi => mi.id === itemId);
    if (!selectedMenuItem) return;

    setMenuSelection(prevSelection =>
      prevSelection.map(item =>
        item.id === itemId
          ? { ...item, selected: checked, quantity: checked ? (item.quantity > 0 ? item.quantity : 1) : 1 }
          : item
      )
    );

    if (checked) {
      const currentMenuItemState = menuSelection.find(item => item.id === itemId) || { ...selectedMenuItem, quantity: 1 };
      const newItemForOrder: NewSaleItem = {
        tempId: selectedMenuItem.id, // Use menu item's actual ID
        name: selectedMenuItem.name,
        quantity: currentMenuItemState.quantity,
        price: selectedMenuItem.price,
        category: selectedMenuItem.category,
      };
      setCurrentOrderItems(prevOrderItems => {
        // Avoid duplicates if somehow already added
        if (prevOrderItems.some(item => item.tempId === selectedMenuItem.id)) {
          return prevOrderItems.map(item => item.tempId === selectedMenuItem.id ? { ...item, quantity: currentMenuItemState.quantity } : item);
        }
        return [...prevOrderItems, newItemForOrder];
      });
    } else {
      setCurrentOrderItems(prevOrderItems => prevOrderItems.filter(item => item.tempId !== itemId));
    }
  };

  const handleMenuSelectionQuantityChange = (itemId: string, quantity: number) => {
    const newQuantity = Math.max(1, quantity);
    setMenuSelection(prevSelection =>
      prevSelection.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
    // If the item is already selected (i.e., in currentOrderItems), update its quantity there too
    setCurrentOrderItems(prevOrderItems =>
        prevOrderItems.map(item =>
            item.tempId === itemId ? { ...item, quantity: newQuantity } : item
        )
    );
  };


  const handleRemoveItemFromOrder = (tempId: string) => {
    setCurrentOrderItems(currentOrderItems.filter(item => item.tempId !== tempId));
    // Also uncheck it in menuSelection
    setMenuSelection(prevSelection =>
      prevSelection.map(item =>
        item.id === tempId ? { ...item, selected: false, quantity: 1 } : item
      )
    );
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
      category: customItemCategory === NO_CATEGORY_VALUE ? undefined : customItemCategory,
    };

    const newItemForOrder: NewSaleItem = {
      tempId: newMenuItem.id, // Use the new menu item's ID
      name: newMenuItem.name,
      quantity: 1,
      price: newMenuItem.price,
      category: newMenuItem.category,
    };
    setCurrentOrderItems(prevOrderItems => [...prevOrderItems, newItemForOrder]);

    const updatedMenuItems = [...menuItems, newMenuItem];
    setMenuItems(updatedMenuItems);
    localStorage.setItem(MENU_ITEMS_LOCAL_STORAGE_KEY, JSON.stringify(updatedMenuItems));

    // Automatically select the new custom item in the menuSelection
    setMenuSelection(prevSelection => [
        ...prevSelection,
        { ...newMenuItem, selected: true, quantity: 1}
    ]);


    toast({ title: "Success", description: `${newMenuItem.name} added to order and menu.` });

    setCustomItemName('');
    setCustomItemPrice('');
    setCustomItemCategory(undefined);
    setShowCustomItemForm(false);
  };

  const isSaleEditable = (saleDateTime: string): boolean => {
    if (!saleDateTime) return false;
    const saleTime = parseISO(saleDateTime).getTime();
    const currentTime = new Date().getTime();
    return (currentTime - saleTime) < FIVE_MINUTES_IN_MS;
  };

  const resetSaleForm = () => {
    setCurrentOrderItems([]);
    setOrderType('Dine-in');
    setPaymentMethod('cash');
    setSaleDate(new Date());
    setMenuSelection(prev => prev.map(item => ({ ...item, selected: false, quantity: 1 })));
    if (user && user.role === 'employee' && user.employeeId) {
        setSelectedCashierId(user.employeeId);
    } else if (user && (user.role === 'admin' || user.role === 'manager') && cashierList.length > 0) {
        const selfInList = cashierList.find(c => c.employeeId === user.employeeId);
        setSelectedCashierId(selfInList ? selfInList.employeeId : cashierList[0]?.employeeId);
    } else {
        setSelectedCashierId(undefined);
    }
  };

  const handleStartEditSale = (saleToEdit: SaleRecord) => {
    if (!isSaleEditable(saleToEdit.dateTime)) {
        toast({ title: "Edit Window Expired", description: "This order can no longer be edited.", variant: "destructive" });
        return;
    }
    setEditingSaleId(saleToEdit.id);
    const originalDate = parseISO(saleToEdit.dateTime);
    setEditOrderOriginalDateTime(saleToEdit.dateTime);
    setSaleDate(originalDate); // Set the date picker to the sale's original date

    setCurrentOrderItems(saleToEdit.items.map(item => ({
        tempId: item.id, // Use original item ID if available, or map to menu item ID
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        category: item.category
     })));
    setOrderType(saleToEdit.orderType);
    setPaymentMethod(saleToEdit.paymentMethod);
    setSelectedCashierId(saleToEdit.employeeId);

    setMenuSelection(prevMenuSelection => {
        return prevMenuSelection.map(menuItem => {
            const itemInSale = saleToEdit.items.find(saleItem => saleItem.name === menuItem.name && saleItem.price === menuItem.price);
            return {
                ...menuItem,
                selected: !!itemInSale,
                quantity: itemInSale ? itemInSale.quantity : 1
            };
        });
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingSaleId(null);
    setEditOrderOriginalDateTime(null);
    resetSaleForm();
  };


  const handleSubmitSale = (e: FormEvent) => {
    e.preventDefault();
    if (currentOrderItems.length === 0) {
      toast({ title: "Error", description: "Please add items to the order.", variant: "destructive"});
      return;
    }
    if (!orderType) {
        toast({ title: "Error", description: "Please select an Order Type.", variant: "destructive"});
        return;
    }
    if (!saleDate) {
      toast({ title: "Error", description: "Please select a Sale Date.", variant: "destructive"});
      return;
    }


    let currentCashierInfo: { employeeId: string; employeeName: string; } | undefined;

    if (user?.role === 'employee' && user.employeeId && user.employeeName) {
        currentCashierInfo = { employeeId: user.employeeId, employeeName: user.employeeName };
    } else if ((user?.role === 'admin' || user?.role === 'manager') && selectedCashierId) {
        const foundCashier = cashierList.find(c => c.employeeId === selectedCashierId);
        if (foundCashier) {
            currentCashierInfo = { employeeId: foundCashier.employeeId, employeeName: foundCashier.employeeName };
        }
    }

    if (!currentCashierInfo) {
      toast({ title: "Error", description: "Cashier information is missing.", variant: "destructive"});
      return;
    }

    const now = new Date(); // For current time component
    const finalSaleDateTime = setMilliseconds(setSeconds(setMinutes(setHours(saleDate, now.getHours()), now.getMinutes()), now.getSeconds()), now.getMilliseconds());


    const saleItems: SaleItem[] = currentOrderItems.map((item, index) => ({
        id: editingSaleId && item.id ? item.id : `I${Date.now().toString().slice(-5)}-${index}`,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price,
        category: item.category
    }));
    const totalAmount = saleItems.reduce((sum, item) => sum + item.total, 0);

    if (editingSaleId) {
        if (!editOrderOriginalDateTime || !isSaleEditable(editOrderOriginalDateTime)) {
            toast({ title: "Edit Window Expired", description: "This order can no longer be edited. Changes were not saved.", variant: "destructive" });
            handleCancelEdit();
            return;
        }

        const updatedSale: SaleRecord = {
            id: editingSaleId,
            date: format(finalSaleDateTime, 'yyyy-MM-dd'),
            dateTime: finalSaleDateTime.toISOString(),
            items: saleItems,
            totalAmount: totalAmount,
            paymentMethod,
            orderType,
            employeeName: currentCashierInfo.employeeName,
            employeeId: currentCashierInfo.employeeId,
        };

        const updatedSalesRecords = salesRecords.map(sale => sale.id === editingSaleId ? updatedSale : sale)
            .sort((a,b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
        setSalesRecords(updatedSalesRecords);
        setCurrentReceipt(updatedSale);
        setIsReceiptModalOpen(true);
        toast({ title: "Sale Updated!", description: `Sale ID: ${updatedSale.id} updated successfully.`});
        handleCancelEdit();

    } else {
        const newSale: SaleRecord = {
          id: `S${Date.now().toString().slice(-5)}-${Math.random().toString(36).substr(2,4)}`,
          date: format(finalSaleDateTime, 'yyyy-MM-dd'),
          dateTime: finalSaleDateTime.toISOString(),
          items: saleItems,
          totalAmount: totalAmount,
          paymentMethod,
          orderType,
          employeeName: currentCashierInfo.employeeName,
          employeeId: currentCashierInfo.employeeId,
        };
        const updatedSalesRecords = [newSale, ...salesRecords].sort((a,b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
        setSalesRecords(updatedSalesRecords);
        setCurrentReceipt(newSale);
        setIsReceiptModalOpen(true);
        resetSaleForm();
        toast({ title: "Sale Recorded!", description: `Sale ID: ${newSale.id} completed successfully.`});
    }
  };

  const handleViewReceipt = (saleId: string) => {
    const saleToView = salesRecords.find(sale => sale.id === saleId);
    if (saleToView) {
      setCurrentReceipt(saleToView);
      setIsReceiptModalOpen(true);
    }
  };

  const currentOrderTotal = currentOrderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  const salesDataForReport = useMemo(() => {
    if (user?.role === 'employee') {
      return salesRecords.filter(sale => sale.employeeId === user.employeeId);
    }
    return salesRecords;
  }, [salesRecords, user]);


  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>You need to be logged in to view sales information.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const canManageCashierSelection = user.role === 'admin' || user.role === 'manager';
  const canAddCustomItem = user.role === 'admin' || user.role === 'manager' || user.role === 'employee';


  return (
    <>
      <PageHeader title="Sales Management" description="Record sales, view reports, and manage receipts." />

      <Tabs defaultValue="recordSale" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="recordSale"> {editingSaleId ? `Edit Sale (ID: ${editingSaleId})` : 'Record Sale'} </TabsTrigger>
          <TabsTrigger value="salesReports">Sales Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="recordSale">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>{editingSaleId ? `Editing Sale: ${editingSaleId}` : 'Record New Sale'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitSale} className="space-y-4">
                  <div>
                      <Label htmlFor="saleDate">Sale Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !saleDate && "text-muted-foreground"
                            )}
                            disabled={!!editingSaleId && !isSaleEditable(editOrderOriginalDateTime || "")}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {saleDate ? format(saleDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={saleDate}
                            onSelect={setSaleDate}
                            initialFocus
                            disabled={!!editingSaleId && !isSaleEditable(editOrderOriginalDateTime || "")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                  {canManageCashierSelection && user?.role !== 'employee' ? (
                    <div>
                      <Label htmlFor="cashierSelect" className="mb-1 block">Select Cashier</Label>
                      <Select
                        value={selectedCashierId || ""}
                        onValueChange={(employeeId) => setSelectedCashierId(employeeId)}
                        disabled={!!editingSaleId && user.role !== 'admin'}
                      >
                        <SelectTrigger id="cashierSelect" className="w-full">
                           <div className="flex items-center gap-2">
                              <UserCircle className="h-4 w-4 text-muted-foreground" />
                              <SelectValue placeholder="Select cashier" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {cashierList.length > 0 ? cashierList.map(cashier => (
                            <SelectItem key={cashier.employeeId} value={cashier.employeeId}>
                              {cashier.employeeName} (ID: {cashier.employeeId})
                            </SelectItem>
                          )) : <SelectItem value="no-cashiers" disabled>No active cashiers available</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>
                   ) : user?.employeeName && user?.employeeId ? (
                     <div>
                        <Label className="mb-1 block">Cashier</Label>
                        <Input value={`${user.employeeName} (ID: ${user.employeeId})`} disabled className="bg-muted/50" />
                    </div>
                   ) : null}

                    <div>
                        <Label htmlFor="orderTypeSelect" className="mb-1 block">Order Type</Label>
                        <Select value={orderType} onValueChange={(value: OrderType) => setOrderType(value)}>
                            <SelectTrigger id="orderTypeSelect" className="w-full">
                                <div className="flex items-center gap-2">
                                    {orderTypeOptions.find(opt => opt.value === orderType)?.icon ?
                                        React.createElement(orderTypeOptions.find(opt => opt.value === orderType)!.icon!, {className: "h-4 w-4 text-muted-foreground"}) : null
                                    }
                                    <SelectValue placeholder="Select order type" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                {orderTypeOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        <div className="flex items-center gap-2">
                                            {opt.icon && React.createElement(opt.icon, {className: "h-4 w-4 text-muted-foreground"})}
                                            {opt.label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>


                  <div>
                    <Label className="mb-1 block">Select Menu Items</Label>
                    <ScrollArea className="h-[250px] md:h-[300px] w-full rounded-md border p-3">
                       {menuSelection.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No menu items available. Add items in Menu page.</p>}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {menuSelection.map(item => (
                          <div key={item.id} className="border rounded-md p-3 flex flex-col space-y-2 shadow-sm hover:shadow-md transition-shadow bg-card">
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex-1 pr-2">
                                <Label htmlFor={`item-select-${item.id}`} className="text-sm font-medium leading-tight cursor-pointer block">
                                  {item.name}
                                </Label>
                                <p className="text-xs text-muted-foreground">PKR {item.price.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground/80">{item.category || 'Uncategorized'}</p>
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
                              onChange={(e: ChangeEvent<HTMLInputElement>) => handleMenuSelectionQuantityChange(item.id, Math.max(1, parseInt(e.target.value) || 1))}
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

                  {/* Removed "Add Selected Items to Order" button */}

                  {canAddCustomItem && !showCustomItemForm && !editingSaleId && (
                    <Button type="button" variant="secondary" onClick={() => setShowCustomItemForm(true)} className="w-full">
                      <UtensilsCrossed className="mr-2 h-4 w-4" /> Add New Custom Item
                    </Button>
                  )}

                  {showCustomItemForm && canAddCustomItem && !editingSaleId && (
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
                      <div>
                        <Label htmlFor="customItemCategory" className="text-xs">Category</Label>
                        <Select
                          value={customItemCategory === undefined ? NO_CATEGORY_VALUE : customItemCategory}
                          onValueChange={(value) => setCustomItemCategory(value === NO_CATEGORY_VALUE ? undefined : value)}
                        >
                          <SelectTrigger id="customItemCategory">
                            <SelectValue placeholder="Select category (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value={NO_CATEGORY_VALUE}>Uncategorized</SelectItem>
                            {allCategories.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                            {allCategories.length === 0 && <p className="p-2 text-sm text-muted-foreground">No categories defined.</p>}
                          </SelectContent>
                        </Select>
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
                      <ScrollArea className="max-h-32 pr-2">
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
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex-1" disabled={currentOrderItems.length === 0}>
                      {editingSaleId ? 'Update Sale' : 'Complete Sale'} (Total: PKR {currentOrderTotal.toFixed(2)})
                    </Button>
                    {editingSaleId && (
                      <Button type="button" variant="outline" onClick={handleCancelEdit} className="w-full sm:w-auto flex-1 sm:flex-none">
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Sales History (Recent 10)</CardTitle>
                <CardDescription>Most recent sales. Detailed reports available in "Sales Reports" tab.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead className="text-right">Total (PKR)</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
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
                      salesRecords.filter(sale => user?.role === 'admin' || user?.role === 'manager' || sale.employeeId === user?.employeeId).slice(0, 10).map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell className="font-medium">{sale.id}</TableCell>
                          <TableCell>{format(parseISO(sale.dateTime), "PPpp")}</TableCell>
                          <TableCell className="max-w-[150px] truncate" title={sale.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}>{sale.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</TableCell>
                          <TableCell className="text-right">{sale.totalAmount.toFixed(2)}</TableCell>
                          <TableCell className="text-center space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => handleViewReceipt(sale.id)} title="View Receipt">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {isSaleEditable(sale.dateTime) && (user?.role === 'admin' || user?.role === 'manager' || sale.employeeId === user?.employeeId) && (
                                <Button variant="ghost" size="icon" onClick={() => handleStartEditSale(sale)} title="Edit Sale">
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                     {salesRecords.filter(sale => user?.role === 'admin' || user?.role === 'manager' || sale.employeeId === user?.employeeId).length === 0 && salesRecords.length > 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                            No sales records found for you.
                            </TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="salesReports">
           <SalesReports
             allSalesData={salesDataForReport}
             menuItems={menuItems}
             onViewReceipt={handleViewReceipt}
             managedEmployeesList={cashierList}
             allCategories={allCategories}
             orderTypeOptions={orderTypeOptions}
           />
        </TabsContent>
      </Tabs>

      {currentReceipt && (
        <ReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          saleRecord={currentReceipt}
        />
      )}
    </>
  );
}
