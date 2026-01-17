'use client';

interface FixExplanationModalProps {
  explanation: any;
  onClose: () => void;
}

export default function FixExplanationModal({ explanation, onClose }: FixExplanationModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 border border-[#2f0012] rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-semibold text-white">Fix Explanation</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">✕</button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-white mb-2">Why is this dangerous?</h4>
            <p className="text-sm text-gray-300">{explanation.whyDangerous}</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-2">How to fix manually:</h4>
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{explanation.howToFixManually}</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-2">Impact:</h4>
            <p className="text-sm text-gray-300">{explanation.impact}</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-800 p-3 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Priority</p>
              <p className="font-semibold text-white">{explanation.priority}</p>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Estimated Time</p>
              <p className="font-semibold text-white">{explanation.estimatedTime}</p>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Difficulty</p>
              <p className="font-semibold text-white">{explanation.difficulty}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
