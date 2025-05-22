
'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, PlusCircle, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import type { ExpenseRecord } from '@/types';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const expenseCategories = ["Raw Materials", "Utilities", "Rent", "Salaries", "Marketing", "Miscellaneous"];

export default function ExpensesPage() {
  const { user } = useAuth(); // Get authenticated user
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState(expenseCategories[0]);
  const [date, setDate] = useState<Date | undefined>();

  useEffect(() => {
    const initialExpenses: ExpenseRecord[] = [
      { id: 'E001', date: format(new Date(), 'PPP'), category: 'Raw Materials', description: 'Flour, Sugar, Eggs', amount: 150.75 },
      { id: 'E002', date: format(new Date(Date.now() - 86400000), 'PPP'), category: 'Utilities', description: 'Electricity Bill', amount: 220.50 },
    ];
    setExpenses(initialExpenses);
    setDate(new Date());
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!description || amount <= 0 || !category || !date) {
      alert('Please fill all fields correctly.');
      return;
    }
    const newExpense: ExpenseRecord = {
      id: `E${Math.random().toString(36).substr(2, 5)}`,
      date: format(date, 'PPP'),
      category,
      description,
      amount,
    };
    setExpenses([newExpense, ...expenses]);
    setDescription('');
    setAmount(0);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>You do not have permission to manage expenses. Please contact an administrator.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Expense Logger" description="Track and manage daily and monthly expenses.">
        {/* Placeholder for report generation buttons */}
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Add New Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="description">Description</Label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Purchase of vegetables" />
              </div>
              <div>
                <Label htmlFor="amount">Amount (PKR)</Label>
                <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value))} min="0" step="0.01" />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={(value) => setCategory(value)}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Expense History</CardTitle>
            <CardDescription>Expense reports will be available here.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.date}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell className="text-right">PKR {expense.amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {expenses.length === 0 && <p className="text-center text-muted-foreground py-4">No expense records yet.</p>}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
