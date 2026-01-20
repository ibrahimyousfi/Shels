import type { CodeAnalysis, CodeFile } from './analysis';
import type { TestSuite, TestResults } from './tests';
import type { Fix } from './fixes';
import type { MarathonTask } from './marathon';
import type { RiskTimeline } from './timeline';
import type { CodeMetrics } from './metrics';
import type { BusinessImpactData } from './business';
import type { ExplainFixData, SmartFixData, ReasoningChainData } from './fixes';
import type { TestType, Duration } from './core';

// ===== Session Types =====
export interface IssueData {
  explainFix?: ExplainFixData;
  smartFix?: SmartFixData;
  reasoningChain?: ReasoningChainData;
  businessImpact?: BusinessImpactData;
}

export interface SessionConfig {
  testTypes: TestType[];
  duration: Duration;
  autoFix: boolean;
  marathonTaskId?: string;
}

export interface SessionResults {
  analysis: CodeAnalysis;
  tests: TestSuite;
  testResults?: TestResults;
  fixes: Fix[];
  marathonTask?: MarathonTask;
  timeline?: RiskTimeline;
  metrics?: CodeMetrics;
  files: CodeFile[];
  issueData?: Record<string, IssueData>;
  businessImpactData?: Record<string, BusinessImpactData>;
}

export interface Session {
  id: string;
  name: string;
  timestamp: number;
  repoUrl?: string;
  results: SessionResults;
  config: SessionConfig;
}
