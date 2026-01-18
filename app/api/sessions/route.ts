import { NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { createApiResponse, createErrorResponse } from '@/lib/utils/apiHelper';
import { 
  saveSession as saveSessionToCache, 
  getSessions as getSessionsFromCache,
  type Session 
} from '@/lib/services/sessionStorageVercel';

const SESSIONS_DIR = path.join(process.cwd(), 'data', 'sessions');
const USE_FILE_STORAGE = process.env.NODE_ENV === 'development' || process.env.USE_FILE_STORAGE === 'true';

// GET: Get all sessions
export async function GET() {
  try {
    // Use in-memory cache for Vercel (serverless)
    if (!USE_FILE_STORAGE) {
      const sessions = await getSessionsFromCache();
      return createApiResponse(true, { sessions });
    }
    
    // Use file storage for local development
    await fs.mkdir(SESSIONS_DIR, { recursive: true });
    
    const files = await fs.readdir(SESSIONS_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    const sessions: any[] = [];
    
    for (const file of jsonFiles) {
      const filePath = path.join(SESSIONS_DIR, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const session = JSON.parse(content);
      
      // Add missing fields
      if (!session.id) session.id = file.replace('.json', '');
      if (!session.timestamp) {
        try {
          const stats = await fs.stat(filePath);
          session.timestamp = stats.mtime.getTime();
        } catch {
          session.timestamp = Date.now();
        }
      }
      if (!session.name) session.name = session.id;
      
      sessions.push(session);
    }
    
    // Sort by timestamp (newest first)
    sessions.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    
    return createApiResponse(true, { sessions });
  } catch (error: any) {
    return createErrorResponse(error.message || 'Failed to get sessions', 500);
  }
}

// POST: Save a new session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, repoUrl, results, config } = body;
    
    if (!name || !results) {
      return createErrorResponse('Name and results are required', 400);
    }
    
    // Use in-memory cache for Vercel (serverless)
    if (!USE_FILE_STORAGE) {
      const session = await saveSessionToCache({
        name,
        repoUrl: repoUrl || undefined,
        results,
        config: config || {
          testTypes: [],
          duration: 'one-time',
          autoFix: false
        }
      });
      return createApiResponse(true, { session });
    }
    
    // Use file storage for local development
    const session = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      timestamp: Date.now(),
      repoUrl: repoUrl || undefined,
      results,
      config: config || {
        testTypes: [],
        duration: 'one-time',
        autoFix: false
      }
    };
    
    const fileName = `${session.id}.json`;
    const filePath = path.join(SESSIONS_DIR, fileName);
    
    await fs.mkdir(SESSIONS_DIR, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(session, null, 2), 'utf-8');
    
    return createApiResponse(true, { session });
  } catch (error: any) {
    return createErrorResponse(error.message || 'Failed to save session', 500);
  }
}
