'use client';

interface BusinessImpactSectionProps {
  businessImpact?: {
    impactScore?: number;
    priority?: string;
    explanation?: string;
    estimatedCost?: {
      revenue?: string;
      users?: string;
      time?: string;
      reputation?: string;
    };
    businessMetrics?: any;
    realWorldExample?: string;
  };
}

export default function BusinessImpactSection({ businessImpact }: BusinessImpactSectionProps) {
  if (!businessImpact) return null;

  return (
    <div className="mt-3 p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg">
      <p className="text-xs font-semibold text-blue-300 mb-1">💼 Business Impact</p>
      <p className="text-xs text-blue-200">{businessImpact.explanation}</p>
      {businessImpact.realWorldExample && (
        <p className="text-xs text-blue-300 mt-2 italic">
          📊 Example: {businessImpact.realWorldExample}
        </p>
      )}
      {businessImpact.estimatedCost && (
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {businessImpact.estimatedCost.revenue && (
            <span className="text-red-300">💰 {businessImpact.estimatedCost.revenue}</span>
          )}
          {businessImpact.estimatedCost.users && (
            <span className="text-yellow-300">👥 {businessImpact.estimatedCost.users}</span>
          )}
          {businessImpact.estimatedCost.time && (
            <span className="text-green-300">⏱️ {businessImpact.estimatedCost.time}</span>
          )}
        </div>
      )}
    </div>
  );
}
