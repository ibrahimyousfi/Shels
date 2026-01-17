import { NextRequest } from 'next/server';
import { runTests } from '@/lib/services/testRunner';
import { TestCase } from '@/lib/services/testGenerator';
import { createApiResponse, createErrorResponse, parseJsonBody, validateArray } from '@/lib/utils/apiHelper';

export async function POST(request: NextRequest) {
  try {
    const body = await parseJsonBody(request);
    if (!body) return createErrorResponse('Invalid JSON body', 400);

    const { tests } = body;
    const testsError = validateArray(tests, 'Tests');
    if (testsError) return testsError;

    const results = await runTests(tests as TestCase[]);
    return createApiResponse(true, { results });
  } catch (error: any) {
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Internal server error');
  }
}
