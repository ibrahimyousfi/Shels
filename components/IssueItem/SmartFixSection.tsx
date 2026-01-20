'use client';

import type { SmartFixData } from '@/lib/types';

interface SmartFixSectionProps {
  smartFix?: SmartFixData;
  isExpanded: boolean;
  onClose?: () => void;
}

export default function SmartFixSection({ smartFix, isExpanded, onClose }: SmartFixSectionProps) {
  if (!isExpanded || !smartFix) return null;

  return (
    <div className="mt-3 p-4 bg-green-900/20 border border-green-800/30 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-semibold text-green-300">🔧 Smart Fix</h4>
        {onClose && (
          <button
            onClick={onClose}
            className="text-green-400 hover:text-green-300 text-xs"
          >
            ✕
          </button>
        )}
      </div>
      <div className="space-y-2 text-xs">
        {smartFix.fixedCode ? (
          <div>
            <p className="text-green-200 font-semibold mb-1">Fixed Code:</p>
            <pre className="text-green-100 whitespace-pre-wrap bg-green-950/30 p-2 rounded text-xs overflow-x-auto">{smartFix.fixedCode}</pre>
          </div>
        ) : (
          <p className="text-yellow-400 text-xs">No fixed code available</p>
        )}
        {smartFix.explanation ? (
          <div>
            <p className="text-green-200 font-semibold mb-1">Explanation:</p>
            <p className="text-green-100">{smartFix.explanation}</p>
          </div>
        ) : null}
        {smartFix.businessLogicConsiderations ? (
          <div>
            <p className="text-green-200 font-semibold mb-1">Business Logic:</p>
            <p className="text-green-100 whitespace-pre-wrap">{smartFix.businessLogicConsiderations}</p>
          </div>
        ) : null}
        {!smartFix.fixedCode && !smartFix.explanation && !smartFix.businessLogicConsiderations && (
          <p className="text-yellow-400 text-xs">No fix data available. Please try again.</p>
        )}
      </div>
    </div>
  );
}
