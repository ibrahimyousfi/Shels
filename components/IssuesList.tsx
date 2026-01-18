'use client';

import { useEffect } from 'react';
import IssueItem from './IssueItem';

interface IssuesListProps {
  results: any;
  sessionId?: string;
  onError?: (message: string, type?: 'error' | 'warning' | 'info') => void;
}

function parseErrorMessage(message: any): string {
  if (!message) return 'Unknown error occurred';
  
  try {
    const errorObj = typeof message === 'string' ? JSON.parse(message) : message;
    if (errorObj.error?.code === 429 || errorObj.error?.status === 'RESOURCE_EXHAUSTED') {
      return 'API quota exceeded. The free tier allows 20 requests per day. Please wait or use a different API key.';
    }
    return errorObj.error?.message || (typeof message === 'string' ? message : JSON.stringify(message));
  } catch {
    const msg = typeof message === 'string' ? message : 'Unknown error occurred';
    if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
      return 'API quota exceeded. The free tier allows 20 requests per day. Please wait or use a different API key.';
    }
    return msg;
  }
}

function isQuotaError(errorMsg: string): boolean {
  return errorMsg.includes('quota') || errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED');
}

async function handleApiCall(
  endpoint: string,
  body: any,
  onSuccess: (data: any) => void,
  onError?: (message: string, type?: 'error' | 'warning' | 'info') => void
): Promise<string | null> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (data.success) {
      onSuccess(data);
      return null;
    } else {
      const errorMsg = parseErrorMessage(data.message);
      onError?.(`Request failed: ${errorMsg}`, isQuotaError(errorMsg) ? 'warning' : 'error');
      return errorMsg;
    }
  } catch (error: any) {
    const errorMsg = parseErrorMessage(error.message);
    onError?.(`Error: ${errorMsg}`, isQuotaError(errorMsg) ? 'warning' : 'error');
    return errorMsg;
  }
}

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

  const getIssueKey = (issue: any) => {
    return `${issue.file}-${issue.type}-${issue.severity}-${issue.description.substring(0, 50)}`;
  };

  const saveIssueDataToSession = async (issueKey: string, data: any) => {
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
    } catch (error) {
      console.error('Failed to save issue data to session:', error);
    }
  };

  const handleExplainFix = async (issue: any): Promise<any> => {
    const issueKey = getIssueKey(issue);
    
    // Check if already in session
    if (issueData[issueKey]?.explainFix) {
      return issueData[issueKey].explainFix;
    }

    const files = getFiles();
    if (!files) return null;

    return new Promise(async (resolve, reject) => {
      const errorMsg = await handleApiCall(
        '/api/explain-fix',
        { issues: [issue], files },
        async (data) => {
          if (data.explanations?.length > 0) {
            const explanation = data.explanations[0];
            await saveIssueDataToSession(issueKey, { explainFix: explanation });
            resolve(explanation);
          } else {
            reject(new Error('No explanation generated'));
          }
        },
        (msg) => {
          onError?.(msg);
        }
      );
      if (errorMsg) {
        reject(new Error(errorMsg));
      }
    });
  };

  const handleSmartFix = async (issue: any): Promise<any> => {
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
      const errorMsg = await handleApiCall(
        '/api/context-aware-fix',
        {
          issue,
          fileContent,
          codebaseContext: files.map((f: any) => f.content).join('\n\n')
        },
        async (data) => {
          await saveIssueDataToSession(issueKey, { smartFix: data });
          resolve(data);
        },
        (msg) => {
          onError?.(msg);
        }
      );
      if (errorMsg) {
        reject(new Error(errorMsg));
      }
    });
  };

  const handleReasoningChain = async (issue: any): Promise<any> => {
    const issueKey = getIssueKey(issue);
    
    // Check if already in session
    if (issueData[issueKey]?.reasoningChain) {
      return issueData[issueKey].reasoningChain;
    }

    const files = getFiles();
    if (!files) return null;

    const fileContent = files.find((f: any) => f.path === issue.file)?.content || '';
    return new Promise(async (resolve, reject) => {
      const errorMsg = await handleApiCall(
        '/api/reasoning-chain',
        {
          issue,
          fileContent,
          codebaseContext: files.map((f: any) => f.content).join('\n\n')
        },
        async (data) => {
          if (data.chain) {
            await saveIssueDataToSession(issueKey, { reasoningChain: data.chain });
            resolve(data.chain);
          } else {
            reject(new Error('No reasoning chain generated'));
          }
        },
        (msg) => {
          onError?.(msg);
        }
      );
      if (errorMsg) {
        reject(new Error(errorMsg));
      }
    });
  };

  return (
    <div className="mt-4">
      <h3 className="text-xl font-semibold mb-2 text-white">Issues</h3>
      <div className="space-y-2">
        {results.analysis.issues.map((issue: any, index: number) => {
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
