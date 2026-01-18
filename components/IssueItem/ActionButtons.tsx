'use client';

interface ActionButtonsProps {
  loading: 'explain' | 'smart' | 'reasoning' | null;
  cachedData: {
    explainFix?: any;
    smartFix?: any;
    reasoningChain?: any;
  };
  onExplainFix: () => void;
  onSmartFix: () => void;
  onReasoningChain: () => void;
}

export default function ActionButtons({ loading, cachedData, onExplainFix, onSmartFix, onReasoningChain }: ActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2 ml-4">
      <button
        onClick={onExplainFix}
        disabled={loading !== null}
        className={`text-sm px-3 py-1.5 rounded border border-[#2f0012] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[110px] justify-center ${
          cachedData.explainFix 
            ? 'bg-blue-700/50 hover:bg-blue-700/70 text-blue-200' 
            : 'bg-blue-900/30 hover:bg-blue-900/50 text-blue-300'
        }`}
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
          <>
            {cachedData.explainFix ? '✓ ' : ''}Explain Fix
          </>
        )}
      </button>
      <button
        onClick={onSmartFix}
        disabled={loading !== null}
        className={`text-sm px-3 py-1.5 rounded border border-[#2f0012] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[110px] justify-center ${
          cachedData.smartFix 
            ? 'bg-green-700/50 hover:bg-green-700/70 text-green-200' 
            : 'bg-green-900/30 hover:bg-green-900/50 text-green-300'
        }`}
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
          <>
            {cachedData.smartFix ? '✓ ' : ''}Smart Fix
          </>
        )}
      </button>
      <button
        onClick={onReasoningChain}
        disabled={loading !== null}
        className={`text-sm px-3 py-1.5 rounded border border-[#2f0012] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[110px] justify-center ${
          cachedData.reasoningChain 
            ? 'bg-purple-700/50 hover:bg-purple-700/70 text-purple-200' 
            : 'bg-purple-900/30 hover:bg-purple-900/50 text-purple-300'
        }`}
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
          <>
            {cachedData.reasoningChain ? '✓ ' : ''}🧠 Reasoning
          </>
        )}
      </button>
    </div>
  );
}
