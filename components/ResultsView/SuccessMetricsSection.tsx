'use client';

interface SuccessMetricsSectionProps {
  results: any;
}

export default function SuccessMetricsSection({ results }: SuccessMetricsSectionProps) {
  const issues = results.analysis?.issues || [];
  const highSeverity = issues.filter((i: any) => i.severity === 'high').length;
  const securityIssues = issues.filter((i: any) => i.type === 'security').length;
  const testCoverage = results.testResults?.coverage?.statements || 0;
  const fixesGenerated = results.fixes?.length || 0;
  
  const estimatedTimeSaved = issues.length * 30;
  const estimatedCostSaved = highSeverity * 1000;
  
  return (
    <div className="mb-4 bg-gradient-to-r from-green-900/20 to-blue-900/20 p-4 rounded-lg border border-green-800/30">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">📊</span>
        <h3 className="text-xl font-semibold text-white">Success Metrics</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <div className="bg-[#1f1f1f]/50 p-3 rounded border border-[#2f0012]">
          <p className="text-xs text-gray-400">Issues Prevented</p>
          <p className="text-lg font-bold text-green-400">{issues.length}</p>
          <p className="text-xs text-gray-500 mt-1">Before production</p>
        </div>
        <div className="bg-[#1f1f1f]/50 p-3 rounded border border-[#2f0012]">
          <p className="text-xs text-gray-400">Security Risks</p>
          <p className="text-lg font-bold text-red-400">{securityIssues}</p>
          <p className="text-xs text-gray-500 mt-1">Critical vulnerabilities</p>
        </div>
        <div className="bg-[#1f1f1f]/50 p-3 rounded border border-[#2f0012]">
          <p className="text-xs text-gray-400">Test Coverage</p>
          <p className="text-lg font-bold text-blue-400">{testCoverage}%</p>
          <p className="text-xs text-gray-500 mt-1">Automated tests</p>
        </div>
        <div className="bg-[#1f1f1f]/50 p-3 rounded border border-[#2f0012]">
          <p className="text-xs text-gray-400">Auto-Fixes</p>
          <p className="text-lg font-bold text-purple-400">{fixesGenerated}</p>
          <p className="text-xs text-gray-500 mt-1">Issues resolved</p>
        </div>
      </div>
      
      <div className="bg-[#1f1f1f]/30 p-3 rounded border border-[#2f0012]">
        <p className="text-xs text-gray-400 mb-2">💡 Estimated Impact</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-500">Time Saved:</span>
            <span className="text-green-400 font-semibold ml-2">~{estimatedTimeSaved} min</span>
          </div>
          <div>
            <span className="text-gray-500">Cost Prevented:</span>
            <span className="text-green-400 font-semibold ml-2">~${estimatedCostSaved.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
