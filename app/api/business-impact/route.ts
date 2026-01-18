import { NextRequest } from 'next/server';
import { analyzeBusinessImpact, analyzeMultipleIssues } from '@/lib/services/businessImpact';
import { createApiResponse, createErrorResponse } from '@/lib/utils/apiHelper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { issue, issues, codebaseContext } = body;

    if (issue) {
      // Single issue analysis
      const impact = await analyzeBusinessImpact(issue, codebaseContext);
      return createApiResponse(true, { impact });
    } else if (issues && Array.isArray(issues)) {
      // Multiple issues analysis
      const impacts = await analyzeMultipleIssues(issues, codebaseContext);
      return createApiResponse(true, { impacts });
    } else {
      return createErrorResponse('Either "issue" or "issues" array must be provided', 400);
    }
  } catch (error: any) {
    console.error('Business Impact API Error:', error);
    return createErrorResponse(error.message || 'Failed to analyze business impact', 500);
  }
}
