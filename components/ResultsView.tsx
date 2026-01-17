'use client';

import { useState } from 'react';
import IssuesList from './IssuesList';
import RiskTimelineView from './RiskTimelineView';
import CodeMetricsView from './CodeMetricsView';

interface ResultsViewProps {
  results: any;
  marathonTaskId?: string | null;
  onStopMarathon?: () => void;
  onError?: (message: string, type?: 'error' | 'warning' | 'info') => void;
  onRegenerateTimeline?: () => Promise<void>;
  onRegenerateMetrics?: () => Promise<void>;
}

export default function ResultsView({ results, marathonTaskId, onStopMarathon, onError, onRegenerateTimeline, onRegenerateMetrics }: ResultsViewProps) {
  const [selectedView, setSelectedView] = useState<'results' | 'risk-timeline' | 'metrics'>('results');

  return (
    <div className="mt-8 bg-[#171717] border border-[#2f0012] rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4 text-white">Results</h2>
      
      <SummarySection results={results} />
      {results.testResults && <TestResultsSection results={results} />}
      {results.fixes && <FixesSection results={results} />}
      {results.marathonTask && (
        <MarathonSection 
          results={results} 
          marathonTaskId={marathonTaskId || null} 
          onStop={onStopMarathon || (() => {})} 
        />
      )}

      <ViewTabs selectedView={selectedView} onViewChange={setSelectedView} />

      {selectedView === 'results' && <IssuesList results={results} onError={onError} />}
      {selectedView === 'risk-timeline' && <RiskTimelineView results={results} onRegenerate={onRegenerateTimeline} />}
      {selectedView === 'metrics' && <CodeMetricsView results={results} onRegenerate={onRegenerateMetrics} />}
    </div>
  );
}

function SummarySection({ results }: { results: any }) {
  const totalRepoFiles = results.analysis.totalRepoFiles || results.analysis.totalFiles;
  const analyzedFiles = results.analysis.totalFiles;
  const ignoredFiles = totalRepoFiles > analyzedFiles ? totalRepoFiles - analyzedFiles : 0;

  return (
    <div className="mb-4">
      <h3 className="text-xl font-semibold mb-2 text-white">Analysis Summary</h3>
      
      <div className="bg-[#1f1f1f] p-4 rounded-lg mb-3 border border-[#2f0012]">
        <p className="text-sm text-gray-400 mb-2">📊 Repository Overview</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Total files in repo:</span>
            <span className="font-semibold text-white ml-2">{totalRepoFiles || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-500">Code files analyzed:</span>
            <span className="font-semibold text-gray-300 ml-2">{analyzedFiles}</span>
          </div>
          {ignoredFiles > 0 && (
            <div className="col-span-2">
              <span className="text-gray-500">Config/assets ignored:</span>
              <span className="font-semibold text-gray-500 ml-2">{ignoredFiles}</span>
              <span className="text-xs text-gray-500 ml-2">(HTML, CSS, images, config files)</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-white">
          <span className="font-semibold">Analyzed Code Files:</span> {analyzedFiles}
          <span className="text-sm text-gray-500 ml-2">(JavaScript/TypeScript with executable logic)</span>
        </p>
        <p className="text-white">
          <span className="font-semibold">Total Lines Analyzed:</span> {results.analysis.totalLines}
        </p>
        <p className="text-white">
          <span className="font-semibold">Issues Found:</span> {results.analysis.issues.length}
        </p>
      </div>

      {ignoredFiles > 0 && (
        <div className="mt-3 bg-[#1f1f1f] p-3 rounded text-sm border border-[#2f0012]">
          <p className="text-gray-400">
            ℹ️ <strong>Why only {analyzedFiles} files?</strong> The agent intentionally focuses on executable code 
            (JS/TS) where real security and runtime risks exist, instead of inflating metrics by counting static assets.
          </p>
        </div>
      )}
    </div>
  );
}

function TestResultsSection({ results }: { results: any }) {
  return (
    <div className="mb-4">
      <h3 className="text-xl font-semibold mb-2 text-white">Tests Generated</h3>
      <p className="text-white">Total Tests: {results.tests.total}</p>
      <p className="text-white">Unit Tests: {results.tests.unitTests.length}</p>
      <p className="text-white">Integration Tests: {results.tests.integrationTests.length}</p>
      <p className="text-white">Security Tests: {results.tests.securityTests.length}</p>
      {results.tests.performanceTests?.length > 0 && (
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

function FixesSection({ results }: { results: any }) {
  return (
    <div className="mb-4">
      <h3 className="text-xl font-semibold mb-2 text-white">Fixes Generated</h3>
      <p className="text-white">Total Fixes: {results.fixes.length}</p>
    </div>
  );
}

function MarathonSection({ 
  results, 
  marathonTaskId, 
  onStop 
}: { 
  results: any; 
  marathonTaskId: string | null;
  onStop: () => void;
}) {
  return (
    <div className="mb-4 bg-[#1f1f1f] p-4 rounded-lg border border-[#2f0012]">
      <h3 className="text-xl font-semibold mb-2 text-white">Marathon Agent Active</h3>
      <p className="text-white">Status: {results.marathonTask.status}</p>
      <p className="text-white">Task ID: {results.marathonTask.id}</p>
      <p className="text-white">Issues Found: {results.marathonTask.issuesFound.length}</p>
      <p className="text-white">Tests Run: {results.marathonTask.testsRun}</p>
      {marathonTaskId && (
        <button
          onClick={onStop}
          className="mt-2 bg-red-900/30 hover:bg-red-900/50 text-red-300 px-4 py-2 rounded border border-[#2f0012] hover:border-[#4a0020] transition-colors"
        >
          Stop Marathon Agent
        </button>
      )}
    </div>
  );
}

function ViewTabs({ 
  selectedView, 
  onViewChange 
}: { 
  selectedView: string; 
  onViewChange: (view: 'results' | 'risk-timeline' | 'metrics') => void;
}) {
  return (
    <div className="mb-4 flex space-x-2 border-b border-[#2f0012]">
      {(['results', 'risk-timeline', 'metrics'] as const).map(view => (
        <button
          key={view}
          onClick={() => onViewChange(view)}
          className={`px-4 py-2 font-semibold transition-colors ${
            selectedView === view 
              ? 'border-b-2 border-gray-600 text-white' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          {view === 'results' ? 'Issues' : view === 'risk-timeline' ? 'Risk Timeline' : 'Code Metrics'}
        </button>
      ))}
    </div>
  );
}
