'use client';

interface ReasoningChainModalProps {
  chain: any;
  onClose: () => void;
}

export default function ReasoningChainModal({ chain, onClose }: ReasoningChainModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 border border-[#2f0012] rounded-lg p-6 max-w-3xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-semibold text-white">🧠 Reasoning Chain</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">✕</button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">Issue: {chain.issue?.type} - {chain.issue?.severity}</p>
          <p className="text-sm text-white">{chain.issue?.description}</p>
        </div>

        <div className="space-y-4 mb-4">
          {chain.steps && chain.steps.map((step: any, index: number) => (
            <div key={index} className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-900/20 rounded-r">
              <div className="flex items-center mb-2">
                <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-2">
                  {step.step}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  step.confidence === 'high' ? 'bg-green-900/30 text-green-300 border border-[#2f0012]' :
                  step.confidence === 'medium' ? 'bg-yellow-900/30 text-yellow-300 border border-[#2f0012]' :
                  'bg-gray-800 text-gray-300 border border-gray-700'
                }`}>
                  {step.confidence} confidence
                </span>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-semibold text-gray-400">💭 Thought:</p>
                  <p className="text-sm text-gray-300">{step.thought}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400">🔍 Analysis:</p>
                  <p className="text-sm text-gray-300">{step.analysis}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400">✅ Conclusion:</p>
                  <p className="text-sm text-white font-semibold">{step.conclusion}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {chain.reasoningPath && (
          <div className="mb-4 bg-gray-800 p-3 rounded-lg">
            <p className="text-xs font-semibold text-gray-400 mb-1">🛤️ Reasoning Path:</p>
            <p className="text-sm text-gray-300">{chain.reasoningPath}</p>
          </div>
        )}

        {chain.finalDecision && (
          <div className="bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
            <p className="text-xs font-semibold text-blue-300 mb-1">🎯 Final Decision:</p>
            <p className="text-sm text-white font-semibold">{chain.finalDecision}</p>
          </div>
        )}
      </div>
    </div>
  );
}
