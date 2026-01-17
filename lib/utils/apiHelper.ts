import { NextRequest, NextResponse } from 'next/server';

export function createApiResponse(success: boolean, data: any, message?: string, status: number = 200) {
  return NextResponse.json(
    { success, ...data, ...(message && { message }) },
    { status: success ? 200 : status }
  );
}

export function createErrorResponse(message: string, status: number = 500): NextResponse {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

export async function parseJsonBody(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function validateArray(value: any, name: string): NextResponse | null {
  if (!value || !Array.isArray(value)) {
    return createErrorResponse(`${name} array is required`, 400);
  }
  return null;
}
