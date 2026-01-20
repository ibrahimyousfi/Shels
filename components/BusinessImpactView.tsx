'use client';

import { useState, useEffect } from 'react';
import type { BusinessImpactViewProps, BusinessImpactData, CodeIssue } from '@/lib/types';
import { getIssueKey } from '@/lib/utils/issueUtils';
import { logError } from '@/lib/utils/logger';

export default function BusinessImpactView({ results, sessionId, onError }: BusinessImpactViewProps) {
  const [businessImpacts, setBusinessImpacts] = useState<Map<string, BusinessImpactData>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllBusinessImpacts();
  }, [results]);

  const loadAllBusinessImpacts = async () => {
    if (!results?.analysis?.issues || results.analysis.issues.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const impacts = new Map<string, BusinessImpactData>();

    // Load from session if available
    if (results.businessImpactData) {
      Object.entries(results.businessImpactData).forEach(([key, value]: [string, BusinessImpactData]) => {
        impacts.set(key, value);
      });
    }

    // Load missing impacts from API
    const missingIssues = results.analysis.issues.filter((issue: CodeIssue) => {
      const key = getIssueKey(issue);
      return !impacts.has(key);
    });

    if (missingIssues.length > 0) {
      try {
        const promises = missingIssues.map(async (issue: any) => {
          try {
            const response = await fetch('/api/business-impact', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ issue })
            });
            const data = await response.json();
            if (data.success && data.impact) {
              return { key: getIssueKey(issue), impact: data.impact };
            }
          } catch (error) {
            logError(`Failed to load business impact for ${issue.file}`, error);
          }
          return null;
        });

        const loadedImpacts = await Promise.all(promises);
        const newImpacts: Record<string, BusinessImpactData> = {};
        
        loadedImpacts.forEach(result => {
          if (result) {
            impacts.set(result.key, result.impact);
            newImpacts[result.key] = result.impact;
          }
        });
        
        // Save new impacts to session
        if (sessionId && Object.keys(newImpacts).length > 0) {
          try {
            await fetch(`/api/sessions/${sessionId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                businessImpactData: newImpacts
              })
            });
          } catch (error) {
            logError('Failed to save business impacts to session', error);
          }
        }
      } catch (error) {
        logError('Failed to load business impacts', error);
      }
    }

    setBusinessImpacts(impacts);
    setLoading(false);
  };


  if (loading) {
    return (
      <div className="mt-4">
        <h3 className="text-xl font-semibold mb-4 text-white">Business Impact Analysis</h3>
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-3 text-gray-400">Loading business impact analysis...</span>
        </div>
      </div>
    );
  }

  if (businessImpacts.size === 0) {
    return (
      <div className="mt-4">
        <h3 className="text-xl font-semibold mb-4 text-white">Business Impact Analysis</h3>
        <div className="bg-yellow-900/20 border border-[#2f0012] rounded-lg p-4">
          <p className="text-yellow-200">⚠️ No business impact data available.</p>
          <p className="text-sm text-gray-400 mt-2">
            Business impact analysis will be generated automatically when issues are loaded.
          </p>
        </div>
      </div>
    );
  }

  // Calculate totals and statistics
  const issues = results.analysis.issues || [];
  const impactsArray = Array.from(businessImpacts.entries())
    .map(([key, impact]) => {
      const issue = issues.find((i: CodeIssue) => getIssueKey(i) === key);
      return { issue, impact, key };
    })
    .filter(item => item.issue && item.impact)
    .sort((a, b) => (b.impact.impactScore || 0) - (a.impact.impactScore || 0));

  const totalImpactScore = impactsArray.reduce((sum, item) => sum + (item.impact.impactScore || 0), 0);
  const averageImpactScore = impactsArray.length > 0 ? Math.round(totalImpactScore / impactsArray.length) : 0;

  const criticalCount = impactsArray.filter(item => item.impact.priority === 'critical').length;
  const highCount = impactsArray.filter(item => item.impact.priority === 'high').length;
  const mediumCount = impactsArray.filter(item => item.impact.priority === 'medium').length;
  const lowCount = impactsArray.filter(item => item.impact.priority === 'low').length;

  return (
    <div className="mt-4">
      <h3 className="text-xl font-semibold mb-4 text-white">Business Impact Analysis</h3>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-900/20 border border-red-800/30 p-4 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">Average Impact Score</p>
          <p className="text-2xl font-bold text-red-400">{averageImpactScore}/100</p>
        </div>
        <div className="bg-orange-900/20 border border-orange-800/30 p-4 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">Critical Issues</p>
          <p className="text-2xl font-bold text-orange-400">{criticalCount}</p>
        </div>
        <div className="bg-yellow-900/20 border border-yellow-800/30 p-4 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">High Priority</p>
          <p className="text-2xl font-bold text-yellow-400">{highCount}</p>
        </div>
        <div className="bg-blue-900/20 border border-blue-800/30 p-4 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">Total Issues</p>
          <p className="text-2xl font-bold text-blue-400">{impactsArray.length}</p>
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="mb-6 bg-[#1f1f1f] p-4 rounded-lg border border-[#2f0012]">
        <h4 className="font-semibold text-white mb-3">Priority Distribution</h4>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">{criticalCount}</p>
            <p className="text-xs text-gray-400">Critical</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-400">{highCount}</p>
            <p className="text-xs text-gray-400">High</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400">{mediumCount}</p>
            <p className="text-xs text-gray-400">Medium</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-400">{lowCount}</p>
            <p className="text-xs text-gray-400">Low</p>
          </div>
        </div>
      </div>

      {/* Issues Sorted by Impact */}
      <div className="mb-6">
        <h4 className="font-semibold text-white mb-3">Issues Ranked by Business Impact</h4>
        <div className="space-y-3">
          {impactsArray.map((item, index) => {
            const { issue, impact } = item;
            if (!issue) return null;
            
            const impactScore = impact.impactScore || 0;
            const getImpactColor = (score: number) => {
              if (score >= 75) return 'text-red-400';
              if (score >= 50) return 'text-yellow-400';
              return 'text-green-400';
            };

            return (
              <div
                key={index}
                className="bg-[#1f1f1f] border border-[#2f0012] rounded-lg p-4 hover:bg-[#2a2a2a] transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-semibold text-gray-400">#{index + 1}</span>
                      <span className="font-semibold text-white">
                        {issue.type} - {issue.severity}
                      </span>
                      <span className={`text-lg font-bold ${getImpactColor(impactScore)}`}>
                        {impactScore}/100
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        impact.priority === 'critical' ? 'bg-red-900/30 text-red-300' :
                        impact.priority === 'high' ? 'bg-orange-900/30 text-orange-300' :
                        impact.priority === 'medium' ? 'bg-yellow-900/30 text-yellow-300' :
                        'bg-gray-800 text-gray-300'
                      }`}>
                        {impact.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{issue.file}</p>
                    <p className="text-sm text-gray-300 mt-1">{issue.description}</p>
                  </div>
                </div>

                {/* Impact Details */}
                <div className="mt-3 p-3 bg-blue-900/10 border border-blue-800/20 rounded-lg">
                  <p className="text-xs text-blue-300 mb-2">{impact.explanation}</p>
                  
                  {impact.estimatedCost && (
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      {impact.estimatedCost.revenue && (
                        <span className="text-red-300">💰 {impact.estimatedCost.revenue}</span>
                      )}
                      {impact.estimatedCost.users && (
                        <span className="text-yellow-300">👥 {impact.estimatedCost.users}</span>
                      )}
                      {impact.estimatedCost.time && (
                        <span className="text-green-300">⏱️ {impact.estimatedCost.time}</span>
                      )}
                      {impact.estimatedCost.reputation && (
                        <span className="text-purple-300">🏆 {impact.estimatedCost.reputation}</span>
                      )}
                    </div>
                  )}

                  {impact.realWorldExample && (
                    <p className="text-xs text-blue-200 mt-2 italic">
                      📊 <strong>Example:</strong> {impact.realWorldExample}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Total Estimated Cost Summary */}
      <div className="bg-[#1f1f1f] p-4 rounded-lg border border-[#2f0012]">
        <h4 className="font-semibold text-white mb-3">💼 Total Estimated Business Impact</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400 mb-2">Revenue Impact:</p>
            <p className="text-white">
              {impactsArray.filter(item => item.impact.estimatedCost?.revenue).length} issues affecting revenue
            </p>
          </div>
          <div>
            <p className="text-gray-400 mb-2">User Impact:</p>
            <p className="text-white">
              {impactsArray.filter(item => item.impact.estimatedCost?.users).length} issues affecting users
            </p>
          </div>
          <div>
            <p className="text-gray-400 mb-2">Time Impact:</p>
            <p className="text-white">
              {impactsArray.filter(item => item.impact.estimatedCost?.time).length} issues requiring time investment
            </p>
          </div>
          <div>
            <p className="text-gray-400 mb-2">Reputation Impact:</p>
            <p className="text-white">
              {impactsArray.filter(item => item.impact.estimatedCost?.reputation).length} issues affecting reputation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
