'use client';

interface SummarySectionProps {
  results: any;
}

export default function SummarySection({ results }: SummarySectionProps) {
  const totalRepoFiles = results.analysis.totalRepoFiles || results.analysis.totalFiles;
  const analyzedFiles = results.analysis.totalFiles;
  const ignoredFiles = totalRepoFiles > analyzedFiles ? totalRepoFiles - analyzedFiles : 0;

  return (
    <div className="mb-4">
      <h3 className="text-xl font-semibold mb-2 text-white">Analysis Summary</h3>
      
      <div className="bg-[#1f1f1f] p-4 rounded-lg mb-3 border border-[#2f0012]">
        <p className="text-sm text-gray-400 mb-2">📊 Repository Overview</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Total files in repo:</span>
            <span className="font-semibold text-white ml-2">{totalRepoFiles || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-500">Code files analyzed:</span>
            <span className="font-semibold text-gray-300 ml-2">{analyzedFiles}</span>
          </div>
          {ignoredFiles > 0 && (
            <div className="col-span-2">
              <span className="text-gray-500">Config/assets ignored:</span>
              <span className="font-semibold text-gray-500 ml-2">{ignoredFiles}</span>
              <span className="text-xs text-gray-500 ml-2">(HTML, CSS, images, config files)</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-white">
          <span className="font-semibold">Analyzed Code Files:</span> {analyzedFiles}
          <span className="text-sm text-gray-500 ml-2">(JavaScript/TypeScript with executable logic)</span>
        </p>
        <p className="text-white">
          <span className="font-semibold">Total Lines Analyzed:</span> {results.analysis.totalLines}
        </p>
        <p className="text-white">
          <span className="font-semibold">Issues Found:</span> {results.analysis.issues.length}
        </p>
      </div>

      {ignoredFiles > 0 && (
        <div className="mt-3 bg-[#1f1f1f] p-3 rounded text-sm border border-[#2f0012]">
          <p className="text-gray-400">
            ℹ️ <strong>Why only {analyzedFiles} files?</strong> The agent intentionally focuses on executable code 
            (JS/TS) where real security and runtime risks exist, instead of inflating metrics by counting static assets.
          </p>
        </div>
      )}
    </div>
  );
}
