'use client';

interface LoadingSpinnerProps {
  progress: { step: string; percentage: number };
}

export default function LoadingSpinner({ progress }: LoadingSpinnerProps) {
  return (
    <div className="mt-8 bg-[#171717] border border-[#2f0012] rounded-lg p-6">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
        <p className="text-lg font-semibold text-white">{progress.step}</p>
        <div className="w-full bg-gray-800 rounded-full h-2.5 mt-4 mb-2">
          <div 
            className="bg-gray-600 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${progress.percentage}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-400">{progress.percentage}%</p>
      </div>
    </div>
  );
}
