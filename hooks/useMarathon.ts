import { apiFetch } from '@/lib/utils/fetchHelper';
import { logError } from '@/lib/utils/logger';
import type { AnalysisData } from './useAnalysis';

export async function startMarathonIfNeeded(
  analyzeData: AnalysisData,
  duration: 'one-time' | 'continuous',
  repoUrl: string,
  autoFix: boolean,
  currentSessionId: string | null
): Promise<{ taskId: string; status: any } | null> {
  if (duration !== 'continuous') return null;
  
  const data = await apiFetch('/api/marathon', {
    method: 'POST',
    body: JSON.stringify({
      action: 'start',
      config: {
        repoUrl: repoUrl || 'uploaded',
        testInterval: 60,
        autoFix,
        notifyOnIssue: true
      }
    })
  });
  
  if (!data.success) {
    return null;
  }
  
  // Update session with marathonTaskId
  if (currentSessionId) {
    try {
      await fetch(`/api/sessions/${currentSessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            marathonTaskId: data.taskId
          }
        })
      });
    } catch (error) {
      logError('Failed to save marathonTaskId to session', error);
    }
  }
  
  return {
    taskId: data.taskId,
    status: data.status
  };
}
