import type { IssueType, Severity } from './core';

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
