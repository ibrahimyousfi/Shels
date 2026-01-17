export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
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
  } catch (error: any) {
    return { success: false, message: error.message || 'Network error occurred' };
  }
}
