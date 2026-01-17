import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

/**
 * Generate content with fallback to multiple models
 */
export async function generateContentWithFallback(prompt: string) {
  const modelsToTry = [
    'gemini-3-flash-preview',
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-pro'
  ];
  
  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });
      return response;
    } catch (error: any) {
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        continue;
      }
      throw error;
    }
  }
  
  throw new Error('No available models found. Please check your API key and region.');
}
