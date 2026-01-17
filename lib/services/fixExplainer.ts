import { generateContentWithFallback } from '../utils/aiHelper';
import { CodeIssue } from './codeAnalyzer';

export interface FixExplanation {
  issue: CodeIssue;
  whyDangerous: string;
  howToFixManually: string;
  impact: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

/**
 * Explain how to fix an issue
 */
export async function explainFix(
  issue: CodeIssue,
  fileContent: string,
  codebaseContext?: string
): Promise<FixExplanation> {
  if (!fileContent) {
    throw new Error('File content is required to explain fix');
  }
  const prompt = `You are an expert code reviewer. Explain this security/code issue in detail.

Issue:
- Type: ${issue.type}
- Severity: ${issue.severity}
- File: ${issue.file}
- Line: ${issue.line || 'N/A'}
- Description: ${issue.description}
- Suggestion: ${issue.suggestion || 'None'}

Code Context:
${fileContent}

${codebaseContext ? `Full Codebase Context:\n${codebaseContext}` : ''}

Provide a comprehensive explanation with:

1. **Why is this dangerous?**
   - Explain the security risk or bug impact
   - What could happen if not fixed
   - Real-world attack scenarios (if security issue)

2. **How to fix manually:**
   - Step-by-step instructions
   - Code examples
   - Best practices to follow

3. **Impact:**
   - What will be affected if we fix this
   - Breaking changes (if any)
   - Performance implications

4. **Priority Assessment:**
   - Critical: Fix immediately (security/data loss risk)
   - High: Fix soon (major functionality issue)
   - Medium: Fix when possible (minor issues)
   - Low: Nice to have (code quality)

5. **Estimated Time:**
   - How long it takes to fix (e.g., "5 minutes", "1 hour", "2-3 hours")

6. **Difficulty:**
   - Easy: Simple fix, low risk
   - Medium: Requires some understanding
   - Hard: Complex fix, needs careful testing

Return ONLY valid JSON:
{
  "whyDangerous": "detailed explanation of why this is dangerous...",
  "howToFixManually": "step-by-step instructions...",
  "impact": "what will be affected...",
  "priority": "critical",
  "estimatedTime": "30 minutes",
  "difficulty": "medium"
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
      whyDangerous: data.whyDangerous || '',
      howToFixManually: data.howToFixManually || '',
      impact: data.impact || '',
      priority: data.priority || 'medium',
      estimatedTime: data.estimatedTime || 'Unknown',
      difficulty: data.difficulty || 'medium'
    };
  } catch (error) {
    console.error('Error explaining fix:', error);
    throw error;
  }
}

/**
 * Explain multiple fixes
 */
export async function explainFixes(
  issues: CodeIssue[],
  files: Array<{ path: string; content: string }>
): Promise<FixExplanation[]> {
  const explanations: FixExplanation[] = [];

  if (!files || files.length === 0) {
    throw new Error('Files array is required and cannot be empty');
  }

  for (const issue of issues) {
    const file = files.find(f => f.path === issue.file || f.path.endsWith(issue.file));
    if (file && file.content) {
      try {
        const explanation = await explainFix(issue, file.content);
        explanations.push(explanation);
      } catch (error: any) {
        console.error(`Error explaining fix for ${issue.file}:`, error);
        // Add a basic explanation even if API fails
        explanations.push({
          issue,
          whyDangerous: `This ${issue.type} issue (${issue.severity} severity) needs attention.`,
          howToFixManually: issue.suggestion || 'Please review the code and apply appropriate fixes.',
          impact: 'This issue may affect code quality, security, or functionality.',
          priority: issue.severity === 'high' ? 'high' : 'medium' as 'critical' | 'high' | 'medium' | 'low',
          estimatedTime: 'Unknown',
          difficulty: 'medium'
        });
      }
    } else {
      console.warn(`File not found for issue: ${issue.file}`);
      // Add a basic explanation even if file not found
      explanations.push({
        issue,
        whyDangerous: `This ${issue.type} issue (${issue.severity} severity) needs attention.`,
        howToFixManually: issue.suggestion || 'Please review the code and apply appropriate fixes.',
        impact: 'This issue may affect code quality, security, or functionality.',
        priority: issue.severity === 'high' ? 'high' : 'medium' as 'critical' | 'high' | 'medium' | 'low',
        estimatedTime: 'Unknown',
        difficulty: 'medium'
      });
    }
  }

  return explanations;
}
