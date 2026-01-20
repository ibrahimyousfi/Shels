import { GoogleGenAI } from '@google/genai';
import { logError } from './logger';

const ai = new GoogleGenAI({});

/**
 * Generate content using Gemini 3 only
 */
export async function generateContentWithFallback(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response;
  } catch (error: any) {
    logError('Gemini 3 API call failed', error, { promptLength: prompt.length });
    throw error;
  }
}
