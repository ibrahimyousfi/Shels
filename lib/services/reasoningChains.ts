import { generateContentWithFallback } from '../utils/aiHelper';
import { CodeFile, CodeIssue } from './codeAnalyzer';

export interface ReasoningStep {
  step: number;
  thought: string;
  analysis: string;
  conclusion: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface ReasoningChain {
  issue: CodeIssue;
  steps: ReasoningStep[];
  finalDecision: string;
  reasoningPath: string;
}

/**
 * Generate reasoning chain for an issue
 * Shows step-by-step how the AI thinks about the problem
 */
export async function generateReasoningChain(
  issue: CodeIssue,
  fileContent: string,
  codebaseContext?: string
): Promise<ReasoningChain> {
  const prompt = `You are an expert code analyzer. Analyze this issue step-by-step, showing your reasoning process.

Issue:
- Type: ${issue.type}
- Severity: ${issue.severity}
- File: ${issue.file}
- Description: ${issue.description}
- Suggestion: ${issue.suggestion || 'None'}

File Code:
${fileContent}

${codebaseContext ? `Full Codebase Context:\n${codebaseContext}` : ''}

Analyze this issue using a step-by-step reasoning chain. For each step, show:

1. **Your Thought**: What you're thinking about
2. **Analysis**: What you're analyzing
3. **Conclusion**: What you conclude from this step
4. **Confidence**: How confident you are (high/medium/low)

Provide 3-5 reasoning steps that lead to understanding the issue and how to fix it.

Return ONLY valid JSON:
{
  "steps": [
    {
      "step": 1,
      "thought": "First, I need to understand...",
      "analysis": "Looking at the code...",
      "conclusion": "I can see that...",
      "confidence": "high"
    },
    {
      "step": 2,
      "thought": "Next, I should check...",
      "analysis": "Examining the context...",
      "conclusion": "This reveals...",
      "confidence": "medium"
    }
  ],
  "finalDecision": "Based on my analysis, this issue requires...",
  "reasoningPath": "Step 1 → Step 2 → Step 3 → Final Decision"
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
      steps: data.steps || [],
      finalDecision: data.finalDecision || '',
      reasoningPath: data.reasoningPath || ''
    };
  } catch (error) {
    console.error('Error generating reasoning chain:', error);
    throw error;
  }
}

/**
 * Generate reasoning chains for multiple issues
 */
export async function generateReasoningChains(
  issues: CodeIssue[],
  files: Array<{ path: string; content: string }>
): Promise<ReasoningChain[]> {
  const chains: ReasoningChain[] = [];

  for (const issue of issues) {
    const file = files.find(f => f.path === issue.file || f.path.endsWith(issue.file));
    if (file && file.content) {
      try {
        const chain = await generateReasoningChain(
          issue,
          file.content,
          files.map(f => f.content).join('\n\n')
        );
        chains.push(chain);
      } catch (error) {
        console.error(`Error generating reasoning chain for ${issue.file}:`, error);
        // Add a basic chain even if API fails
        chains.push({
          issue,
          steps: [{
            step: 1,
            thought: `Analyzing ${issue.type} issue`,
            analysis: issue.description,
            conclusion: issue.suggestion || 'Requires manual review',
            confidence: 'medium'
          }],
          finalDecision: issue.suggestion || 'Manual review recommended',
          reasoningPath: 'Basic analysis → Review needed'
        });
      }
    }
  }

  return chains;
}
