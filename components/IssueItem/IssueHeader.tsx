'use client';

import type { CodeIssue, BusinessImpactData } from '@/lib/types';

interface IssueHeaderProps {
  issue: CodeIssue;
  businessImpact?: BusinessImpactData;
}

export default function IssueHeader({ issue, businessImpact }: IssueHeaderProps) {
  const severityIcon = issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🟢';
  
  const getImpactColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 75) return 'text-red-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="flex-1">
      <div className="flex items-center gap-3 mb-2">
        <p className="font-semibold text-white">
          {issue.type} - {issue.severity} {severityIcon}
        </p>
        {businessImpact?.impactScore !== undefined && (
          <div className={`flex items-center gap-1 ${getImpactColor(businessImpact.impactScore)}`}>
            <span className="text-xs font-semibold">Impact:</span>
            <span className="text-sm font-bold">{businessImpact.impactScore}/100</span>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-400 mt-1">{issue.file}</p>
      <p className="text-sm text-gray-300 mt-1">{issue.description}</p>
      {issue.suggestion && (
        <p className="text-sm text-gray-400 mt-2">💡 {issue.suggestion}</p>
      )}
    </div>
  );
}
