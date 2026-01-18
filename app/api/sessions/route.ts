import { NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { createApiResponse, createErrorResponse } from '@/lib/utils/apiHelper';

const SESSIONS_DIR = path.join(process.cwd(), 'data', 'sessions');

// Ensure sessions directory exists
async function ensureSessionsDir() {
  try {
    await fs.mkdir(SESSIONS_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create sessions directory:', error);
  }
}

// GET: Get all sessions
export async function GET() {
  try {
    await ensureSessionsDir();
    
    const files = await fs.readdir(SESSIONS_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    console.log(`Found ${jsonFiles.length} session files:`, jsonFiles);
    
    const sessions = await Promise.all(
      jsonFiles.map(async (file) => {
        try {
          const filePath = path.join(SESSIONS_DIR, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const session = JSON.parse(content);
          
          // Ensure session has required fields
          if (!session.id) {
            console.warn(`Session file ${file} missing id, using filename`);
            session.id = file.replace('.json', '');
          }
          if (!session.timestamp) {
            console.warn(`Session file ${file} missing timestamp, using file mtime`);
            const stats = await fs.stat(filePath);
            session.timestamp = stats.mtime.getTime();
          }
          if (!session.name) {
            console.warn(`Session file ${file} missing name, using id`);
            session.name = session.id;
          }
          
          return session;
        } catch (error) {
          console.error(`Error reading session file ${file}:`, error);
          return null;
        }
      })
    );
    
    // Filter out null values and sort by timestamp (newest first)
    const validSessions = sessions
      .filter(s => s !== null && s.id && s.name)
      .sort((a, b) => b.timestamp - a.timestamp);
    
    console.log(`Returning ${validSessions.length} valid sessions`);
    
    return createApiResponse(true, { sessions: validSessions });
  } catch (error: any) {
    console.error('Error getting sessions:', error);
    return createErrorResponse(error.message || 'Failed to get sessions', 500);
  }
}

// POST: Save a new session
export async function POST(request: NextRequest) {
  try {
    await ensureSessionsDir();
    
    const body = await request.json();
    const { name, repoUrl, results, config } = body;
    
    if (!name || !results) {
      return createErrorResponse('Name and results are required', 400);
    }
    
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
      
      // Sort by timestamp and delete oldest
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
    
    return createApiResponse(true, { session });
  } catch (error: any) {
    console.error('Error saving session:', error);
    return createErrorResponse(error.message || 'Failed to save session', 500);
  }
}
