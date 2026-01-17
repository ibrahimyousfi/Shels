import { NextRequest } from 'next/server';
import { generateFixes } from '@/lib/services/autoFix';
import { CodeIssue } from '@/lib/services/codeAnalyzer';
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

    const fixes = await generateFixes(files, issues as CodeIssue[]);
    return createApiResponse(true, { fixes });
  } catch (error: any) {
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Internal server error');
  }
}
