import { apiFetch } from '@/lib/utils/fetchHelper';
import { logError } from '@/lib/utils/logger';
import type { CodeAnalysis, CodeFile } from '@/lib/types';

export interface AnalysisData {
  analysis: CodeAnalysis;
  files: CodeFile[];
}

export async function performAnalysis(
  repoUrl: string,
  files: File[],
  onProgress?: (step: string, percentage: number) => void
): Promise<AnalysisData> {
  onProgress?.('Reading repository...', 10);
  
  let filesData: CodeFile[] = [];
  
  const formData = new FormData();
  
  if (repoUrl) {
    formData.append('repoUrl', repoUrl);
  } else if (files.length > 0) {
    files.forEach(file => formData.append('files', file));
  } else {
    throw new Error('No repository URL or files provided');
  }
  
  onProgress?.('Analyzing codebase...', 30);
  
  const response = await fetch('/api/analyze', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
    throw new Error(errorData.message || 'Analysis failed');
  }
  
  const analysisData = await response.json();
  
  if (!analysisData.success || !analysisData.analysis) {
    throw new Error(analysisData.message || 'Analysis failed');
  }
  
  return {
    analysis: analysisData.analysis,
    files: analysisData.files || []
  };
}
