'use client';

import { useState } from 'react';
import IssuesList from './IssuesList';
import RiskTimelineView from './RiskTimelineView';
import CodeMetricsView from './CodeMetricsView';
import BusinessImpactView from './BusinessImpactView';
import SummarySection from './ResultsView/SummarySection';
import TestResultsSection from './ResultsView/TestResultsSection';
import FixesSection from './ResultsView/FixesSection';
import MarathonSection from './ResultsView/MarathonSection';
import SuccessMetricsSection from './ResultsView/SuccessMetricsSection';
import ViewTabs from './ResultsView/ViewTabs';
import type { ResultsViewProps } from '@/lib/types';

export default function ResultsView({ results, marathonTaskId, sessionId, onStopMarathon, onError, onRegenerateTimeline, onRegenerateMetrics }: ResultsViewProps) {
  const [selectedView, setSelectedView] = useState<'results' | 'risk-timeline' | 'metrics' | 'business-impact'>('results');

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
      
      <SuccessMetricsSection results={results} />

      <ViewTabs selectedView={selectedView} onViewChange={setSelectedView} />

      {selectedView === 'results' && <IssuesList results={results} sessionId={sessionId || undefined} onError={onError} />}
      {selectedView === 'risk-timeline' && <RiskTimelineView results={results} onRegenerate={onRegenerateTimeline} />}
      {selectedView === 'metrics' && <CodeMetricsView results={results} onRegenerate={onRegenerateMetrics} />}
      {selectedView === 'business-impact' && <BusinessImpactView results={results} sessionId={sessionId || undefined} onError={onError} />}
    </div>
  );
}
