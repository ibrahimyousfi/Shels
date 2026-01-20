import { apiFetch } from '@/lib/utils/fetchHelper';
import { logError } from '@/lib/utils/logger';
import type { TestSuite, TestResults } from '@/lib/types';
import type { AnalysisData } from './useAnalysis';

export async function generateTests(analyzeData: AnalysisData, testTypes: string[]): Promise<{ tests: TestSuite }> {
  const data = await apiFetch('/api/generate-tests', {
    method: 'POST',
    body: JSON.stringify({
      files: analyzeData.files,
      issues: analyzeData.analysis.issues,
      testTypes
    })
  });
  
  if (!data.success || !data.tests) {
    throw new Error(data.message || 'Test generation failed');
  }
  
  return { tests: data.tests };
}

export async function runTests(testData: { tests: TestSuite }): Promise<TestResults | null> {
  // Convert TestSuite to array of all tests
  const allTests = [
    ...(testData.tests.unitTests || []),
    ...(testData.tests.integrationTests || []),
    ...(testData.tests.securityTests || []),
    ...(testData.tests.performanceTests || [])
  ];
  
  if (allTests.length === 0) {
    return null;
  }
  
  const data = await apiFetch('/api/run-tests', {
    method: 'POST',
    body: JSON.stringify({ tests: allTests })
  });
  
  if (!data.success) {
    logError('Test execution failed', new Error(data.message || 'Unknown error'));
    return null;
  }
  
  return data.results || null;
}

export async function generateFixes(
  analyzeData: AnalysisData,
  autoFix: boolean
): Promise<any[] | null> {
  if (!autoFix || !analyzeData.analysis?.issues || analyzeData.analysis.issues.length === 0) {
    return null;
  }
  
  const filesForFix = analyzeData.files.filter(file => 
    analyzeData.analysis.issues.some(issue => issue.file === file.path)
  );
  
  if (filesForFix.length === 0) return null;
  
  const data = await apiFetch('/api/fix', {
    method: 'POST',
    body: JSON.stringify({ files: filesForFix, issues: analyzeData.analysis.issues })
  });
  
  return data.success ? data.fixes : null;
}
