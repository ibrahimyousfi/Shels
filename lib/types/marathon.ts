import type { CodeIssue } from './analysis';

// ===== Marathon Agent Types =====
export type MarathonStatus = 'running' | 'stopped' | 'completed';

export interface MarathonTask {
  id: string;
  status: MarathonStatus;
  startTime: string;
  issuesFound?: CodeIssue[];
  testsRun?: number;
  lastUpdate?: string;
}
