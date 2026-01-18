'use client';

interface ViewTabsProps {
  selectedView: string;
  onViewChange: (view: 'results' | 'risk-timeline' | 'metrics' | 'business-impact') => void;
}

export default function ViewTabs({ selectedView, onViewChange }: ViewTabsProps) {
  return (
    <div className="mb-4 flex space-x-2 border-b border-[#2f0012]">
      {(['results', 'risk-timeline', 'metrics', 'business-impact'] as const).map(view => (
        <button
          key={view}
          onClick={() => onViewChange(view)}
          className={`px-4 py-2 font-semibold transition-colors ${
            selectedView === view 
              ? 'border-b-2 border-gray-600 text-white' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          {view === 'results' ? 'Issues' : 
           view === 'risk-timeline' ? 'Risk Timeline' : 
           view === 'metrics' ? 'Code Metrics' : 
           'Business Impact'}
        </button>
      ))}
    </div>
  );
}
