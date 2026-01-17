import { generateContentWithFallback } from '../utils/aiHelper';
import { CodeIssue } from './codeAnalyzer';

export interface ContextAwareFix {
  issue: CodeIssue;
  questions: string[];
  businessLogicConsiderations: string[];
  fixedCode: string;
  explanation: string;
  confidence: 'high' | 'medium' | 'low';
  requiresConfirmation: boolean;
}

/**
 * Generate context-aware fix that respects business logic
 */
export async function generateContextAwareFix(
  issue: CodeIssue,
  fileContent: string,
  codebaseContext: string
): Promise<ContextAwareFix> {
  const prompt = `You are an expert code reviewer. Generate a fix for this issue that respects business logic and context.

Issue:
- Type: ${issue.type}
- Severity: ${issue.severity}
- File: ${issue.file}
- Description: ${issue.description}

File Code:
${fileContent}

Full Codebase Context:
${codebaseContext}

Before fixing, analyze:

1. **Business Logic Questions:**
   - Ask critical questions about the intended behavior
   - Example: "Is pixel_id allowed to be dynamic?" or "Should this parameter be user-controlled?"
   - Identify assumptions that need clarification

2. **Business Logic Considerations:**
   - What business rules might be affected?
   - Are there dependencies on this code?
   - What is the intended behavior vs current behavior?

3. **Generate Fix:**
   - Provide fixed code that respects business logic
   - Explain why this fix is safe
   - Note if confirmation is needed

Return ONLY valid JSON:
{
  "questions": [
    "Is pixel_id allowed to be dynamic?",
    "Should this be user-controlled?"
  ],
  "businessLogicConsiderations": [
    "This fix might affect tracking accuracy",
    "Need to verify if dynamic IDs are required"
  ],
  "fixedCode": "complete fixed code here",
  "explanation": "why this fix is safe and respects business logic",
  "confidence": "high",
  "requiresConfirmation": true
}`;

  try {
    const result = await generateContentWithFallback(prompt);
    const text = result.text || '';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const data = JSON.parse(jsonMatch[0]);

    return {
      issue,
      questions: data.questions || [],
      businessLogicConsiderations: data.businessLogicConsiderations || [],
      fixedCode: data.fixedCode || '',
      explanation: data.explanation || '',
      confidence: data.confidence || 'medium',
      requiresConfirmation: data.requiresConfirmation || false
    };
  } catch (error) {
    console.error('Error generating context-aware fix:', error);
    throw error;
  }
}
