
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
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const expenseCategories = ["Raw Materials", "Utilities", "Rent", "Salaries", "Marketing", "Miscellaneous", "Operational", "Fuel"];
const EXPENSES_LOCAL_STORAGE_KEY = 'quoriam-expenses-records';

export default function ExpensesPage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState(expenseCategories[0]);
  const [date, setDate] = useState<Date | undefined>();

  useEffect(() => {
    const storedExpenses = localStorage.getItem(EXPENSES_LOCAL_STORAGE_KEY);
    let initialExpenses: ExpenseRecord[] = [];
    if (storedExpenses) {
      try {
        initialExpenses = JSON.parse(storedExpenses);
      } catch (e) {
        console.error("Error parsing expenses from localStorage", e);
      }
    } else {
      // Default initial expenses if localStorage is empty
      initialExpenses = [
        { id: 'E001', date: format(new Date(), 'yyyy-MM-dd'), category: 'Raw Materials', description: 'Flour, Sugar, Eggs', amount: 150.75, employeeId: 'QE101', employeeName: 'Umar Hayat' },
        { id: 'E002', date: format(new Date(Date.now() - 86400000), 'yyyy-MM-dd'), category: 'Utilities', description: 'Electricity Bill', amount: 220.50, employeeId: 'QE101', employeeName: 'Umar Hayat' },
      ];
    }

    if (user?.role === 'employee') {
      setExpenses(initialExpenses.filter(exp => exp.employeeId === user.employeeId));
    } else {
      setExpenses(initialExpenses);
    }
    setDate(new Date()); // Initialize date for the form
  }, [user]); // Re-filter if user changes

  useEffect(() => {
    // Save to localStorage whenever expenses change
    // Admins save all, employees effectively save their own filtered list (though this only saves if they add/remove)
    // More robust would be to save the full list always and filter on load.
    // For now, this simple save will work for additions by the current user.
    if (expenses.length > 0 || localStorage.getItem(EXPENSES_LOCAL_STORAGE_KEY)) {
        localStorage.setItem(EXPENSES_LOCAL_STORAGE_KEY, JSON.stringify(expenses));
    }
  }, [expenses]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!description || amount <= 0 || !category || !date || !user) {
      alert('Please fill all fields correctly and ensure you are logged in.');
      return;
    }
    const newExpense: ExpenseRecord = {
      id: `E${Math.random().toString(36).substr(2, 5)}`,
      date: format(date, 'yyyy-MM-dd'),
      category,
      description,
      amount,
      employeeId: user.employeeId,
      employeeName: user.employeeName,
    };

    // Add to global list for admins, or just to their view for employees
    // For simplicity, we'll add to the main list and localStorage handles persistence.
    // The display list for employees is already filtered.
    setExpenses(prevExpenses => {
        const allExpenses = localStorage.getItem(EXPENSES_LOCAL_STORAGE_KEY);
        let fullExpenseList: ExpenseRecord[] = [];
        if(allExpenses) {
            try {
                fullExpenseList = JSON.parse(allExpenses);
            } catch (e) {
                //
            }
        }
        const updatedFullList = [newExpense, ...fullExpenseList];
        localStorage.setItem(EXPENSES_LOCAL_STORAGE_KEY, JSON.stringify(updatedFullList));

        if (user?.role === 'employee') {
            return updatedFullList.filter(exp => exp.employeeId === user.employeeId);
        }
        return updatedFullList;
    });

    setDescription('');
    setAmount(0);
    setCategory(expenseCategories[0]); // Reset category
    setDate(new Date()); // Reset date
  };


  if (!user) { // Handled by ProtectedLayout, but defensive
    return (
      <div className="flex items-center justify-center h-full">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>You must be logged in to manage expenses.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Expense Logger" description="Track and manage daily and monthly expenses.">
        {user?.role === 'admin' && (
            <>
            {/* Placeholder for report generation buttons for Admin */}
            {/* <Button variant="outline" className="ml-auto">Generate Daily Report</Button>
            <Button variant="outline">Generate Monthly Report</Button> */}
            </>
        )}
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
            <CardTitle>Expense History {user?.role === 'employee' ? '(My Expenses)' : '(All Expenses)'}</CardTitle>
            {user?.role === 'admin' && <CardDescription>All expense records are shown here.</CardDescription>}
            {user?.role === 'employee' && <CardDescription>Only expenses added by you are shown here.</CardDescription>}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  {user?.role === 'admin' && <TableHead>Added By</TableHead>}
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{format(new Date(expense.date), "PPP")}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    {user?.role === 'admin' && <TableCell>{expense.employeeName || expense.employeeId || 'N/A'}</TableCell>}
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

