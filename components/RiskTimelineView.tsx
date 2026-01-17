'use client';

import { useState } from 'react';

interface RiskTimelineViewProps {
  results: any;
  onRegenerate?: () => Promise<void>;
}

export default function RiskTimelineView({ results, onRegenerate }: RiskTimelineViewProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const timeline = results?.timeline;
  
  const handleRegenerate = async () => {
    if (!onRegenerate) return;
    setIsRegenerating(true);
    try {
      await onRegenerate();
    } catch (error) {
      // Error handled by onRegenerate
    } finally {
      setIsRegenerating(false);
    }
  };
  
  if (!timeline) {
    const hasIssues = results?.analysis?.issues?.length > 0;
    return (
      <div className="mt-4">
        <h3 className="text-xl font-semibold mb-4 text-white">Risk Timeline</h3>
        <div className="bg-yellow-900/20 border border-[#2f0012] rounded-lg p-4">
          <p className="text-yellow-200 mb-2">⚠️ No timeline data available.</p>
          <p className="text-sm text-gray-400 mb-4">
            {hasIssues ? (
              <>
                Issues were found but timeline generation failed. This may happen if:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>API quota was exceeded (check console for details)</li>
                  <li>An error occurred during generation</li>
                </ul>
              </>
            ) : (
              <>
                No issues were found in the codebase, so no timeline can be generated.
              </>
            )}
            <p className="mt-2">Please check the browser console for details.</p>
          </p>
          {hasIssues && onRegenerate && (
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors"
            >
              {isRegenerating ? 'Regenerating...' : 'Regenerate Timeline'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h3 className="text-xl font-semibold mb-4 text-white">Risk Timeline</h3>
      
      {timeline.summary && <SummaryCards summary={timeline.summary} />}

      {timeline.critical?.length > 0 && (
        <IssueGroup title="🔴 Critical - Fix Now" items={timeline.critical} color="red" />
      )}

      {timeline.high?.length > 0 && (
        <IssueGroup title="🟠 High - Fix Soon" items={timeline.high} color="orange" />
      )}

      {timeline.medium?.length > 0 && (
        <IssueGroup title="🟡 Medium - Can Wait" items={timeline.medium} color="yellow" />
      )}

      {timeline.low?.length > 0 && (
        <IssueGroup title="⚪ Low - Nice to Have" items={timeline.low} color="gray" />
      )}

      {timeline.recommendations?.length > 0 && (
        <RecommendationsSection recommendations={timeline.recommendations} />
      )}

      {!timeline.critical?.length && !timeline.high?.length && !timeline.medium?.length && !timeline.low?.length && (
        <p className="text-gray-400">No issues categorized in timeline.</p>
      )}
    </div>
  );
}

function SummaryCards({ summary }: { summary: any }) {
  if (!summary) return null;
  
  const cards = [
    { label: 'Fix Now', value: summary.fixNow || 0, color: 'red' },
    { label: 'Fix Soon', value: summary.fixSoon || 0, color: 'orange' },
    { label: 'Can Wait', value: summary.canWait || 0, color: 'yellow' },
    { label: 'Nice to Have', value: summary.niceToHave || 0, color: 'gray' }
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {cards.map(card => (
        <div key={card.label} className={`bg-${card.color}-900/20 border border-${card.color}-800 p-4 rounded-lg`}>
          <p className="text-sm text-gray-400 mb-1">{card.label}</p>
          <p className={`text-2xl font-bold text-${card.color}-400`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}

function IssueGroup({ title, items, color }: { title: string; items: any[]; color: string }) {
  const colorClasses: Record<string, { border: string; bg: string; text: string }> = {
    red: { border: 'border-red-500', bg: 'bg-red-900/20', text: 'text-red-400' },
    orange: { border: 'border-orange-500', bg: 'bg-orange-900/20', text: 'text-orange-400' },
    yellow: { border: 'border-yellow-500', bg: 'bg-yellow-900/20', text: 'text-yellow-400' },
    gray: { border: 'border-gray-500', bg: 'bg-gray-800/50', text: 'text-gray-400' }
  };

  const classes = colorClasses[color] || colorClasses.gray;

  return (
    <div className="mb-4">
      <h4 className={`text-lg font-semibold ${classes.text} mb-2`}>{title}</h4>
      {items.map((item: any, index: number) => (
        <div key={index} className={`border-l-4 ${classes.border} p-3 mb-2 ${classes.bg} rounded-lg`}>
          <p className="font-semibold text-white">{item.issue?.type || 'Unknown'} - {item.issue?.file || 'Unknown file'}</p>
          <p className="text-sm text-gray-300 mt-1">{item.issue?.description || item.description || 'No description'}</p>
          {item.timeline && <p className="text-sm text-gray-400 mt-1">⏰ {item.timeline}</p>}
          {item.impact && <p className="text-sm text-gray-400">Impact: {item.impact}</p>}
        </div>
      ))}
    </div>
  );
}

function RecommendationsSection({ recommendations }: { recommendations: string[] }) {
  return (
    <div className="mt-4 bg-blue-900/20 p-4 rounded-lg border border-[#2f0012]">
      <h4 className="font-semibold text-blue-300 mb-2">💡 Recommendations</h4>
      <ul className="list-disc list-inside space-y-1">
        {recommendations.map((rec: string, index: number) => (
          <li key={index} className="text-sm text-gray-300">{rec}</li>
        ))}
      </ul>
    </div>
  );
}
