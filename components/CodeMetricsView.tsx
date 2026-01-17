'use client';

import { useState } from 'react';

interface CodeMetricsViewProps {
  results: any;
  onRegenerate?: () => Promise<void>;
}

export default function CodeMetricsView({ results, onRegenerate }: CodeMetricsViewProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const metrics = results?.metrics;
  
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
  
  if (!metrics) {
    const hasFiles = results?.files?.length > 0 || results?.analysis?.totalFiles > 0;
    return (
      <div className="mt-4">
        <h3 className="text-xl font-semibold mb-4 text-white">Code Metrics</h3>
        <div className="bg-yellow-900/20 border border-[#2f0012] rounded-lg p-4">
          <p className="text-yellow-200 mb-2">⚠️ No metrics data available.</p>
          <p className="text-sm text-gray-400 mb-4">
            {hasFiles ? (
              <>
                Files were analyzed but metrics calculation failed. This may happen if:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>API quota was exceeded (check console for details)</li>
                  <li>An error occurred during calculation</li>
                </ul>
              </>
            ) : (
              <>
                No files were analyzed, so no metrics can be calculated.
              </>
            )}
            <p className="mt-2">Please check the browser console for details.</p>
          </p>
          {hasFiles && onRegenerate && (
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors"
            >
              {isRegenerating ? 'Regenerating...' : 'Regenerate Metrics'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h3 className="text-xl font-semibold mb-4 text-white">Code Metrics</h3>
      
      {metrics.overall !== undefined && <OverallScore score={metrics.overall} />}
      <IndividualMetrics metrics={metrics} />
      {metrics.recommendations?.length > 0 && (
        <RecommendationsSection recommendations={metrics.recommendations} />
      )}
      {metrics.trends && <TrendsSection trends={metrics.trends} />}
    </div>
  );
}

function OverallScore({ score }: { score: number }) {
  const color = score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red';
  const colorClass = score >= 80 ? 'bg-green-600' : score >= 60 ? 'bg-yellow-600' : 'bg-red-600';
  
  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        <span className="text-white font-semibold">Overall Score</span>
        <span className="text-white font-bold text-2xl">{score}/100</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-4">
        <div 
          className={`h-4 rounded-full ${colorClass}`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        ></div>
      </div>
    </div>
  );
}

function IndividualMetrics({ metrics }: { metrics: any }) {
  const metricItems = [
    { label: 'Maintainability', value: metrics.maintainability, color: 'blue' },
    { label: 'Security', value: metrics.security, color: 'red' },
    { label: 'Testability', value: metrics.testability, color: 'green' },
    { label: 'Performance', value: metrics.performance, color: 'purple' },
    { label: 'Complexity', value: metrics.complexity, color: 'orange' }
  ].filter(item => item.value !== undefined);

  if (metricItems.length === 0) return null;

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-600',
    red: 'bg-red-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600'
  };

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {metricItems.map(item => (
        <div key={item.label}>
          <p className="text-sm text-gray-300 mb-1">{item.label}</p>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className={`${colorMap[item.color] || 'bg-gray-600'} h-2 rounded-full`}
              style={{ width: `${Math.min(100, Math.max(0, item.value))}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400 mt-1">{item.value}%</p>
        </div>
      ))}
    </div>
  );
}

function RecommendationsSection({ recommendations }: { recommendations: string[] }) {
  return (
    <div className="mb-4 bg-blue-900/20 p-4 rounded-lg border border-[#2f0012]">
      <h4 className="font-semibold text-blue-300 mb-2">💡 Recommendations</h4>
      <ul className="list-disc list-inside space-y-1">
        {recommendations.map((rec: string, index: number) => (
          <li key={index} className="text-sm text-gray-300">{rec}</li>
        ))}
      </ul>
    </div>
  );
}

function TrendsSection({ trends }: { trends: any }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {trends.improvement?.length > 0 && (
        <div className="bg-green-900/20 p-4 rounded-lg border border-[#2f0012]">
          <h4 className="font-semibold text-green-400 mb-2">✅ Improvements</h4>
          <ul className="list-disc list-inside space-y-1">
            {trends.improvement.map((item: string, index: number) => (
              <li key={index} className="text-sm text-gray-300">{item}</li>
            ))}
          </ul>
        </div>
      )}
      {trends.degradation?.length > 0 && (
        <div className="bg-red-900/20 p-4 rounded-lg border border-[#2f0012]">
          <h4 className="font-semibold text-red-400 mb-2">⚠️ Degradations</h4>
          <ul className="list-disc list-inside space-y-1">
            {trends.degradation.map((item: string, index: number) => (
              <li key={index} className="text-sm text-gray-300">{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
