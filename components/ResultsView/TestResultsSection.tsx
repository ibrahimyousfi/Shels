'use client';

import type { SessionResults } from '@/lib/types';

interface TestResultsSectionProps {
  results: SessionResults;
}

export default function TestResultsSection({ results }: TestResultsSectionProps) {
  return (
    <div className="mb-4">
      <h3 className="text-xl font-semibold mb-2 text-white">Tests Generated</h3>
      <p className="text-white">Total Tests: {results.tests.total}</p>
      <p className="text-white">Unit Tests: {results.tests.unitTests.length}</p>
      <p className="text-white">Integration Tests: {results.tests.integrationTests.length}</p>
      <p className="text-white">Security Tests: {results.tests.securityTests.length}</p>
      {results.tests.performanceTests && results.tests.performanceTests.length > 0 && (
        <p className="text-white">Performance Tests: {results.tests.performanceTests.length}</p>
      )}
      
      {results.testResults && (
        <div className="mt-4">
          <h4 className="font-semibold text-white mb-2">Test Results</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-900/20 border border-[#2f0012] p-3 rounded">
              <p className="text-sm text-gray-400">Passed</p>
              <p className="text-2xl font-bold text-green-400">{results.testResults.passed}</p>
            </div>
            <div className="bg-red-900/20 border border-[#2f0012] p-3 rounded">
              <p className="text-sm text-gray-400">Failed</p>
              <p className="text-2xl font-bold text-red-400">{results.testResults.failed}</p>
            </div>
          </div>
          {results.testResults.coverage && (
            <div className="mt-4">
              <p className="text-sm text-white mb-2">Coverage: {results.testResults.coverage.statements}%</p>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-gray-600 h-2 rounded-full" 
                  style={{ width: `${results.testResults.coverage.statements}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
