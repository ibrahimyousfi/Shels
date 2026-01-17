import { NextRequest } from 'next/server';
import { generateReasoningChain, generateReasoningChains } from '@/lib/services/reasoningChains';
import { CodeIssue } from '@/lib/services/codeAnalyzer';
import { createApiResponse, createErrorResponse, parseJsonBody } from '@/lib/utils/apiHelper';

export async function POST(request: NextRequest) {
  try {
    const body = await parseJsonBody(request);
    if (!body) return createErrorResponse('Invalid JSON body', 400);

    const { issue, issues, fileContent, files, codebaseContext } = body;

    if (issue && fileContent) {
      const chain = await generateReasoningChain(issue as CodeIssue, fileContent, codebaseContext);
      return createApiResponse(true, { chain });
    }

    if (issues && files) {
      const chains = await generateReasoningChains(issues as CodeIssue[], files);
      return createApiResponse(true, { chains });
    }

    return createErrorResponse('Issue and fileContent, or issues and files are required', 400);
  } catch (error: any) {
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Internal server error');
  }
}
