import { NextRequest } from 'next/server';
import { explainFixes } from '@/lib/services/fixExplainer';
import { CodeIssue } from '@/lib/services/codeAnalyzer';
import { createApiResponse, createErrorResponse, parseJsonBody, validateArray } from '@/lib/utils/apiHelper';

export async function POST(request: NextRequest) {
  try {
    const body = await parseJsonBody(request);
    if (!body) return createErrorResponse('Invalid JSON body', 400);

    const { issues, files } = body;
    const issuesError = validateArray(issues, 'Issues');
    const filesError = validateArray(files, 'Files');
    if (issuesError) return issuesError;
    if (filesError) return filesError;

    const explanations = await explainFixes(issues as CodeIssue[], files);
    return createApiResponse(true, { explanations });
  } catch (error: any) {
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Internal server error');
  }
}
