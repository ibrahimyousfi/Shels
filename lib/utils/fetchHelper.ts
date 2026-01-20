/**
 * Fetch with timeout and better error handling
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}, timeout: number = 300000) {
  try {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(endpoint, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        return { success: false, message: errorData.message || `HTTP ${response.status}` };
      }
      
      const data = await response.json();
      return data;
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        return { success: false, message: `Request timeout after ${timeout/1000} seconds. The repository might be too large or the server is slow.` };
      }
      throw fetchError;
    }
  } catch (error: any) {
    return { success: false, message: error.message || 'Network error occurred. Please check your connection and try again.' };
  }
}
