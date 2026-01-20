import type { CodeIssue } from './analysis';
import type { Priority, Confidence } from './core';

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
}
