// Vercel-compatible session storage using in-memory cache
// Note: This is a temporary solution. For production, use Vercel KV, Upstash, or MongoDB

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
  };
}

// In-memory storage (will be lost on server restart, but works for serverless)
// In production, replace with Vercel KV, Upstash, or MongoDB
const sessionsCache = new Map<string, Session>();

// Initialize with demo session if cache is empty
function initializeCache() {
  if (sessionsCache.size === 0) {
    // You can add demo sessions here if needed
  }
}

// Save session to cache
export async function saveSession(session: Omit<Session, 'id' | 'timestamp'>): Promise<Session> {
  initializeCache();
  
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
  initializeCache();
  
  return Array.from(sessionsCache.values())
    .sort((a, b) => b.timestamp - a.timestamp);
}

// Get a specific session by ID
export async function getSession(id: string): Promise<Session | null> {
  initializeCache();
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
