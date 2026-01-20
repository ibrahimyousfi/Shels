'use client';

import { useState } from 'react';
import type { CodeMetricsViewProps, CodeMetrics } from '@/lib/types';
import { buildMetricItems, extractComplexityValue } from '@/lib/utils/metricsUtils';

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
        <div className="text-sm text-gray-400 mb-4">
          {hasFiles ? (
            <>
              <p className="mb-2">Files were analyzed but metrics calculation failed. This may happen if:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>API quota was exceeded (check console for details)</li>
                <li>An error occurred during calculation</li>
              </ul>
            </>
          ) : (
            <p>No files were analyzed, so no metrics can be calculated.</p>
          )}
          <p className="mt-2">Please check the browser console for details.</p>
        </div>
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
      
      <IndividualMetrics metrics={metrics} />
      
      {/* Show recommendations if available */}
      {(metrics.testability?.recommendations && metrics.testability.recommendations.length > 0) && (
        <RecommendationsSection recommendations={metrics.testability.recommendations} />
      )}
      
      {/* Show maintainability factors if available */}
      {(metrics.maintainability?.factors && metrics.maintainability.factors.length > 0) && (
        <MaintainabilityFactors factors={metrics.maintainability.factors} />
      )}
      
      {/* Show technical debt if available */}
      {metrics.technicalDebt && (
        <TechnicalDebtSection technicalDebt={metrics.technicalDebt} />
      )}
      
      {/* Show overall score and recommendations if available (old format) */}
      {(metrics as any).overall !== undefined && (
        <OverallScore score={(metrics as any).overall} />
      )}
      
      {(metrics as any).recommendations && Array.isArray((metrics as any).recommendations) && (metrics as any).recommendations.length > 0 && (
        <RecommendationsSection recommendations={(metrics as any).recommendations} />
      )}
      
      {(metrics as any).trends && (
        <TrendsSection trends={(metrics as any).trends} />
      )}
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

function IndividualMetrics({ metrics }: { metrics: CodeMetrics }) {
  const metricItems = buildMetricItems(metrics);
  const complexity = extractComplexityValue(metrics.complexity);

  if (metricItems.length === 0) return null;

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-600',
    red: 'bg-red-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {metricItems.map(item => {
        const displayValue = item.isInverted ? 100 - item.value : item.value;
        const percentage = Math.min(100, Math.max(0, displayValue));
        
        return (
          <div key={item.label} className="bg-[#1f1f1f] border border-[#2f0012] rounded-lg p-4">
            <p className="text-sm text-gray-300 mb-1 font-semibold">{item.label}</p>
            <p className="text-xs text-gray-500 mb-3">{item.description}</p>
            <div className="w-full bg-gray-800 rounded-full h-3 mb-2">
              <div 
                className={`${colorMap[item.color] || 'bg-gray-600'} h-3 rounded-full transition-all`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-400">Score</p>
              <p className={`text-sm font-bold ${
                item.color === 'green' ? 'text-green-400' :
                item.color === 'yellow' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {item.value.toFixed(1)}{item.isInverted ? '' : '%'}
              </p>
            </div>
            {item.isInverted && item.showExtra && complexity.max !== undefined && complexity.distribution && (
              <p className="text-xs text-gray-500 mt-1">
                Max: {complexity.max} | Distribution: {Object.keys(complexity.distribution).length} levels
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function RecommendationsSection({ recommendations }: { recommendations: string[] }) {
  return (
    <div className="mb-4 bg-blue-900/20 p-4 rounded-lg border border-[#2f0012]">
      <h4 className="font-semibold text-blue-300 mb-3">💡 Testability Recommendations</h4>
      <ul className="list-disc list-inside space-y-2">
        {recommendations.map((rec: string, index: number) => (
          <li key={index} className="text-sm text-gray-300">{rec}</li>
        ))}
      </ul>
    </div>
  );
}

function MaintainabilityFactors({ factors }: { factors: string[] }) {
  return (
    <div className="mb-4 bg-green-900/20 p-4 rounded-lg border border-[#2f0012]">
      <h4 className="font-semibold text-green-300 mb-3">📊 Maintainability Factors</h4>
      <ul className="list-disc list-inside space-y-2">
        {factors.map((factor: string, index: number) => (
          <li key={index} className="text-sm text-gray-300">{factor}</li>
        ))}
      </ul>
    </div>
  );
}

function TechnicalDebtSection({ technicalDebt }: { technicalDebt: { hours: number; cost: number; breakdown: Array<{ type: string; hours: number }> } }) {
  return (
    <div className="mb-4 bg-red-900/20 p-4 rounded-lg border border-[#2f0012]">
      <h4 className="font-semibold text-red-300 mb-3">⚠️ Technical Debt</h4>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-400 mb-1">Estimated Hours</p>
          <p className="text-xl font-bold text-red-400">{technicalDebt.hours.toFixed(1)}h</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Estimated Cost</p>
          <p className="text-xl font-bold text-red-400">${technicalDebt.cost.toLocaleString()}</p>
        </div>
      </div>
      {technicalDebt.breakdown && technicalDebt.breakdown.length > 0 && (
        <div>
          <p className="text-sm text-gray-400 mb-2">Breakdown by Type:</p>
          <ul className="list-disc list-inside space-y-1">
            {technicalDebt.breakdown.map((item, index) => (
              <li key={index} className="text-sm text-gray-300">
                {item.type}: {item.hours.toFixed(1)}h
              </li>
            ))}
          </ul>
        </div>
      )}
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
