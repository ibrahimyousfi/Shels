import { NextRequest } from 'next/server';
import { generateContextAwareFix } from '@/lib/services/contextAwareFix';
import { CodeIssue } from '@/lib/services/codeAnalyzer';
import { createApiResponse, createErrorResponse, parseJsonBody } from '@/lib/utils/apiHelper';

export async function POST(request: NextRequest) {
  try {
    const body = await parseJsonBody(request);
    if (!body) return createErrorResponse('Invalid JSON body', 400);

    const { issue, fileContent } = body;
    if (!issue || !fileContent) {
      return createErrorResponse('Issue and fileContent are required', 400);
    }

    const fix = await generateContextAwareFix(
      issue as CodeIssue,
      fileContent,
      body.codebaseContext || ''
    );
    return createApiResponse(true, { fix });
  } catch (error: any) {
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Internal server error');
  }
}
