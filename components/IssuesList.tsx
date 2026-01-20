'use client';

import { useEffect } from 'react';
import IssueItem from './IssueItem';
import type { SessionResults, CodeIssue, IssueData, ExplainFixData, SmartFixData, ReasoningChainData } from '@/lib/types';
import { logError } from '@/lib/utils/logger';
import { getIssueKey } from '@/lib/utils/issueUtils';
import { handleApiCall } from '@/lib/utils/apiCallHelper';

export default function IssuesList({ results, sessionId, onError }: IssuesListProps) {
  // Load issueData directly from results (no local state caching)
  const issueData = results.issueData || {};

  // Initialize issueData in results if not exists
  useEffect(() => {
    if (!results.issueData) {
      results.issueData = {};
    }
  }, [results]);

  const getFiles = () => {
    const files = results.files || [];
    if (files.length === 0) {
      onError?.('No files available. Please try again after analysis completes.', 'warning');
      return null;
    }
    return files;
  };


  const saveIssueDataToSession = async (issueKey: string, data: Partial<IssueData>): Promise<void> => {
    if (!sessionId) return;
    
    try {
      const updatedIssueData = {
        ...issueData,
        [issueKey]: {
          ...issueData[issueKey],
          ...data
        }
      };
      
      // Update results directly (no local state)
      results.issueData = updatedIssueData;
      
      // Save to session file
      await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueData: updatedIssueData })
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save issue data to session';
      logError('Failed to save issue data', error, { issueKey, sessionId: sessionId || 'unknown' });
      onError?.(errorMessage, 'error');
    }
  };

  const handleExplainFix = async (issue: CodeIssue): Promise<ExplainFixData | null> => {
    const issueKey = getIssueKey(issue);
    
    // Check if already in session
    if (issueData[issueKey]?.explainFix) {
      return issueData[issueKey].explainFix;
    }

    const files = getFiles();
    if (!files) return null;

    return new Promise(async (resolve, reject) => {
      const errorMsg = await handleApiCall({
        endpoint: '/api/explain-fix',
        body: { issues: [issue], files },
        onSuccess: async (data: { explanations?: ExplainFixData[] }) => {
          if (data.explanations && data.explanations.length > 0) {
            const explanation = data.explanations[0];
            await saveIssueDataToSession(issueKey, { explainFix: explanation });
            resolve(explanation);
          } else {
            reject(new Error('No explanation generated'));
          }
        },
        onError: (msg) => {
          onError?.(msg);
        },
        sessionId
      });
      if (errorMsg) {
        logError('ExplainFix failed', new Error(errorMsg), { 
          issueFile: issue.file, 
          issueLine: issue.line,
          sessionId 
        });
        reject(new Error(errorMsg));
      }
    });
  };

  const handleSmartFix = async (issue: CodeIssue): Promise<SmartFixData | null> => {
    const issueKey = getIssueKey(issue);
    
    // Check if already in session
    if (issueData[issueKey]?.smartFix) {
      return issueData[issueKey].smartFix;
    }

    const files = getFiles();
    if (!files) return null;

    const fileContent = files.find((f: any) => f.path === issue.file)?.content || '';
    if (!fileContent) {
      onError?.(`File content not found for: ${issue.file}`, 'warning');
      return null;
    }

    return new Promise(async (resolve, reject) => {
      const errorMsg = await handleApiCall({
        endpoint: '/api/context-aware-fix',
        body: {
          issue,
          fileContent,
          codebaseContext: files.map((f) => f.content).join('\n\n')
        },
        onSuccess: async (data: any) => {
          // Convert API response to SmartFixData format
          const fix = data.fix || data;
          const smartFixData: SmartFixData = {
            fixedCode: fix.fixedCode || '',
            explanation: fix.explanation || '',
            businessLogicConsiderations: Array.isArray(fix.businessLogicConsiderations) 
              ? fix.businessLogicConsiderations.join('\n\n')
              : fix.businessLogicConsiderations || ''
          };
          
          await saveIssueDataToSession(issueKey, { smartFix: smartFixData });
          resolve(smartFixData);
        },
        onError: (msg) => {
          onError?.(msg);
        },
        sessionId
      });
      if (errorMsg) {
        logError('SmartFix failed', new Error(errorMsg), { 
          issueFile: issue.file, 
          issueLine: issue.line,
          sessionId 
        });
        reject(new Error(errorMsg));
      }
    });
  };

  const handleReasoningChain = async (issue: CodeIssue): Promise<ReasoningChainData | null> => {
    const issueKey = getIssueKey(issue);
    
    // Check if already in session
    if (issueData[issueKey]?.reasoningChain) {
      return issueData[issueKey].reasoningChain;
    }

    const files = getFiles();
    if (!files) return null;

    const fileContent = files.find((f: any) => f.path === issue.file)?.content || '';
    return new Promise(async (resolve, reject) => {
      const errorMsg = await handleApiCall({
        endpoint: '/api/reasoning-chain',
        body: {
          issue,
          fileContent,
          codebaseContext: files.map((f) => f.content).join('\n\n')
        },
        onSuccess: async (data: { chain?: ReasoningChainData }) => {
          if (data.chain) {
            await saveIssueDataToSession(issueKey, { reasoningChain: data.chain });
            resolve(data.chain);
          } else {
            reject(new Error('No reasoning chain generated'));
          }
        },
        onError: (msg) => {
          onError?.(msg);
        },
        sessionId
      });
      if (errorMsg) {
        logError('ReasoningChain failed', new Error(errorMsg), { 
          issueFile: issue.file, 
          issueLine: issue.line,
          sessionId 
        });
        reject(new Error(errorMsg));
      }
    });
  };

  return (
    <div className="mt-4">
      <h3 className="text-xl font-semibold mb-2 text-white">Issues</h3>
      <div className="space-y-2">
        {results.analysis.issues.map((issue: CodeIssue, index: number) => {
          const issueKey = getIssueKey(issue);
          const cached = issueData[issueKey] || {};
          
          // Add businessImpact from results.businessImpactData if available
          const businessImpactKey = `${issue.file}-${issue.type}-${issue.severity}-${issue.description.substring(0, 50)}`;
          const businessImpact = results.businessImpactData?.[businessImpactKey];
          
          return (
            <IssueItem
              key={index}
              issue={issue}
              cachedData={{ ...cached, businessImpact }}
              sessionId={sessionId}
              onExplainFix={() => handleExplainFix(issue)}
              onSmartFix={() => handleSmartFix(issue)}
              onReasoningChain={() => handleReasoningChain(issue)}
            />
          );
        })}
      </div>
    </div>
  );
}
