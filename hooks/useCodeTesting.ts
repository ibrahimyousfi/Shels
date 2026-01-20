import { useState } from 'react';
import { apiFetch } from '@/lib/utils/fetchHelper';
import { logError, logInfo } from '@/lib/utils/logger';
import { performAnalysis } from './useAnalysis';
import { generateTests, runTests, generateFixes } from './useTesting';
import { startMarathonIfNeeded } from './useMarathon';
import { saveAnalysisSession, loadMarathonTaskId } from './useSession';
import type { SessionResults } from '@/lib/types';

export function useCodeTesting() {
  const [errorCallback, setErrorCallback] = useState<((error: { message: string; type?: 'error' | 'warning' | 'info' }) => void) | null>(null);
  const [repoUrl, setRepoUrl] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [testTypes, setTestTypes] = useState<('unit' | 'integration' | 'security' | 'performance')[]>(['unit', 'integration', 'security']);
  const [duration, setDuration] = useState<'one-time' | 'continuous'>('one-time');
  const [autoFix, setAutoFix] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<SessionResults | null>(null);
  const [progress, setProgress] = useState({ step: '', percentage: 0 });
  const [marathonTaskId, setMarathonTaskId] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const handleTestTypeChange = (type: 'unit' | 'integration' | 'security' | 'performance') => {
    setTestTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const handleQuotaError = () => {
    const message = 'API quota exceeded. The free tier allows 20 requests per day. Please wait or use a different API key.';
    errorCallback?.({ message, type: 'warning' });
    setIsAnalyzing(false);
  };

  const handleStartTesting = async () => {
    if (!repoUrl && files.length === 0) {
      errorCallback?.({ message: 'Please provide either a GitHub URL or upload files', type: 'warning' });
      return;
    }

    logInfo('Starting analysis', { repoUrl, filesCount: files.length });
    setIsAnalyzing(true);
    setResults(null);

    try {
      const analyzeData = await performAnalysis(repoUrl, files, (step, percentage) => {
        setProgress({ step, percentage });
      });
      
      setProgress({ step: 'Generating tests...', percentage: 50 });
      const testData = await generateTests(analyzeData, testTypes);
      
      setProgress({ step: 'Running tests...', percentage: 70 });
      const testResults = await runTests(testData);
      
      setProgress({ step: 'Generating fixes...', percentage: 85 });
      const fixes = await generateFixes(analyzeData, autoFix);
      
      setProgress({ step: 'Generating insights...', percentage: 90 });
      const [timeline, metrics] = await Promise.allSettled([
        generateRiskTimeline(analyzeData),
        generateCodeMetrics(analyzeData)
      ]);
      
      const marathonResult = await startMarathonIfNeeded(
        analyzeData,
        duration,
        repoUrl,
        autoFix,
        currentSessionId
      );
      
      if (marathonResult) {
        setMarathonTaskId(marathonResult.taskId);
      }

      const finalResults: SessionResults = {
        analysis: analyzeData.analysis,
        tests: testData.tests,
        testResults: testResults || undefined,
        fixes: fixes || [],
        marathonTask: marathonResult?.status,
        timeline: timeline.status === 'fulfilled' ? timeline.value : undefined,
        metrics: metrics.status === 'fulfilled' ? metrics.value : undefined,
        files: analyzeData.files,
        issueData: {}
      };

      setResults(finalResults);

      const sessionId = await saveAnalysisSession(repoUrl, files, finalResults, {
        testTypes,
        duration,
        autoFix,
        marathonTaskId: marathonResult?.taskId
      });
      
      setCurrentSessionId(sessionId);

      setProgress({ step: 'Complete!', percentage: 100 });
      
      // Wait a moment to show "Complete!" message, then reset
      setTimeout(() => {
        setIsAnalyzing(false);
        setProgress({ step: '', percentage: 0 });
      }, 1500);
    } catch (error: unknown) {
      logError('Analysis error', error);
      
      // Reset progress but keep error visible
      setProgress({ step: 'Error occurred', percentage: 0 });
      
      // Don't show error if it's QUOTA_EXCEEDED (already handled)
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage !== 'QUOTA_EXCEEDED') {
        handleError(error);
      }
      
      // Keep analyzing state false but show error
      setIsAnalyzing(false);
    } finally {
      // Only set to false if not already set (fallback)
      if (isAnalyzing) {
        setTimeout(() => {
          setIsAnalyzing(false);
        }, 100);
      }
    }
  };


  function handleError(error: any) {
    let errorMessage = error.message || 'An error occurred';
    
    // Skip if it's QUOTA_EXCEEDED (already handled)
    if (errorMessage === 'QUOTA_EXCEEDED') {
      return;
    }
    
    try {
      const errorObj = typeof errorMessage === 'string' ? JSON.parse(errorMessage) : errorMessage;
      if (errorObj.error?.code === 429 || errorObj.error?.status === 'RESOURCE_EXHAUSTED') {
        handleQuotaError();
        return;
      }
      if (errorObj.error?.message) errorMessage = errorObj.error.message;
    } catch {
      // If parsing fails, use original message
    }
    
    // Handle specific error types
    if (errorMessage.includes('quota') || errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      handleQuotaError();
    } else if (errorMessage.includes('timeout')) {
      errorCallback?.({ 
        message: `${errorMessage}. Try analyzing a smaller repository or specific files.`, 
        type: 'error' 
      });
    } else if (errorMessage.includes('rate limit') || errorMessage.includes('GitHub API')) {
      errorCallback?.({ 
        message: errorMessage, 
        type: 'warning' 
      });
    } else {
      errorCallback?.({ 
        message: errorMessage || 'An unexpected error occurred. Please try again.', 
        type: 'error' 
      });
    }
  }

  async function generateRiskTimeline(analyzeData: { analysis: { issues: any[] }; files: any[] }) {
    try {
      if (!analyzeData.analysis?.issues || analyzeData.analysis.issues.length === 0) {
        return null;
      }

      const data = await apiFetch('/api/risk-timeline', {
        method: 'POST',
        body: JSON.stringify({
          issues: analyzeData.analysis.issues,
          codebaseContext: analyzeData.files?.map((f: any) => f.content).join('\n\n') || ''
        })
      });
      
      if (data.success && data.timeline) {
        return data.timeline;
      }
      
      const errorMsg = data.message || 'Unknown error';
      if (errorMsg.includes('quota') || errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
        errorCallback?.({ 
          message: 'Risk Timeline generation skipped due to API quota limit', 
          type: 'warning' 
        });
      }
      return null;
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to generate risk timeline';
      if (!errorMsg.includes('quota') && !errorMsg.includes('429')) {
        errorCallback?.({ 
          message: `Risk Timeline: ${errorMsg}`, 
          type: 'warning' 
        });
      }
      return null;
    }
  }

  async function generateCodeMetrics(analyzeData: { files: any[]; analysis: { issues: any[] } }) {
    try {
      if (!analyzeData.files || analyzeData.files.length === 0) {
        return null;
      }

      const data = await apiFetch('/api/code-metrics', {
        method: 'POST',
        body: JSON.stringify({
          files: analyzeData.files || [],
          issues: analyzeData.analysis?.issues || []
        })
      });
      
      if (data.success && data.metrics) {
        return data.metrics;
      }
      
      const errorMsg = data.message || 'Unknown error';
      if (errorMsg.includes('quota') || errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
        errorCallback?.({ 
          message: 'Code Metrics generation skipped due to API quota limit', 
          type: 'warning' 
        });
      }
      return null;
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to calculate code metrics';
      if (!errorMsg.includes('quota') && !errorMsg.includes('429')) {
        errorCallback?.({ 
          message: `Code Metrics: ${errorMsg}`, 
          type: 'warning' 
        });
      }
      return null;
    }
  }

  const regenerateTimeline = async () => {
    if (!results?.analysis) {
      errorCallback?.({ message: 'No analysis data available', type: 'warning' });
      return;
    }
    
    try {
      const timeline = await generateRiskTimeline({
        analysis: results.analysis,
        files: results.files || []
      });
      
      if (timeline) {
        setResults((prev) => prev ? { ...prev, timeline } : null);
        
        // Save to session
        if (currentSessionId) {
          try {
            await fetch(`/api/sessions/${currentSessionId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                results: { ...results, timeline }
              })
            });
          } catch (error) {
            logError('Failed to save timeline to session', error);
          }
        }
        
        errorCallback?.({ message: 'Risk Timeline regenerated successfully', type: 'info' });
      }
    } catch (error: any) {
      errorCallback?.({ message: 'Failed to regenerate timeline', type: 'error' });
    }
  };

  const regenerateMetrics = async () => {
    if (!results?.files || results.files.length === 0) {
      errorCallback?.({ message: 'No files data available', type: 'warning' });
      return;
    }
    
    try {
      const metrics = await generateCodeMetrics({
        files: results.files || [],
        analysis: results.analysis || { issues: [] }
      });
      
      if (metrics) {
        setResults((prev) => prev ? { ...prev, metrics } : null);
        
        // Save to session
        if (currentSessionId) {
          try {
            await fetch(`/api/sessions/${currentSessionId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                results: { ...results, metrics }
              })
            });
          } catch (error) {
            logError('Failed to save metrics to session', error);
          }
        }
        
        errorCallback?.({ message: 'Code Metrics regenerated successfully', type: 'info' });
      }
    } catch (error: any) {
      errorCallback?.({ message: 'Failed to regenerate metrics', type: 'error' });
    }
  };

  const loadSession = async (session: { results: SessionResults; id: string; repoUrl?: string; config: any; name: string }) => {
    setResults(session.results);
    setCurrentSessionId(session.id);
    setRepoUrl(session.repoUrl || '');
    setTestTypes(session.config.testTypes || ['unit', 'integration', 'security']);
    setDuration(session.config.duration || 'one-time');
    setAutoFix(session.config.autoFix ?? true);
    
    const marathonTaskId = await loadMarathonTaskId(session.id);
    if (marathonTaskId) {
      setMarathonTaskId(marathonTaskId);
    }
    
    errorCallback?.({ message: `Session "${session.name}" loaded successfully`, type: 'info' });
  };

  const resetSession = () => {
    setRepoUrl('');
    setFiles([]);
    setTestTypes(['unit', 'integration', 'security']);
    setDuration('one-time');
    setAutoFix(false);
    setResults(null);
    setCurrentSessionId(null);
    setMarathonTaskId(null);
    setProgress({ step: '', percentage: 0 });
  };

  return {
    repoUrl, files, testTypes, duration, autoFix, isAnalyzing, results, progress, marathonTaskId, currentSessionId,
    setRepoUrl, setFiles, handleTestTypeChange, setDuration, setAutoFix, handleStartTesting,
    setMarathonTaskId, setErrorCallback, regenerateTimeline, regenerateMetrics, loadSession, resetSession
  };
}
