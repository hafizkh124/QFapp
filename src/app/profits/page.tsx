'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader as TableHeaderComponent, TableRow } from '@/components/ui/table';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer, Line, LineChart } from "recharts"
import type { ProfitEntry } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

const mockMonthlyProfits: ProfitEntry[] = [
  { period: 'Jan 2024', sales: 15000, expenses: 8000, profit: 7000 },
  { period: 'Feb 2024', sales: 18000, expenses: 9500, profit: 8500 },
  { period: 'Mar 2024', sales: 22000, expenses: 11000, profit: 11000 },
  { period: 'Apr 2024', sales: 19500, expenses: 10000, profit: 9500 },
  { period: 'May 2024', sales: 21000, expenses: 10500, profit: 10500 },
  { period: 'Jun 2024', sales: 23000, expenses: 11500, profit: 11500 },
];

const mockWeeklyProfits: ProfitEntry[] = [
  { period: 'Week 1', sales: 3500, expenses: 1800, profit: 1700 },
  { period: 'Week 2', sales: 4200, expenses: 2200, profit: 2000 },
  { period: 'Week 3', sales: 3800, expenses: 2000, profit: 1800 },
  { period: 'Week 4', sales: 4500, expenses: 2300, profit: 2200 },
];


export default function ProfitsPage() {
  const [timeframe, setTimeframe] = useState<'monthly' | 'weekly'>('monthly');
  const [profitData, setProfitData] = useState<ProfitEntry[]>(mockMonthlyProfits);

  useEffect(() => {
    if (timeframe === 'monthly') {
      setProfitData(mockMonthlyProfits);
    } else {
      setProfitData(mockWeeklyProfits);
    }
  }, [timeframe]);
  
  const totalProfit = profitData.reduce((sum, item) => sum + item.profit, 0);
  const totalSales = profitData.reduce((sum, item) => sum + item.sales, 0);
  const totalExpenses = profitData.reduce((sum, item) => sum + item.expenses, 0);


  return (
    <>
      <PageHeader title="Profit Visualizer" description="Automated profit calculation and trend display.">
        <Select value={timeframe} onValueChange={(value: 'monthly' | 'weekly') => setTimeframe(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Profit Overview ({timeframe.charAt(0).toUpperCase() + timeframe.slice(1)})</CardTitle>
          <CardDescription>
            Total Sales: PKR {totalSales.toLocaleString()} | Total Expenses: PKR {totalExpenses.toLocaleString()} | Total Profit: PKR {totalProfit.toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={profitData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="period" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={true} content={<ChartTooltipContent indicator="line" />} />
                <Legend />
                <Line type="monotone" dataKey="profit" stroke="var(--color-profit)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-profit)" }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="sales" stroke="var(--color-sales)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-sales)" }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="expenses" stroke="var(--color-expenses)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-expenses)" }} activeDot={{ r: 6 }}/>
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Detailed Profit Report</CardTitle>
          <CardDescription>Breakdown of sales, expenses, and profits for the selected period.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeaderComponent>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Sales</TableHead>
                <TableHead className="text-right">Expenses</TableHead>
                <TableHead className="text-right">Profit</TableHead>
              </TableRow>
            </TableHeaderComponent>
            <TableBody>
              {profitData.map((entry) => (
                <TableRow key={entry.period}>
                  <TableCell className="font-medium">{entry.period}</TableCell>
                  <TableCell className="text-right">PKR {entry.sales.toLocaleString()}</TableCell>
                  <TableCell className="text-right">PKR {entry.expenses.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-semibold">PKR {entry.profit.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
