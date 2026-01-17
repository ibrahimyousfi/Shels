import { NextRequest } from 'next/server';
import { calculateCodeMetrics } from '@/lib/services/codeMetrics';
import { CodeFile, CodeIssue } from '@/lib/services/codeAnalyzer';
import { createApiResponse, createErrorResponse, parseJsonBody, validateArray } from '@/lib/utils/apiHelper';

export async function POST(request: NextRequest) {
  try {
    const body = await parseJsonBody(request);
    if (!body) return createErrorResponse('Invalid JSON body', 400);

    const { files, issues } = body;
    const filesError = validateArray(files, 'Files');
    const issuesError = validateArray(issues, 'Issues');
    if (filesError) return filesError;
    if (issuesError) return issuesError;

    if (!files || files.length === 0) {
      return createErrorResponse('No files provided for metrics calculation', 400);
    }

    const metrics = await calculateCodeMetrics(files as CodeFile[], (issues || []) as CodeIssue[]);
    return createApiResponse(true, { metrics });
  } catch (error: any) {
    console.error('Code Metrics API Error:', error);
    const errorMessage = error.message || 'Internal server error';
    
    // Check if it's a quota error
    if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      return createErrorResponse('API quota exceeded. Please wait or use a different API key.', 429);
    }
    
    return createErrorResponse(errorMessage);
  }
}
