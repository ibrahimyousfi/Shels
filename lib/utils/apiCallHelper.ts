import { logError } from './logger';
import { parseErrorMessage, isQuotaError } from './issueUtils';

export interface ApiCallOptions {
  endpoint: string;
  body: any;
  onSuccess: (data: any) => void;
  onError?: (message: string, type?: 'error' | 'warning' | 'info') => void;
  sessionId?: string;
}

/**
 * Helper function to make API calls with consistent error handling
 */
export async function handleApiCall(options: ApiCallOptions): Promise<string | null> {
  const { endpoint, body, onSuccess, onError, sessionId } = options;
  
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
    }
    
    const errorMsg = parseErrorMessage(data.message);
    onError?.(`Request failed: ${errorMsg}`, isQuotaError(errorMsg) ? 'warning' : 'error');
    return errorMsg;
  } catch (error: unknown) {
    const errorMsg = parseErrorMessage(error instanceof Error ? error.message : String(error));
    logError('API call failed', error, { endpoint, sessionId: sessionId || 'unknown' });
    onError?.(`Error: ${errorMsg}`, isQuotaError(errorMsg) ? 'warning' : 'error');
    return errorMsg;
  }
}
