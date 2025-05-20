'use server';

/**
 * @fileOverview Generates proactive insights for cost savings or performance improvements based on historical restaurant data.
 *
 * - generateInsights - A function that generates insights.
 * - GenerateInsightsInput - The input type for the generateInsights function.
 * - GenerateInsightsOutput - The return type for the generateInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInsightsInputSchema = z.object({
  salesData: z.string().describe('Historical sales data, preferably in JSON format.'),
  expenseData: z.string().describe('Historical expense data, preferably in JSON format.'),
  employeePerformanceData: z.string().describe('Historical employee performance data, preferably in JSON format.'),
});
export type GenerateInsightsInput = z.infer<typeof GenerateInsightsInputSchema>;

const GenerateInsightsOutputSchema = z.object({
  insights: z.string().describe('Proactive insights for cost savings or performance improvements.'),
});
export type GenerateInsightsOutput = z.infer<typeof GenerateInsightsOutputSchema>;

export async function generateInsights(input: GenerateInsightsInput): Promise<GenerateInsightsOutput> {
  return generateInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInsightsPrompt',
  input: {schema: GenerateInsightsInputSchema},
  output: {schema: GenerateInsightsOutputSchema},
  prompt: `You are a restaurant business consultant. Analyze the provided historical data and provide actionable insights for cost savings or performance improvements.

Sales Data: {{{salesData}}}
Expense Data: {{{expenseData}}}
Employee Performance Data: {{{employeePerformanceData}}}

Provide your insights:
`,
});

const generateInsightsFlow = ai.defineFlow(
  {
    name: 'generateInsightsFlow',
    inputSchema: GenerateInsightsInputSchema,
    outputSchema: GenerateInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
