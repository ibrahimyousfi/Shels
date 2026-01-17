import { NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { createApiResponse, createErrorResponse } from '@/lib/utils/apiHelper';

const SESSIONS_DIR = path.join(process.cwd(), 'data', 'sessions');

// GET: Get a specific session by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const fileName = `${sessionId}.json`;
    const filePath = path.join(SESSIONS_DIR, fileName);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const session = JSON.parse(content);
      return createApiResponse(true, { session });
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return createErrorResponse('Session not found', 404);
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error getting session:', error);
    return createErrorResponse(error.message || 'Failed to get session', 500);
  }
}

// DELETE: Delete a session by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const fileName = `${sessionId}.json`;
    const filePath = path.join(SESSIONS_DIR, fileName);
    
    try {
      await fs.unlink(filePath);
      return createApiResponse(true, { message: 'Session deleted successfully' });
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return createErrorResponse('Session not found', 404);
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error deleting session:', error);
    return createErrorResponse(error.message || 'Failed to delete session', 500);
  }
}
