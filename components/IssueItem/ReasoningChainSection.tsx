'use client';

interface ReasoningChainSectionProps {
  reasoningChain: any;
  isExpanded: boolean;
  onClose?: () => void;
}

export default function ReasoningChainSection({ reasoningChain, isExpanded, onClose }: ReasoningChainSectionProps) {
  if (!isExpanded || !reasoningChain) return null;

  return (
    <div className="mt-3 p-4 bg-purple-900/20 border border-purple-800/30 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-semibold text-purple-300">🧠 Reasoning Chain</h4>
        {onClose && (
          <button
            onClick={onClose}
            className="text-purple-400 hover:text-purple-300 text-xs"
          >
            ✕
          </button>
        )}
      </div>
          <div className="space-y-3 text-xs max-h-96 overflow-y-auto">
        {reasoningChain.steps && reasoningChain.steps.map((step: any, idx: number) => (
              <div key={idx} className="border-l-2 border-purple-500 pl-3 py-2 bg-purple-950/20 rounded-r">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {step.step || idx + 1}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    step.confidence === 'high' ? 'bg-green-900/30 text-green-300' :
                    step.confidence === 'medium' ? 'bg-yellow-900/30 text-yellow-300' :
                    'bg-gray-800 text-gray-300'
                  }`}>
                    {step.confidence || 'medium'} confidence
                  </span>
                </div>
                {step.thought && (
                  <div className="mb-1">
                    <p className="text-purple-200 font-semibold text-xs">💭 Thought:</p>
                    <p className="text-purple-100 text-xs">{step.thought}</p>
                  </div>
                )}
                {step.analysis && (
                  <div className="mb-1">
                    <p className="text-purple-200 font-semibold text-xs">🔍 Analysis:</p>
                    <p className="text-purple-100 text-xs">{step.analysis}</p>
                  </div>
                )}
                {step.conclusion && (
                  <div>
                    <p className="text-purple-200 font-semibold text-xs">✅ Conclusion:</p>
                    <p className="text-purple-100 text-xs font-semibold">{step.conclusion}</p>
                  </div>
                )}
              </div>
        ))}
            {reasoningChain.reasoningPath && (
              <div className="mt-3 bg-purple-950/30 p-2 rounded">
                <p className="text-purple-200 font-semibold text-xs mb-1">🛤️ Reasoning Path:</p>
                <p className="text-purple-100 text-xs">{reasoningChain.reasoningPath}</p>
              </div>
            )}
      </div>
    </div>
  );
}
