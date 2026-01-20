import { saveSession } from '@/lib/services/sessionStorage';
import { logError } from '@/lib/utils/logger';
import type { SessionResults } from '@/lib/types';

export async function saveAnalysisSession(
  repoUrl: string,
  files: File[],
  results: SessionResults,
  config: {
    testTypes: string[];
    duration: string;
    autoFix: boolean;
    marathonTaskId?: string;
  }
): Promise<string> {
  const sessionName = repoUrl 
    ? `Analysis: ${repoUrl.split('/').pop() || 'Repository'}`
    : `Analysis: ${files.length} files`;
  
  const savedSession = await saveSession({
    name: sessionName,
    repoUrl: repoUrl || undefined,
    results,
    config
  });
  
  return savedSession.id;
}

export async function loadMarathonTaskId(
  sessionId: string
): Promise<string | null> {
  try {
    const response = await fetch(`/api/sessions/${sessionId}`);
    const data = await response.json();
    
    if (data.success && data.session?.config?.marathonTaskId) {
      // Verify that the agent is still running
      const statusResponse = await fetch(`/api/marathon?taskId=${data.session.config.marathonTaskId}`);
      const statusData = await statusResponse.json();
      
      if (statusData.success && statusData.status?.status === 'running') {
        return data.session.config.marathonTaskId;
      }
    }
  } catch (error) {
    logError('Failed to load marathonTaskId', error);
  }
  
  return null;
}
