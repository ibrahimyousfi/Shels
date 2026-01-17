import { NextRequest } from 'next/server';
import { readFilesFromGitHub, filterCodeFiles } from '@/lib/services/repoReader';
import { generateTests } from '@/lib/services/testGenerator';
import { createApiResponse, createErrorResponse, parseJsonBody } from '@/lib/utils/apiHelper';

export async function POST(request: NextRequest) {
  try {
    const body = await parseJsonBody(request);
    if (!body) return createErrorResponse('Invalid JSON body', 400);

    const { repoUrl, files, testTypes } = body;
    let codeFiles = files || [];

    if (repoUrl) {
      codeFiles = await readFilesFromGitHub(repoUrl);
    } else if (!codeFiles.length) {
      return createErrorResponse('Either repoUrl or files must be provided', 400);
    }

    const filteredFiles = filterCodeFiles(codeFiles);
    if (!filteredFiles.length) {
      return createErrorResponse('No code files found', 400);
    }

    const tests = await generateTests(filteredFiles, testTypes || ['unit', 'integration', 'security']);
    return createApiResponse(true, { tests });
  } catch (error: any) {
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Internal server error');
  }
}
