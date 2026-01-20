// Vercel-compatible session storage using in-memory cache
// Note: This is a temporary solution. For production, use Vercel KV, Upstash, or MongoDB

import { promises as fs } from 'fs';
import path from 'path';

interface Session {
  id: string;
  name: string;
  timestamp: number;
  repoUrl?: string;
  results: any;
  config: {
    testTypes: string[];
    duration: string;
    autoFix: boolean;
    marathonTaskId?: string;
  };
}

// In-memory storage (will be lost on server restart, but works for serverless)
// In production, replace with Vercel KV, Upstash, or MongoDB
const sessionsCache = new Map<string, Session>();
let cacheInitialized = false;

// Initialize with sessions from JSON files if cache is empty
async function initializeCache() {
  if (cacheInitialized || sessionsCache.size > 0) {
    return;
  }

  try {
    const SESSIONS_DIR = path.join(process.cwd(), 'data', 'sessions');
    
    // Try to read session files
    try {
      const files = await fs.readdir(SESSIONS_DIR);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      for (const file of jsonFiles) {
        try {
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
          
          sessionsCache.set(session.id, session);
        } catch (e) {
          // Skip invalid JSON files
          console.error(`Skipping invalid session file: ${file}`, e);
        }
      }
    } catch (dirError: any) {
      // Directory doesn't exist or can't be read (e.g., in Vercel)
      // This is expected in some serverless environments
      console.log('Could not read sessions directory (this is normal in some environments):', dirError.message);
    }
    
    cacheInitialized = true;
  } catch (error) {
    console.error('Error initializing cache:', error);
    cacheInitialized = true; // Mark as initialized to prevent infinite retries
  }
}

// Save session to cache
export async function saveSession(session: Omit<Session, 'id' | 'timestamp'>): Promise<Session> {
  await initializeCache();
  
  const newSession: Session = {
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    ...session
  };
  
  sessionsCache.set(newSession.id, newSession);
  
  // Keep only last 50 sessions
  if (sessionsCache.size > 50) {
    const sorted = Array.from(sessionsCache.entries())
      .sort((a, b) => b[1].timestamp - a[1].timestamp);
    const toDelete = sorted.slice(50);
    toDelete.forEach(([id]) => sessionsCache.delete(id));
  }
  
  return newSession;
}

// Get all sessions from cache
export async function getSessions(): Promise<Session[]> {
  await initializeCache();
  
  return Array.from(sessionsCache.values())
    .sort((a, b) => b.timestamp - a.timestamp);
}

// Get a specific session by ID
export async function getSession(id: string): Promise<Session | null> {
  await initializeCache();
  return sessionsCache.get(id) || null;
}

// Delete a session by ID
export async function deleteSession(id: string): Promise<void> {
  sessionsCache.delete(id);
}

// Clear all sessions
export async function clearAllSessions(): Promise<void> {
  sessionsCache.clear();
}

export type { Session };
