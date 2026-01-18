import { useState } from 'react';
import { apiFetch } from '@/lib/utils/fetchHelper';
import { saveSession } from '@/lib/services/sessionStorage';

export function useCodeTesting() {
  const [errorCallback, setErrorCallback] = useState<((error: { message: string; type?: 'error' | 'warning' | 'info' }) => void) | null>(null);
  const [repoUrl, setRepoUrl] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [testTypes, setTestTypes] = useState<('unit' | 'integration' | 'security' | 'performance')[]>(['unit', 'integration', 'security']);
  const [duration, setDuration] = useState<'one-time' | 'continuous'>('one-time');
  const [autoFix, setAutoFix] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
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

    setIsAnalyzing(true);
    setResults(null);
    setProgress({ step: 'Reading repository...', percentage: 10 });

    try {
      const analyzeData = await performAnalysis();
      const testData = await generateTests(analyzeData);
      const testResults = await runTests(testData);
      const fixes = await generateFixes(analyzeData);
      
      // Generate insights with better error handling
      setProgress({ step: 'Generating insights...', percentage: 90 });
      
      // Generate timeline and metrics in parallel (but don't fail if one fails)
      const [timeline, metrics] = await Promise.allSettled([
        generateRiskTimeline(analyzeData),
        generateCodeMetrics(analyzeData)
      ]);
      
      const timelineResult = timeline.status === 'fulfilled' ? timeline.value : null;
      const metricsResult = metrics.status === 'fulfilled' ? metrics.value : null;
      
      const marathonTask = await startMarathonIfNeeded(analyzeData);

      const finalResults: any = {
        analysis: analyzeData.analysis,
        tests: testData.tests,
        testResults,
        fixes,
        marathonTask,
        timeline: timelineResult,
        metrics: metricsResult,
        files: analyzeData.files || [],
        issueData: {}
      };

      setResults(finalResults);

      // Save session automatically
      try {
        const sessionName = repoUrl 
          ? `Analysis: ${repoUrl.split('/').pop() || 'Repository'}`
          : `Analysis: ${files.length} files`;
        
        const savedSession = await saveSession({
          name: sessionName,
          repoUrl: repoUrl || undefined,
          results: finalResults,
          config: {
            testTypes,
            duration,
            autoFix
          }
        });
        
        setCurrentSessionId(savedSession.id);
      } catch (error) {
        console.error('Failed to save session:', error);
      }

      setProgress({ step: 'Complete!', percentage: 100 });
    } catch (error: any) {
      // Don't show error if it's QUOTA_EXCEEDED (already handled)
      if (error.message !== 'QUOTA_EXCEEDED') {
        handleError(error);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  async function performAnalysis() {
    setProgress({ step: 'Analyzing codebase...', percentage: 30 });
    const formData = new FormData();
    if (repoUrl) formData.append('repoUrl', repoUrl);
    else files.forEach(file => formData.append('files', file));

    const response = await fetch('/api/analyze', { method: 'POST', body: formData });
    const data = await response.json();
    
    if (!data.success) {
      let errorObj;
      try {
        errorObj = typeof data.message === 'string' ? JSON.parse(data.message) : data.message;
      } catch {
        errorObj = { error: { code: 500, status: 'UNKNOWN' } };
      }
      
      if (errorObj.error?.code === 429 || errorObj.error?.status === 'RESOURCE_EXHAUSTED') {
        handleQuotaError();
        throw new Error('QUOTA_EXCEEDED');
      }
      throw new Error(data.message || 'Analysis failed');
    }
    return data;
  }

  async function generateTests(analyzeData: any) {
    setProgress({ step: 'Generating tests...', percentage: 50 });
    const data = await apiFetch('/api/generate-tests', {
      method: 'POST',
      body: JSON.stringify({ repoUrl: repoUrl || null, files: analyzeData.files || [], testTypes })
    });
    if (!data.success) throw new Error(data.message || 'Failed to generate tests');
    return data;
  }

  async function runTests(testData: any) {
    setProgress({ step: 'Running tests...', percentage: 70 });
    const allTests = [
      ...(testData.tests?.unitTests || []),
      ...(testData.tests?.integrationTests || []),
      ...(testData.tests?.securityTests || []),
      ...(testData.tests?.performanceTests || [])
    ];
    if (allTests.length === 0) return null;

    const data = await apiFetch('/api/run-tests', {
      method: 'POST',
      body: JSON.stringify({ tests: allTests })
    });
    return data.success ? data.results : null;
  }

  async function generateFixes(analyzeData: any) {
    setProgress({ step: 'Generating fixes...', percentage: 85 });
    if (!autoFix || !analyzeData.analysis?.issues || analyzeData.analysis.issues.length === 0) return null;

    const filesForFix = (analyzeData.files || []).filter((file: any) => 
      analyzeData.analysis.issues.some((issue: any) => issue.file === file.path)
    );
    if (filesForFix.length === 0) return null;

    const data = await apiFetch('/api/fix', {
      method: 'POST',
      body: JSON.stringify({ files: filesForFix, issues: analyzeData.analysis.issues })
    });
    return data.success ? data.fixes : null;
  }

  async function startMarathonIfNeeded(analyzeData: any) {
    if (duration !== 'continuous') return null;
    const data = await apiFetch('/api/marathon', {
      method: 'POST',
      body: JSON.stringify({
        action: 'start',
        config: { repoUrl: repoUrl || 'uploaded', testInterval: 60, autoFix, notifyOnIssue: true }
      })
    });
    if (data.success) {
      setMarathonTaskId(data.taskId);
      return data.status;
    }
    return null;
  }

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
    
    if (errorMessage.includes('quota') || errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      handleQuotaError();
    } else {
      errorCallback?.({ message: errorMessage, type: 'error' });
    }
  }

  async function generateRiskTimeline(analyzeData: any) {
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

  async function generateCodeMetrics(analyzeData: any) {
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
        setResults((prev: any) => ({ ...prev, timeline }));
        
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
            console.error('Failed to save timeline to session:', error);
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
        setResults((prev: any) => ({ ...prev, metrics }));
        
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
            console.error('Failed to save metrics to session:', error);
          }
        }
        
        errorCallback?.({ message: 'Code Metrics regenerated successfully', type: 'info' });
      }
    } catch (error: any) {
      errorCallback?.({ message: 'Failed to regenerate metrics', type: 'error' });
    }
  };

  const loadSession = (session: any) => {
    setResults(session.results);
    setCurrentSessionId(session.id);
    setRepoUrl(session.repoUrl || '');
    setTestTypes(session.config.testTypes || ['unit', 'integration', 'security']);
    setDuration(session.config.duration || 'one-time');
    setAutoFix(session.config.autoFix ?? true);
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
