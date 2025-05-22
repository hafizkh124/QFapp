
'use client';

import { useState, type FormEvent } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, ShieldExclamation } from 'lucide-react';
import { generateInsights, type GenerateInsightsInput } from '@/ai/flows/generate-insights';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext'; // Import useAuth

const sampleSalesData = JSON.stringify([
  {"date": "2024-07-01", "item": "Pizza", "quantity": 10, "revenue": 120},
  {"date": "2024-07-01", "item": "Burger", "quantity": 15, "revenue": 75},
  {"date": "2024-07-02", "item": "Pizza", "quantity": 12, "revenue": 144},
], null, 2);

const sampleExpenseData = JSON.stringify([
  {"date": "2024-07-01", "category": "Ingredients", "item": "Flour", "cost": 50},
  {"date": "2024-07-01", "category": "Utilities", "item": "Electricity", "cost": 100},
], null, 2);

const sampleEmployeeData = JSON.stringify([
  {"employee_id": "E001", "name": "John Doe", "date": "2024-07-01", "sales_achieved": 250, "hours_worked": 8},
  {"employee_id": "E002", "name": "Jane Smith", "date": "2024-07-01", "sales_achieved": 300, "hours_worked": 8},
], null, 2);


export default function InsightsPage() {
  const { user } = useAuth(); // Get authenticated user
  const [salesData, setSalesData] = useState(sampleSalesData);
  const [expenseData, setExpenseData] = useState(sampleExpenseData);
  const [employeePerformanceData, setEmployeePerformanceData] = useState(sampleEmployeeData);
  const [generatedInsight, setGeneratedInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setGeneratedInsight(null);

    const input: GenerateInsightsInput = {
      salesData,
      expenseData,
      employeePerformanceData,
    };

    try {
      const result = await generateInsights(input);
      setGeneratedInsight(result.insights);
    } catch (err) {
      console.error("Error generating insights:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert variant="destructive">
          <ShieldExclamation className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>You do not have permission to access AI Insights. Please contact an administrator.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Insight Generator" description="Leverage AI to get proactive insights for cost savings or performance improvements based on historical data." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Input Your Data</CardTitle>
            <CardDescription>Provide historical data in JSON format for analysis.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="salesData">Sales Data (JSON)</Label>
                <Textarea
                  id="salesData"
                  value={salesData}
                  onChange={(e) => setSalesData(e.target.value)}
                  rows={8}
                  placeholder="Paste your historical sales data here..."
                  className="font-mono text-xs"
                />
              </div>
              <div>
                <Label htmlFor="expenseData">Expense Data (JSON)</Label>
                <Textarea
                  id="expenseData"
                  value={expenseData}
                  onChange={(e) => setExpenseData(e.target.value)}
                  rows={8}
                  placeholder="Paste your historical expense data here..."
                  className="font-mono text-xs"
                />
              </div>
              <div>
                <Label htmlFor="employeeData">Employee Performance Data (JSON)</Label>
                <Textarea
                  id="employeeData"
                  value={employeePerformanceData}
                  onChange={(e) => setEmployeePerformanceData(e.target.value)}
                  rows={8}
                  placeholder="Paste your historical employee performance data here..."
                  className="font-mono text-xs"
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate Insights
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Generated Insights</CardTitle>
            <CardDescription>AI-powered recommendations will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Generating insights, please wait...</p>
              </div>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {generatedInsight && !isLoading && (
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertTitle>Here are your insights!</AlertTitle>
                <AlertDescription className="whitespace-pre-wrap text-sm">
                  {generatedInsight}
                </AlertDescription>
              </Alert>
            )}
            {!isLoading && !generatedInsight && !error && (
                <p className="text-center text-muted-foreground py-4">Your generated insights will be displayed here once you submit data.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
