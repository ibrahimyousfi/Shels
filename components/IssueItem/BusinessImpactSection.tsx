'use client';

import type { BusinessImpactData } from '@/lib/types';

interface BusinessImpactSectionProps {
  businessImpact?: BusinessImpactData;
}

export default function BusinessImpactSection({ businessImpact }: BusinessImpactSectionProps) {
  if (!businessImpact) return null;

  return (
    <div className="mt-3 p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg">
      <p className="text-xs font-semibold text-blue-300 mb-1">💼 Business Impact</p>
      <p className="text-xs text-blue-200">{businessImpact.explanation}</p>
      {(businessImpact.revenueImpact || businessImpact.userImpact || businessImpact.estimatedTime) && (
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {businessImpact.revenueImpact && (
            <span className="text-red-300">💰 {businessImpact.revenueImpact}</span>
          )}
          {businessImpact.userImpact && (
            <span className="text-yellow-300">👥 {businessImpact.userImpact}</span>
          )}
          {businessImpact.estimatedTime && (
            <span className="text-green-300">⏱️ {businessImpact.estimatedTime}</span>
          )}
        </div>
      )}
    </div>
  );
}
