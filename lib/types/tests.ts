import type { TestType } from './core';

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
