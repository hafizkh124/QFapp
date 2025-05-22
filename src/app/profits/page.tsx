
'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader as TableHeaderComponent, TableRow } from '@/components/ui/table';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts"
import type { ProfitEntry } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ShieldExclamation } from 'lucide-react';
import { format, isWithinInterval, startOfDay, endOfDay, addDays, subMonths, getYear, setYear, startOfYear, endOfYear } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const chartConfig: ChartConfig = {
  profit: {
    label: "Profit",
    color: "hsl(var(--primary))",
  },
  sales: {
    label: "Sales",
    color: "hsl(var(--chart-2))",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(var(--destructive))",
  },
};

const generateDailyData = (startDate: Date, numDays: number): ProfitEntry[] => {
  const data: ProfitEntry[] = [];
  for (let i = 0; i < numDays; i++) {
    const currentDate = addDays(startDate, i);
    const sales = Math.floor(Math.random() * 1500) + 500; // 500 - 2000
    const expenses = Math.floor(Math.random() * (sales * 0.6)) + (sales * 0.3); // 30-90% of sales
    data.push({
      period: format(currentDate, 'yyyy-MM-dd'),
      sales,
      expenses,
      profit: sales - expenses,
    });
  }
  return data;
};

const mockMonthlyProfits: ProfitEntry[] = [
  { period: 'Jan 2024', sales: 150000, expenses: 80000, profit: 70000 },
  { period: 'Feb 2024', sales: 180000, expenses: 95000, profit: 85000 },
  { period: 'Mar 2024', sales: 220000, expenses: 110000, profit: 110000 },
  { period: 'Apr 2024', sales: 195000, expenses: 100000, profit: 95000 },
  { period: 'May 2024', sales: 210000, expenses: 105000, profit: 105000 },
  { period: 'Jun 2024', sales: 230000, expenses: 115000, profit: 115000 },
];

const mockWeeklyProfits: ProfitEntry[] = [ // Assuming a month like June 2024
  { period: 'Week 1 (Jun)', sales: 55000, expenses: 28000, profit: 27000 },
  { period: 'Week 2 (Jun)', sales: 62000, expenses: 32000, profit: 30000 },
  { period: 'Week 3 (Jun)', sales: 58000, expenses: 30000, profit: 28000 },
  { period: 'Week 4 (Jun)', sales: 65000, expenses: 33000, profit: 32000 },
];

const mockBaseDateForDaily = subMonths(new Date(), 2);
const mockDailyProfitsData = generateDailyData(mockBaseDateForDaily, 90);

const mockAnnualProfits: ProfitEntry[] = [
  { period: (getYear(new Date()) - 2).toString(), sales: 2000000, expenses: 1200000, profit: 800000 },
  { period: (getYear(new Date()) - 1).toString(), sales: 2500000, expenses: 1500000, profit: 1000000 },
  { period: getYear(new Date()).toString(), sales: 1800000, expenses: 1000000, profit: 800000 },
];


export default function ProfitsPage() {
  const { user } = useAuth(); // Get authenticated user
  type Timeframe = 'daily' | 'weekly' | 'monthly' | 'annual' | 'custom';
  const [timeframe, setTimeframe] = useState<Timeframe>('monthly');
  const [profitData, setProfitData] = useState<ProfitEntry[]>(mockMonthlyProfits);
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();

  useEffect(() => {
    const today = new Date();
    setCustomStartDate(startOfDay(subMonths(today, 1)));
    setCustomEndDate(endOfDay(today));
  }, []);

  useEffect(() => {
    if (timeframe === 'daily') {
      setProfitData(mockDailyProfitsData);
    } else if (timeframe === 'weekly') {
      setProfitData(mockWeeklyProfits);
    } else if (timeframe === 'monthly') {
      setProfitData(mockMonthlyProfits);
    } else if (timeframe === 'annual') {
      setProfitData(mockAnnualProfits);
    } else if (timeframe === 'custom') {
      if (customStartDate && customEndDate) {
        const filtered = mockDailyProfitsData.filter(entry => {
          const entryDate = new Date(entry.period);
          return isWithinInterval(entryDate, { start: startOfDay(customStartDate), end: endOfDay(customEndDate) });
        });
        setProfitData(filtered);
      } else {
        setProfitData([]);
      }
    }
  }, [timeframe, customStartDate, customEndDate]);

  const totalProfit = profitData.reduce((sum, item) => sum + item.profit, 0);
  const totalSales = profitData.reduce((sum, item) => sum + item.sales, 0);
  const totalExpenses = profitData.reduce((sum, item) => sum + item.expenses, 0);

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert variant="destructive">
          <ShieldExclamation className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>You do not have permission to view profit visualizations. Please contact an administrator.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Profit Visualizer" description="Automated profit calculation and trend display.">
        <Select value={timeframe} onValueChange={(value: Timeframe) => setTimeframe(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="annual">Annual</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      {timeframe === 'custom' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Custom Date Range</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full sm:w-[280px] justify-start text-left font-normal",
                    !customStartDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customStartDate ? format(customStartDate, "PPP") : <span>Pick start date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={customStartDate}
                  onSelect={setCustomStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full sm:w-[280px] justify-start text-left font-normal",
                    !customEndDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customEndDate ? format(customEndDate, "PPP") : <span>Pick end date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={customEndDate}
                  onSelect={setCustomEndDate}
                  disabled={(date) =>
                    customStartDate ? date < customStartDate : false
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Profit Overview ({timeframe.charAt(0).toUpperCase() + timeframe.slice(1)})</CardTitle>
          <CardDescription>
            Total Sales: PKR {totalSales.toLocaleString()} | Total Expenses: PKR {totalExpenses.toLocaleString()} | Total Profit: PKR {totalProfit.toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profitData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={profitData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="period" tickLine={false} axisLine={false} tickMargin={8}
                    tickFormatter={(value) => {
                      if (timeframe === 'daily') return format(new Date(value), 'MMM d');
                      if (timeframe === 'custom' && value.length === 10) return format(new Date(value), 'MMM d');
                      return value;
                    }}
                  />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip cursor={true} content={<ChartTooltipContent indicator="line" />} />
                  <Legend />
                  <Line type="monotone" dataKey="profit" stroke="var(--color-profit)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-profit)" }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="sales" stroke="var(--color-sales)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-sales)" }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="expenses" stroke="var(--color-expenses)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-expenses)" }} activeDot={{ r: 6 }}/>
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {timeframe === 'custom' && (!customStartDate || !customEndDate)
                ? "Please select a start and end date for the custom range."
                : "No profit data available for the selected timeframe."}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Profit Report</CardTitle>
          <CardDescription>Breakdown of sales, expenses, and profits for the selected period.</CardDescription>
        </CardHeader>
        <CardContent>
         {profitData.length > 0 ? (
            <Table>
              <TableHeaderComponent>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Sales (PKR)</TableHead>
                  <TableHead className="text-right">Expenses (PKR)</TableHead>
                  <TableHead className="text-right">Profit (PKR)</TableHead>
                </TableRow>
              </TableHeaderComponent>
              <TableBody>
                {profitData.map((entry) => (
                  <TableRow key={entry.period}>
                    <TableCell className="font-medium">{entry.period}</TableCell>
                    <TableCell className="text-right">{entry.sales.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{entry.expenses.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-semibold">{entry.profit.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <p className="text-center text-muted-foreground py-4">No detailed profit data to display for this period.</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
