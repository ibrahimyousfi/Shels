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

// PATCH: Update session data (for issueData)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const filePath = path.join(SESSIONS_DIR, `${id}.json`);
    const body = await request.json();

    try {
      // Read existing session
      const content = await fs.readFile(filePath, 'utf-8');
      const session = JSON.parse(content);

      // Update session with new data
      if (body.issueData !== undefined) {
        if (!session.results.issueData) {
          session.results.issueData = {};
        }
        session.results.issueData = { ...session.results.issueData, ...body.issueData };
      }
      
      // Update timeline if provided
      if (body.results?.timeline !== undefined) {
        session.results.timeline = body.results.timeline;
      }
      
      // Update metrics if provided
      if (body.results?.metrics !== undefined) {
        session.results.metrics = body.results.metrics;
      }
      
      // Update businessImpactData if provided
      if (body.businessImpactData !== undefined) {
        if (!session.results.businessImpactData) {
          session.results.businessImpactData = {};
        }
        session.results.businessImpactData = { ...session.results.businessImpactData, ...body.businessImpactData };
      }
      
      // Full results update (for complete replacement)
      if (body.results && Object.keys(body.results).length > 0) {
        session.results = { ...session.results, ...body.results };
      }

      // Save updated session
      await fs.writeFile(filePath, JSON.stringify(session, null, 2), 'utf-8');
      
      return createApiResponse(true, { session });
    } catch (fileError: any) {
      if (fileError.code === 'ENOENT') {
        return createErrorResponse('Session not found', 404);
      }
      throw fileError;
    }
  } catch (error: any) {
    console.error('Error updating session:', error);
    return createErrorResponse(error.message || 'Failed to update session', 500);
  }
}
