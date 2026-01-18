'use client';

interface FixesSectionProps {
  results: any;
}

export default function FixesSection({ results }: FixesSectionProps) {
  return (
    <div className="mb-4">
      <h3 className="text-xl font-semibold mb-2 text-white">Fixes Generated</h3>
      <p className="text-white">Total Fixes: {results.fixes.length}</p>
    </div>
  );
}
