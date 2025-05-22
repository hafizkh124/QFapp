
'use client';

import type { SaleRecord, MenuItem, ManagedEmployee } from '@/types';
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { CalendarIcon, UserCircle, LayersIcon, Eye, CreditCardIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  format,
  parse,
  isSameDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  isValid,
  getYear,
  getMonth,
  setYear,
  setMonth
} from 'date-fns';

interface SalesReportsProps {
  allSalesData: SaleRecord[];
  menuItems: MenuItem[];
  onViewReceipt: (saleId: string) => void;
  managedEmployeesList: ManagedEmployee[];
  allCategories: string[]; // Added prop for all defined categories
}

type ReportPeriodType = 'daily' | 'weekly' | 'monthly' | 'custom' | 'all';
const paymentMethods: Array<SaleRecord['paymentMethod']> = ['cash', 'card', 'online', 'credit'];

export default function SalesReports({ allSalesData, menuItems, onViewReceipt, managedEmployeesList, allCategories }: SalesReportsProps) {
  const [reportPeriodType, setReportPeriodType] = useState<ReportPeriodType>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedCustomStart, setSelectedCustomStart] = useState<Date | undefined>();
  const [selectedCustomEnd, setSelectedCustomEnd] = useState<Date | undefined>();
  const [selectedReportMenuItemId, setSelectedReportMenuItemId] = useState<string | undefined>(undefined);
  const [selectedCashierId, setSelectedCashierId] = useState<string | undefined>(undefined);
  const [selectedReportCategory, setSelectedReportCategory] = useState<string | undefined>(undefined);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<SaleRecord['paymentMethod'] | undefined>(undefined);

  const [selectedMonth, setSelectedMonth] = useState<number | undefined>();
  const [selectedYear, setSelectedYear] = useState<number | undefined>();
  const [yearsForDropdown, setYearsForDropdown] = useState<number[]>([]);

  useEffect(() => {
    const now = new Date();
    if (!selectedDate) setSelectedDate(now);
    if (selectedMonth === undefined) setSelectedMonth(getMonth(now));
    if (selectedYear === undefined) {
        const currentActualYear = getYear(now);
        setSelectedYear(currentActualYear);
        const startYear = currentActualYear - 5;
        setYearsForDropdown(Array.from({ length: 10 }, (_, i) => startYear + i));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const salesDataWithParsedDates = useMemo(() => {
    return allSalesData.map(sale => ({
      ...sale,
      parsedDate: parse(sale.date, 'yyyy-MM-dd', new Date()),
    })).filter(sale => isValid(sale.parsedDate));
  }, [allSalesData]);

  const filteredSales = useMemo(() => {
    if (!salesDataWithParsedDates) return [];

    let filtered = salesDataWithParsedDates;

    if (reportPeriodType === 'daily' && selectedDate) {
      filtered = filtered.filter(sale => isValid(sale.parsedDate) && isSameDay(sale.parsedDate, selectedDate));
    } else if (reportPeriodType === 'weekly' && selectedDate) {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
      filtered = filtered.filter(sale => isValid(sale.parsedDate) && isWithinInterval(sale.parsedDate, { start: weekStart, end: weekEnd }));
    } else if (reportPeriodType === 'monthly' && selectedMonth !== undefined && selectedYear !== undefined) {
      const monthDate = setYear(setMonth(new Date(0,0), selectedMonth), selectedYear);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      filtered = filtered.filter(sale => isValid(sale.parsedDate) && isWithinInterval(sale.parsedDate, { start: monthStart, end: monthEnd }));
    } else if (reportPeriodType === 'custom' && selectedCustomStart && selectedCustomEnd) {
      filtered = filtered.filter(sale => isValid(sale.parsedDate) && isWithinInterval(sale.parsedDate, { start: selectedCustomStart, end: selectedCustomEnd }));
    }

    if (selectedCashierId) {
      filtered = filtered.filter(sale => sale.employeeId === selectedCashierId);
    }

    if (selectedReportMenuItemId) {
      const selectedItem = menuItems.find(item => item.id === selectedReportMenuItemId);
      if (selectedItem) {
         filtered = filtered.filter(sale => sale.items.some(item => item.name === selectedItem.name));
      }
    } else if (selectedReportCategory) {
      filtered = filtered.filter(sale => {
        return sale.items.some(saleItem => {
          // We need to find the category of the saleItem.
          // The saleItem itself might not have category if it was a custom item added before categories.
          // Or if it's from the menu, its category might have changed.
          // So, we look up the current category of the item from the menuItems prop.
          const menuItemDetails = menuItems.find(mi => mi.name === saleItem.name); // Assuming name is unique for lookup
          return menuItemDetails?.category === selectedReportCategory;
        });
      });
    }

    if (selectedPaymentMethod) {
      filtered = filtered.filter(sale => sale.paymentMethod === selectedPaymentMethod);
    }

    return filtered.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  }, [
    salesDataWithParsedDates,
    reportPeriodType,
    selectedDate,
    selectedCustomStart,
    selectedCustomEnd,
    selectedMonth,
    selectedYear,
    selectedCashierId,
    selectedReportMenuItemId,
    selectedReportCategory,
    selectedPaymentMethod,
    menuItems
  ]);


  const salesSummary = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalOrders = filteredSales.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    return { totalRevenue, totalOrders, averageOrderValue };
  }, [filteredSales]);

  const topSellingItems = useMemo(() => {
    const itemMap = new Map<string, { quantity: number; revenue: number }>();
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const menuItemDetail = menuItems.find(mi => mi.name === item.name);
        if (selectedReportCategory && menuItemDetail?.category !== selectedReportCategory) {
          return;
        }

        const current = itemMap.get(item.name) || { quantity: 0, revenue: 0 };
        itemMap.set(item.name, {
          quantity: current.quantity + item.quantity,
          revenue: current.revenue + item.total,
        });
      });
    });
    return Array.from(itemMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredSales, menuItems, selectedReportCategory]);

  const paymentMethodBreakdown = useMemo(() => {
    const breakdown: Record<string, { count: number; totalAmount: number }> = {
      cash: { count: 0, totalAmount: 0 },
      card: { count: 0, totalAmount: 0 },
      online: { count: 0, totalAmount: 0 },
      credit: { count: 0, totalAmount: 0 },
    };
    filteredSales.forEach(sale => {
      if (breakdown[sale.paymentMethod]) {
        breakdown[sale.paymentMethod].count++;
        breakdown[sale.paymentMethod].totalAmount += sale.totalAmount;
      }
    });
    const totalSalesForPercentage = salesSummary.totalRevenue > 0 ? salesSummary.totalRevenue : 1;

    return Object.entries(breakdown).map(([method, data]) => ({
      method: method.charAt(0).toUpperCase() + method.slice(1),
      ...data,
      percentage: salesSummary.totalOrders > 0 ? (data.totalAmount / totalSalesForPercentage) * 100 : 0,
    }));
  }, [filteredSales, salesSummary.totalRevenue, salesSummary.totalOrders]);

  const itemSpecificReport = useMemo(() => {
    if (!selectedReportMenuItemId) return null;
    const selectedItem = menuItems.find(item => item.id === selectedReportMenuItemId);
    if (!selectedItem) return null;

    let totalQuantitySold = 0;
    let totalRevenueFromItem = 0;

    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        if (item.name === selectedItem.name) {
          totalQuantitySold += item.quantity;
          totalRevenueFromItem += item.total;
        }
      });
    });

    return {
      itemName: selectedItem.name,
      totalQuantitySold,
      totalRevenueFromItem,
    };
  }, [filteredSales, selectedReportMenuItemId, menuItems]);


  const renderDatePickers = () => {
    switch (reportPeriodType) {
      case 'daily':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
            </PopoverContent>
          </Popover>
        );
      case 'weekly':
         return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? `Week of ${format(startOfWeek(selectedDate, {weekStartsOn:1}), 'PPP')}` : <span>Pick a date in week</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
            </PopoverContent>
          </Popover>
        );
      case 'monthly':
        return (
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedMonth?.toString()} onValueChange={(val) => setSelectedMonth(parseInt(val))}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {format(new Date(0, i), 'MMMM')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear?.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
              <SelectTrigger className="w-full sm:w-[120px]">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {yearsForDropdown.map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case 'custom':
        return (
          <div className="flex flex-col sm:flex-row gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedCustomStart ? format(selectedCustomStart, 'PPP') : <span>Pick start date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={selectedCustomStart} onSelect={setSelectedCustomStart} initialFocus />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedCustomEnd ? format(selectedCustomEnd, 'PPP') : <span>Pick end date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={selectedCustomEnd} onSelect={setSelectedCustomEnd} initialFocus disabled={(date) => selectedCustomStart ? date < selectedCustomStart : false} />
              </PopoverContent>
            </Popover>
          </div>
        );
      default:
        return null;
    }
  };

  const getEmployeeNameById = (employeeId: string) => {
    const employee = managedEmployeesList.find(emp => emp.employeeId === employeeId);
    return employee ? employee.employeeName : (allSalesData.find(s => s.employeeId === employeeId)?.employeeName || employeeId);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>Select criteria to generate sales reports.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 items-end">
            <div>
              <Label htmlFor="reportPeriodType">Report Period</Label>
              <Select value={reportPeriodType} onValueChange={(value) => setReportPeriodType(value as ReportPeriodType)}>
                <SelectTrigger id="reportPeriodType">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="custom">Custom Date Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="lg:col-span-2">{renderDatePickers()}</div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-end">
            <div>
              <Label htmlFor="reportMenuItem">By Item</Label>
              <Select value={selectedReportMenuItemId} onValueChange={(value) => setSelectedReportMenuItemId(value === 'all-items' ? undefined : value)}>
                <SelectTrigger id="reportMenuItem">
                  <SelectValue placeholder="All Items" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-items">All Items</SelectItem>
                  {menuItems.map(item => (
                    <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div>
              <Label htmlFor="reportCashier">By Cashier</Label>
              <Select value={selectedCashierId} onValueChange={(value) => setSelectedCashierId(value === 'all-cashiers' ? undefined : value)}>
                <SelectTrigger id="reportCashier">
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="All Cashiers" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-cashiers">All Cashiers</SelectItem>
                  {managedEmployeesList.map(cashier => (
                    <SelectItem key={cashier.employeeId} value={cashier.employeeId}>{cashier.employeeName} (ID: {cashier.employeeId})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reportCategory">By Category</Label>
              <Select value={selectedReportCategory} onValueChange={(value) => setSelectedReportCategory(value === 'all-categories' ? undefined : value)}>
                <SelectTrigger id="reportCategory">
                  <div className="flex items-center gap-2">
                    <LayersIcon className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="All Categories" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-categories">All Categories</SelectItem>
                  {allCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                  {allCategories.length === 0 && <p className="p-2 text-sm text-muted-foreground">No categories defined.</p>}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reportPaymentMethod">By Payment Method</Label>
              <Select value={selectedPaymentMethod} onValueChange={(value) => setSelectedPaymentMethod(value === 'all-payments' ? undefined : value as SaleRecord['paymentMethod'])}>
                <SelectTrigger id="reportPaymentMethod">
                  <div className="flex items-center gap-2">
                    <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="All Payments" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-payments">All Payments</SelectItem>
                  {paymentMethods.map(method => (
                    <SelectItem key={method} value={method}>{method.charAt(0).toUpperCase() + method.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedReportMenuItemId && itemSpecificReport && (
        <Card>
          <CardHeader>
            <CardTitle>Item Specific Report: {itemSpecificReport.itemName}</CardTitle>
            <CardDescription>
              Sales data for {itemSpecificReport.itemName} for the selected filters.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Quantity Sold</CardDescription>
                        <CardTitle className="text-3xl">{itemSpecificReport.totalQuantitySold.toLocaleString()}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Revenue from Item</CardDescription>
                        <CardTitle className="text-3xl">PKR {itemSpecificReport.totalRevenueFromItem.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</CardTitle>
                    </CardHeader>
                </Card>
             </div>
             <CardTitle className="text-lg pt-4">Orders Containing {itemSpecificReport.itemName}</CardTitle>
              {filteredSales.filter(sale => sale.items.some(item => item.name === itemSpecificReport.itemName)).length > 0 ? (
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Cashier</TableHead>
                        <TableHead>Quantity of Item</TableHead>
                        <TableHead>Total Order Amount</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSales
                        .filter(sale => sale.items.some(item => item.name === itemSpecificReport.itemName))
                        .map(sale => {
                          const itemInSale = sale.items.find(i => i.name === itemSpecificReport.itemName);
                          return (
                            <TableRow key={sale.id}>
                              <TableCell>{sale.id}</TableCell>
                              <TableCell>{sale.date}</TableCell>
                              <TableCell>{getEmployeeNameById(sale.employeeId)}</TableCell>
                              <TableCell>{itemInSale?.quantity || 0}</TableCell>
                              <TableCell>PKR {sale.totalAmount.toFixed(2)}</TableCell>
                              <TableCell className="text-center">
                                <Button variant="ghost" size="icon" onClick={() => onViewReceipt(sale.id)} title="View Receipt">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <p className="text-muted-foreground">No orders found for this item with the current filters.</p>
              )}
          </CardContent>
        </Card>
      )}

      {!selectedReportMenuItemId && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Sales Summary</CardTitle>
              <CardDescription>Overview of sales for the selected filters.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Revenue</CardDescription>
                    <CardTitle className="text-3xl">PKR {salesSummary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Orders</CardDescription>
                    <CardTitle className="text-3xl">{salesSummary.totalOrders.toLocaleString()}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Average Order Value</CardDescription>
                    <CardTitle className="text-3xl">PKR {salesSummary.averageOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</CardTitle>
                  </CardHeader>
                </Card>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Items</CardTitle>
                <CardDescription>Top 5 items by revenue for the selected filters.</CardDescription>
              </CardHeader>
              <CardContent>
                {topSellingItems.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead className="text-right">Quantity Sold</TableHead>
                        <TableHead className="text-right">Total Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topSellingItems.map(item => (
                        <TableRow key={item.name}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="text-right">{item.quantity.toLocaleString()}</TableCell>
                          <TableCell className="text-right">PKR {item.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                   <p className="text-muted-foreground">No sales data for top items with current filters.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method Breakdown</CardTitle>
                <CardDescription>Distribution of sales by payment method for the selected filters.</CardDescription>
              </CardHeader>
              <CardContent>
                 {paymentMethodBreakdown.some(p => p.count > 0) ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Method</TableHead>
                          <TableHead className="text-right">Orders</TableHead>
                          <TableHead className="text-right">Total Amount</TableHead>
                          <TableHead className="text-right">Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentMethodBreakdown.map(p => (
                          <TableRow key={p.method}>
                            <TableCell>{p.method}</TableCell>
                            <TableCell className="text-right">{p.count.toLocaleString()}</TableCell>
                            <TableCell className="text-right">PKR {p.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                            <TableCell className="text-right">{p.percentage.toFixed(1)}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                 ) : (
                    <p className="text-muted-foreground">No sales data for payment methods with current filters.</p>
                 )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Sales List</CardTitle>
              <CardDescription>All sales orders matching the selected filters.</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredSales.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Cashier</TableHead>
                        <TableHead>Items (Qty)</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead className="text-right">Total (PKR)</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSales.map(sale => (
                        <TableRow key={sale.id}>
                          <TableCell>{sale.id}</TableCell>
                          <TableCell>{sale.date}</TableCell>
                          <TableCell>{getEmployeeNameById(sale.employeeId)}</TableCell>
                           <TableCell className="max-w-[200px] truncate" title={sale.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}>
                            {sale.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}
                          </TableCell>
                          <TableCell>{sale.paymentMethod.charAt(0).toUpperCase() + sale.paymentMethod.slice(1)}</TableCell>
                          <TableCell className="text-right">{sale.totalAmount.toFixed(2)}</TableCell>
                           <TableCell className="text-center">
                            <Button variant="ghost" size="icon" onClick={() => onViewReceipt(sale.id)} title="View Receipt">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <p className="text-muted-foreground text-center py-4">No sales records found for the selected criteria.</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

