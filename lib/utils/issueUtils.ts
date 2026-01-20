import type { CodeIssue } from '@/lib/types';

/**
 * Generate a unique key for an issue
 */
export function getIssueKey(issue: CodeIssue): string {
  return `${issue.file}-${issue.type}-${issue.severity}-${issue.description.substring(0, 50)}`;
}

/**
 * Parse error message from various formats
 */
export function parseErrorMessage(message: unknown): string {
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

/**
 * Check if error is a quota error
 */
export function isQuotaError(errorMsg: string): boolean {
  return errorMsg.includes('quota') || errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED');
}
