import type { CodeIssue, CodeFile } from './analysis';
import type { IssueData, ExplainFixData, SmartFixData, ReasoningChainData } from './fixes';
import type { BusinessImpactData } from './business';
import type { SessionResults } from './session';

// ===== Component Props Types =====
export interface IssueItemProps {
  issue: CodeIssue;
  cachedData?: IssueData;
  sessionId?: string;
  onExplainFix: () => Promise<ExplainFixData | null>;
  onSmartFix: () => Promise<SmartFixData | null>;
  onReasoningChain: () => Promise<ReasoningChainData | null>;
}

export interface IssuesListProps {
  results: SessionResults;
  sessionId?: string;
  onError?: (message: string, type?: 'error' | 'warning' | 'info') => void;
}

export interface ResultsViewProps {
  results: SessionResults;
  marathonTaskId?: string | null;
  sessionId?: string | null;
  onStopMarathon?: () => void;
  onError?: (message: string, type?: 'error' | 'warning' | 'info') => void;
  onRegenerateTimeline?: () => Promise<void>;
  onRegenerateMetrics?: () => Promise<void>;
}

export interface BusinessImpactViewProps {
  results: SessionResults;
  sessionId?: string;
  onError?: (message: string, type?: 'error' | 'warning' | 'info') => void;
}

export interface RiskTimelineViewProps {
  results: SessionResults;
  onRegenerate?: () => Promise<void>;
}

export interface CodeMetricsViewProps {
  results: SessionResults;
  onRegenerate?: () => Promise<void>;
}
