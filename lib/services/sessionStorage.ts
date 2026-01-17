export interface Session {
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

// Save session to server (JSON file)
export async function saveSession(session: Omit<Session, 'id' | 'timestamp'>): Promise<Session> {
  try {
    const response = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session)
    });
    
    const data = await response.json();
    if (data.success) {
      return data.session;
    }
    throw new Error(data.message || 'Failed to save session');
  } catch (error) {
    console.error('Failed to save session:', error);
    throw error;
  }
}

// Get all sessions from server
export async function getSessions(): Promise<Session[]> {
  try {
    const response = await fetch('/api/sessions');
    const data = await response.json();
    if (data.success) {
      return data.sessions || [];
    }
    return [];
  } catch (error) {
    console.error('Failed to load sessions:', error);
    return [];
  }
}

// Get a specific session by ID
export async function getSession(id: string): Promise<Session | null> {
  try {
    const response = await fetch(`/api/sessions/${id}`);
    const data = await response.json();
    if (data.success) {
      return data.session;
    }
    return null;
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
}

// Delete a session by ID
export async function deleteSession(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/sessions/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to delete session');
    }
  } catch (error) {
    console.error('Failed to delete session:', error);
    throw error;
  }
}

// Clear all sessions (not implemented in API, but kept for compatibility)
export async function clearAllSessions(): Promise<void> {
  console.warn('clearAllSessions is not implemented. Delete sessions individually.');
}
