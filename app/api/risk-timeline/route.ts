import { NextRequest } from 'next/server';
import { generateRiskTimeline } from '@/lib/services/riskTimeline';
import { CodeIssue } from '@/lib/services/codeAnalyzer';
import { createApiResponse, createErrorResponse, parseJsonBody, validateArray } from '@/lib/utils/apiHelper';

export async function POST(request: NextRequest) {
  try {
    const body = await parseJsonBody(request);
    if (!body) return createErrorResponse('Invalid JSON body', 400);

    const { issues } = body;
    const issuesError = validateArray(issues, 'Issues');
    if (issuesError) return issuesError;

    if (!issues || issues.length === 0) {
      return createErrorResponse('No issues provided for timeline generation', 400);
    }

    const timeline = await generateRiskTimeline(issues as CodeIssue[], body.codebaseContext);
    return createApiResponse(true, { timeline });
  } catch (error: any) {
    console.error('Risk Timeline API Error:', error);
    const errorMessage = error.message || 'Internal server error';
    
    // Check if it's a quota error
    if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      return createErrorResponse('API quota exceeded. Please wait or use a different API key.', 429);
    }
    
    return createErrorResponse(errorMessage);
  }
}
