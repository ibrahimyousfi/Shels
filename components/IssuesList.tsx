'use client';

import { useState } from 'react';
import IssueItem from './IssueItem';
import FixExplanationModal from './FixExplanationModal';
import ReasoningChainModal from './ReasoningChainModal';

interface IssuesListProps {
  results: any;
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
) {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (data.success) {
      onSuccess(data);
    } else {
      const errorMsg = parseErrorMessage(data.message);
      onError?.(`Request failed: ${errorMsg}`, isQuotaError(errorMsg) ? 'warning' : 'error');
    }
  } catch (error: any) {
    const errorMsg = parseErrorMessage(error.message);
    onError?.(`Error: ${errorMsg}`, isQuotaError(errorMsg) ? 'warning' : 'error');
  }
}

export default function IssuesList({ results, onError }: IssuesListProps) {
  const [fixExplanation, setFixExplanation] = useState<any>(null);
  const [reasoningChain, setReasoningChain] = useState<any>(null);

  const getFiles = () => {
    const files = results.files || [];
    if (files.length === 0) {
      onError?.('No files available. Please try again after analysis completes.', 'warning');
      return null;
    }
    return files;
  };

  const handleExplainFix = async (issue: any): Promise<void> => {
    const files = getFiles();
    if (!files) return;

    await handleApiCall(
      '/api/explain-fix',
      { issues: [issue], files },
      (data) => {
        if (data.explanations?.length > 0) {
          setFixExplanation(data.explanations[0]);
        }
      },
      onError
    );
  };

  const handleSmartFix = async (issue: any): Promise<void> => {
    const files = getFiles();
    if (!files) return;

    const fileContent = files.find((f: any) => f.path === issue.file)?.content || '';
    if (!fileContent) {
      onError?.(`File content not found for: ${issue.file}`, 'warning');
      return;
    }

    await handleApiCall(
      '/api/context-aware-fix',
      {
        issue,
        fileContent,
        codebaseContext: files.map((f: any) => f.content).join('\n\n')
      },
      () => {
        onError?.('Context-Aware Fix generated successfully. Check the issue details for more information.', 'info');
      },
      onError
    );
  };

  const handleReasoningChain = async (issue: any): Promise<void> => {
    const files = getFiles();
    if (!files) return;

    const fileContent = files.find((f: any) => f.path === issue.file)?.content || '';
    await handleApiCall(
      '/api/reasoning-chain',
      {
        issue,
        fileContent,
        codebaseContext: files.map((f: any) => f.content).join('\n\n')
      },
      (data) => {
        if (data.chain) {
          setReasoningChain(data.chain);
        }
      },
      onError
    );
  };

  return (
    <>
      <div className="mt-4">
        <h3 className="text-xl font-semibold mb-2 text-white">Issues</h3>
        <div className="space-y-2">
          {results.analysis.issues.map((issue: any, index: number) => (
            <IssueItem
              key={index}
              issue={issue}
              onExplainFix={() => handleExplainFix(issue)}
              onSmartFix={() => handleSmartFix(issue)}
              onReasoningChain={() => handleReasoningChain(issue)}
            />
          ))}
        </div>
      </div>

      {fixExplanation && (
        <FixExplanationModal
          explanation={fixExplanation}
          onClose={() => setFixExplanation(null)}
        />
      )}

      {reasoningChain && (
        <ReasoningChainModal
          chain={reasoningChain}
          onClose={() => setReasoningChain(null)}
        />
      )}
    </>
  );
}
