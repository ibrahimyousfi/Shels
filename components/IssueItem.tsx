'use client';

import { useState } from 'react';

interface IssueItemProps {
  issue: any;
  onExplainFix: () => Promise<void>;
  onSmartFix: () => Promise<void>;
  onReasoningChain: () => Promise<void>;
}

export default function IssueItem({ issue, onExplainFix, onSmartFix, onReasoningChain }: IssueItemProps) {
  const [loading, setLoading] = useState<'explain' | 'smart' | 'reasoning' | null>(null);
  const severityIcon = issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🟢';

  const handleAction = async (action: 'explain' | 'smart' | 'reasoning', callback: () => Promise<void>) => {
    setLoading(action);
    try {
      await callback();
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="border border-[#2f0012] rounded-lg p-4 bg-gray-800/50 hover:bg-gray-800 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="font-semibold text-white">
            {issue.type} - {issue.severity} {severityIcon}
          </p>
          <p className="text-sm text-gray-400 mt-1">{issue.file}</p>
          <p className="text-sm text-gray-300 mt-1">{issue.description}</p>
          {issue.suggestion && (
            <p className="text-sm text-gray-400 mt-2">💡 {issue.suggestion}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 ml-4">
          <button
            onClick={() => handleAction('explain', onExplainFix)}
            disabled={loading !== null}
            className="text-sm bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 px-3 py-1.5 rounded border border-[#2f0012] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[110px] justify-center"
          >
            {loading === 'explain' ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading...</span>
              </>
            ) : (
              'Explain Fix'
            )}
          </button>
          <button
            onClick={() => handleAction('smart', onSmartFix)}
            disabled={loading !== null}
            className="text-sm bg-green-900/30 hover:bg-green-900/50 text-green-300 px-3 py-1.5 rounded border border-[#2f0012] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[110px] justify-center"
          >
            {loading === 'smart' ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading...</span>
              </>
            ) : (
              'Smart Fix'
            )}
          </button>
          <button
            onClick={() => handleAction('reasoning', onReasoningChain)}
            disabled={loading !== null}
            className="text-sm bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 px-3 py-1.5 rounded border border-[#2f0012] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[110px] justify-center"
          >
            {loading === 'reasoning' ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading...</span>
              </>
            ) : (
              <>🧠 Reasoning</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
