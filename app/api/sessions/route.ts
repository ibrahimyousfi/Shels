import { NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { createApiResponse, createErrorResponse } from '@/lib/utils/apiHelper';
import { 
  saveSession as saveSessionToCache, 
  getSessions as getSessionsFromCache,
  getSession as getSessionFromCache,
  deleteSession as deleteSessionFromCache,
  type Session 
} from '@/lib/services/sessionStorageVercel';

const SESSIONS_DIR = path.join(process.cwd(), 'data', 'sessions');
const USE_FILE_STORAGE = process.env.NODE_ENV === 'development' || process.env.USE_FILE_STORAGE === 'true';

// Ensure sessions directory exists (for local development only)
async function ensureSessionsDir() {
  if (!USE_FILE_STORAGE) return;
  try {
    await fs.mkdir(SESSIONS_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create sessions directory:', error);
  }
}

// GET: Get all sessions
export async function GET() {
  try {
    // Use in-memory cache for Vercel (serverless)
    if (!USE_FILE_STORAGE) {
      const sessions = await getSessionsFromCache();
      return createApiResponse(true, { sessions });
    }
    
    // Use file storage for local development
    await ensureSessionsDir();
    
    try {
      const files = await fs.readdir(SESSIONS_DIR);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      const sessions = await Promise.all(
        jsonFiles.map(async (file) => {
          try {
            const filePath = path.join(SESSIONS_DIR, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const session = JSON.parse(content);
            
            // Ensure session has required fields
            if (!session.id) {
              session.id = file.replace('.json', '');
            }
            if (!session.timestamp) {
              const stats = await fs.stat(filePath);
              session.timestamp = stats.mtime.getTime();
            }
            if (!session.name) {
              session.name = session.id;
            }
            
            return session;
          } catch (error) {
            console.error(`Error reading session file ${file}:`, error);
            return null;
          }
        })
      );
      
      const validSessions = sessions
        .filter(s => s !== null && s.id && s.name)
        .sort((a, b) => b.timestamp - a.timestamp);
      
      return createApiResponse(true, { sessions: validSessions });
    } catch (dirError: any) {
      // If directory doesn't exist, return empty array
      if (dirError.code === 'ENOENT') {
        return createApiResponse(true, { sessions: [] });
      }
      throw dirError;
    }
  } catch (error: any) {
    console.error('Error getting sessions:', error);
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
    await ensureSessionsDir();
    
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
    
    await fs.writeFile(filePath, JSON.stringify(session, null, 2), 'utf-8');
    
    // Clean up old sessions (keep only last 50)
    try {
      const files = await fs.readdir(SESSIONS_DIR);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      if (jsonFiles.length > 50) {
        const sessionsWithTime = await Promise.all(
          jsonFiles.map(async (file) => {
            try {
              const filePath = path.join(SESSIONS_DIR, file);
              const content = await fs.readFile(filePath, 'utf-8');
              const session = JSON.parse(content);
              return { file, timestamp: session.timestamp };
            } catch {
              return { file, timestamp: 0 };
            }
          })
        );
        
        sessionsWithTime.sort((a, b) => a.timestamp - b.timestamp);
        const toDelete = sessionsWithTime.slice(0, sessionsWithTime.length - 50);
        
        for (const { file } of toDelete) {
          try {
            await fs.unlink(path.join(SESSIONS_DIR, file));
          } catch (error) {
            console.error(`Error deleting old session ${file}:`, error);
          }
        }
      }
    } catch (cleanupError) {
      // Ignore cleanup errors
      console.warn('Session cleanup error:', cleanupError);
    }
    
    return createApiResponse(true, { session });
  } catch (error: any) {
    console.error('Error saving session:', error);
    return createErrorResponse(error.message || 'Failed to save session', 500);
  }
}
