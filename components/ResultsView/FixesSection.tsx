'use client';

import type { SessionResults } from '@/lib/types';

interface FixesSectionProps {
  results: SessionResults;
}

export default function FixesSection({ results }: FixesSectionProps) {
  return (
    <div className="mb-4">
      <h3 className="text-xl font-semibold mb-2 text-white">Fixes Generated</h3>
      <p className="text-white">Total Fixes: {results.fixes.length}</p>
    </div>
  );
}
