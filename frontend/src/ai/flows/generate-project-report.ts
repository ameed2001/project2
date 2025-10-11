'use server';

/**
 * @fileOverview A GenAI-powered tool that takes accumulated project data and user instructions to compile a PDF report for different audiences.
 *
 * - generateProjectReport - A function that handles the project report generation process.
 * - GenerateProjectReportInput - The input type for the generateProjectReport function.
 * - GenerateProjectReportOutput - The return type for the generateProjectReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProjectReportInputSchema = z.object({
  projectData: z
    .string()
    .describe('The accumulated data for the specific construction project.'),
  instructions: z.string().describe('User-defined instructions for the report compilation.'),
  audience: z.string().describe('The intended audience for the report.'),
});
export type GenerateProjectReportInput = z.infer<typeof GenerateProjectReportInputSchema>;

const GenerateProjectReportOutputSchema = z.object({
  report: z.string().describe('The compiled PDF report as a Base64 encoded string.'),
});
export type GenerateProjectReportOutput = z.infer<typeof GenerateProjectReportOutputSchema>;

export async function generateProjectReport(input: GenerateProjectReportInput): Promise<GenerateProjectReportOutput> {
  return generateProjectReportFlow(input);
}

const generateProjectReportPrompt = ai.definePrompt({
  name: 'generateProjectReportPrompt',
  input: {schema: GenerateProjectReportInputSchema},
  output: {schema: GenerateProjectReportOutputSchema},
  prompt: `You are an AI assistant specializing in compiling construction project reports.

You will receive accumulated project data, user-defined instructions, and the intended audience for the report. Based on this information, you will compile a comprehensive PDF report.

Project Data: {{{projectData}}}
Instructions: {{{instructions}}}
Audience: {{{audience}}}

Ensure the report is well-structured, informative, and tailored to the specified audience. The final report should be returned as a Base64 encoded string.
`,
});

const generateProjectReportFlow = ai.defineFlow(
  {
    name: 'generateProjectReportFlow',
    inputSchema: GenerateProjectReportInputSchema,
    outputSchema: GenerateProjectReportOutputSchema,
  },
  async input => {
    const {output} = await generateProjectReportPrompt(input);
    return output!;
  }
);
