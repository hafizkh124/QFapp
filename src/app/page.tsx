import { DollarSign, Receipt, TrendingUp, Users, Activity } from 'lucide-react';
import { DashboardCard } from '@/components/dashboard-card';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader as TableHeaderComponent, TableRow } from '@/components/ui/table';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts"
import type { ProfitEntry } from '@/types';

const chartConfig = {
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
} satisfies ChartConfig

// Mock Data
const monthlyProfits: ProfitEntry[] = [
  { period: 'Jan', sales: 15000, expenses: 8000, profit: 7000 },
  { period: 'Feb', sales: 18000, expenses: 9500, profit: 8500 },
  { period: 'Mar', sales: 22000, expenses: 11000, profit: 11000 },
  { period: 'Apr', sales: 19500, expenses: 10000, profit: 9500 },
  { period: 'May', sales: 21000, expenses: 10500, profit: 10500 },
  { period: 'Jun', sales: 23000, expenses: 11500, profit: 11500 },
];

const recentActivities = [
  { description: "New expense 'Office Supplies' added.", time: "10 mins ago", icon: <Receipt className="w-4 h-4" /> },
  { description: "Daily sales report generated.", time: "1 hour ago", icon: <DollarSign className="w-4 h-4" /> },
  { description: "Employee 'John Doe' performance updated.", time: "3 hours ago", icon: <Users className="w-4 h-4" /> },
  { description: "AI Insight: 'Consider reducing XYZ ingredient usage'.", time: "1 day ago", icon: <TrendingUp className="w-4 h-4" /> },
];

export default function DashboardPage() {
  const totalSales = monthlyProfits.reduce((sum, item) => sum + item.sales, 0);
  const totalExpenses = monthlyProfits.reduce((sum, item) => sum + item.expenses, 0);
  const totalProfit = totalSales - totalExpenses;

  return (
    <>
      <PageHeader title="Dashboard" description="Overview of your restaurant's performance." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <DashboardCard
          title="Total Sales"
          value={`$${totalSales.toLocaleString()}`}
          icon={<DollarSign className="w-5 h-5" />}
          description="Total revenue generated"
        />
        <DashboardCard
          title="Total Expenses"
          value={`$${totalExpenses.toLocaleString()}`}
          icon={<Receipt className="w-5 h-5" />}
          description="Total operational costs"
        />
        <DashboardCard
          title="Total Profit"
          value={`$${totalProfit.toLocaleString()}`}
          icon={<TrendingUp className="w-5 h-5" />}
          description="Net profit after expenses"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Profit Trends</CardTitle>
            <CardDescription>Profit breakdown for the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyProfits} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="period" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Legend />
                  <Bar dataKey="profit" fill="var(--color-profit)" radius={4} />
                  <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
                  <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and actions in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeaderComponent>
                <TableRow>
                  <TableHead className="w-[50px]">Icon</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeaderComponent>
              <TableBody>
                {recentActivities.map((activity, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-muted-foreground">{activity.icon}</TableCell>
                    <TableCell>{activity.description}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">{activity.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
