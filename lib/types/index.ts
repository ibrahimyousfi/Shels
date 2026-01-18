// ===== Core Types =====
export type Severity = 'high' | 'medium' | 'low';
export type IssueType = 'bug' | 'security' | 'performance' | 'quality' | 'error_handling';
export type TestType = 'unit' | 'integration' | 'security' | 'performance';
export type Duration = 'one-time' | 'continuous';
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type Confidence = 'high' | 'medium' | 'low';

// ===== Code Analysis Types =====
export interface CodeFile {
  path: string;
  content: string;
  language?: string;
}

export interface CodeIssue {
  type: IssueType;
  severity: Severity;
  file: string;
  line?: number;
  description: string;
  suggestion?: string;
}

export interface CodeStructure {
  mainFiles: string[];
  dependencies: string[];
  architecture: string;
}

export interface AnalysisScope {
  analyzedFileTypes: string[];
  ignoredFileTypes: string[];
  focus: string;
}

export interface CodeAnalysis {
  totalFiles: number;
  totalLines: number;
  issues: CodeIssue[];
  structure: CodeStructure;
  summary: string;
  totalRepoFiles?: number;
  ignoredFiles?: number;
  analysisScope?: AnalysisScope;
}

// ===== Test Types =====
export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration?: number;
}

export interface TestCoverage {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}

export interface TestResults {
  passed: number;
  failed: number;
  total: number;
  coverage?: TestCoverage;
  results?: TestResult[];
}

export interface Test {
  name: string;
  type: TestType;
  code: string;
  description?: string;
}

export interface TestSuite {
  total: number;
  unitTests: Test[];
  integrationTests: Test[];
  securityTests: Test[];
  performanceTests?: Test[];
}

// ===== Fix Types =====
export interface Fix {
  issue: CodeIssue;
  fixedCode: string;
  explanation: string;
  confidence?: number;
}

export interface ExplainFixData {
  whyDangerous: string;
  howToFixManually: string;
  impact: string;
  priority?: Priority;
  estimatedTime?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface SmartFixData {
  fixedCode: string;
  explanation: string;
  businessLogicConsiderations?: string;
}

export interface ReasoningStep {
  step: number;
  thought: string;
  analysis: string;
  conclusion: string;
  confidence: Confidence;
}

export interface ReasoningChainData {
  steps: ReasoningStep[];
  reasoningPath?: string;
  finalDecision?: string;
}

// ===== Business Impact Types =====
export interface EstimatedCost {
  revenue?: string;
  users?: string;
  time?: string;
  reputation?: string;
}

export interface BusinessMetrics {
  conversion?: string;
  seo?: string;
  security?: string;
  performance?: string;
}

export interface BusinessImpactData {
  impactScore: number;
  priority: Priority;
  explanation: string;
  estimatedCost?: EstimatedCost;
  businessMetrics?: BusinessMetrics;
  realWorldExample?: string;
}

// ===== Risk Timeline Types =====
export interface TimelineSummary {
  fixNow: number;
  fixSoon: number;
  canWait: number;
}

export interface TimelineItem {
  issue: CodeIssue;
  priority: string;
  estimatedTime: string;
  impact: string;
}

export interface RiskTimeline {
  summary?: TimelineSummary;
  critical?: TimelineItem[];
  high?: TimelineItem[];
  medium?: TimelineItem[];
  low?: TimelineItem[];
  recommendations?: string[];
}

// ===== Code Metrics Types =====
export interface ComplexityMetrics {
  average: number;
  max: number;
  distribution: Record<string, number>;
}

export interface MaintainabilityMetrics {
  score: number;
  factors: string[];
}

export interface TestabilityMetrics {
  score: number;
  recommendations: string[];
}

export interface TechnicalDebtItem {
  type: string;
  hours: number;
}

export interface TechnicalDebt {
  hours: number;
  cost: number;
  breakdown: TechnicalDebtItem[];
}

export interface CodeMetrics {
  complexity: ComplexityMetrics;
  maintainability: MaintainabilityMetrics;
  testability: TestabilityMetrics;
  technicalDebt: TechnicalDebt;
}

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

// ===== API Response Types =====
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
  status?: number;
}

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

// ===== Error Types =====
export type ErrorType = 'error' | 'warning' | 'info';

export interface ErrorState {
  message: string;
  type?: ErrorType;
}

// ===== Progress Types =====
export interface ProgressState {
  step: string;
  percentage: number;
}
