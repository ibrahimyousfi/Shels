'use client';

import type { SessionResults } from '@/lib/types';

interface MarathonSectionProps {
  results: SessionResults;
  marathonTaskId: string | null;
  onStop: () => void;
}

export default function MarathonSection({ results, marathonTaskId, onStop }: MarathonSectionProps) {
  const task = results.marathonTask;
  if (!task) return null;
  
  const runtime = task.startTime ? Math.floor((Date.now() - new Date(task.startTime).getTime()) / 1000 / 60) : 0;
  
  return (
    <div className="mb-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-4 rounded-lg border border-purple-800/30">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">⚡</span>
        <h3 className="text-xl font-semibold text-white">Marathon Agent - Autonomous Operation</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <div className="bg-[#1f1f1f]/50 p-3 rounded border border-[#2f0012]">
          <p className="text-xs text-gray-400">Status</p>
          <p className="text-sm font-semibold text-green-400 capitalize">{task.status}</p>
        </div>
        <div className="bg-[#1f1f1f]/50 p-3 rounded border border-[#2f0012]">
          <p className="text-xs text-gray-400">Runtime</p>
          <p className="text-sm font-semibold text-white">{runtime} min</p>
        </div>
        <div className="bg-[#1f1f1f]/50 p-3 rounded border border-[#2f0012]">
          <p className="text-xs text-gray-400">Issues Found</p>
          <p className="text-sm font-semibold text-yellow-400">{task.issuesFound?.length || 0}</p>
        </div>
        <div className="bg-[#1f1f1f]/50 p-3 rounded border border-[#2f0012]">
          <p className="text-xs text-gray-400">Tests Run</p>
          <p className="text-sm font-semibold text-blue-400">{task.testsRun || 0}</p>
        </div>
      </div>
      
      <div className="bg-[#1f1f1f]/30 p-3 rounded border border-[#2f0012] mb-3">
        <p className="text-xs text-gray-400 mb-1">🤖 Autonomous Capabilities</p>
        <ul className="text-xs text-gray-300 space-y-1">
          <li>✅ Continuous monitoring (24/7)</li>
          <li>✅ Self-correction based on results</li>
          <li>✅ Thought Signatures for continuity</li>
          <li>✅ Automatic change detection</li>
        </ul>
      </div>
      
      {marathonTaskId && (
        <button
          onClick={onStop}
          className="w-full bg-red-900/30 hover:bg-red-900/50 text-red-300 px-4 py-2 rounded border border-red-800/50 hover:border-red-700 transition-colors"
        >
          Stop Marathon Agent
        </button>
      )}
    </div>
  );
}
