'use client';

interface ExplainFixSectionProps {
  explainFix: any;
  isExpanded: boolean;
  onClose?: () => void;
}

export default function ExplainFixSection({ explainFix, isExpanded, onClose }: ExplainFixSectionProps) {
  if (!isExpanded || !explainFix) return null;

  return (
    <div className="mt-3 p-4 bg-blue-900/20 border border-blue-800/30 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-semibold text-blue-300">📝 Fix Explanation</h4>
        {onClose && (
          <button
            onClick={onClose}
            className="text-blue-400 hover:text-blue-300 text-xs"
          >
            ✕
          </button>
        )}
      </div>
      <div className="space-y-3 text-xs">
        <div>
          <p className="text-blue-200 font-semibold mb-1">Why is this dangerous?</p>
          <p className="text-blue-100">{explainFix.whyDangerous}</p>
        </div>
        <div>
          <p className="text-blue-200 font-semibold mb-1">How to fix manually:</p>
          <pre className="text-blue-100 whitespace-pre-wrap bg-blue-950/30 p-2 rounded">{explainFix.howToFixManually}</pre>
        </div>
        <div>
          <p className="text-blue-200 font-semibold mb-1">Impact:</p>
          <p className="text-blue-100">{explainFix.impact}</p>
        </div>
        {explainFix.priority && (
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="text-blue-300">Priority</p>
              <p className="text-blue-100 font-semibold capitalize">{explainFix.priority}</p>
            </div>
            {explainFix.estimatedTime && (
              <div>
                <p className="text-blue-300">Time</p>
                <p className="text-blue-100 font-semibold">{explainFix.estimatedTime}</p>
              </div>
            )}
            {explainFix.difficulty && (
              <div>
                <p className="text-blue-300">Difficulty</p>
                <p className="text-blue-100 font-semibold capitalize">{explainFix.difficulty}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
