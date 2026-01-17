import { generateContentWithFallback } from '../utils/aiHelper';
import { CodeIssue } from './codeAnalyzer';

export interface CodeFix {
  issue: CodeIssue;
  fixedCode: string;
  explanation: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Generate fix for a code issue
 */
export async function generateFix(
  filePath: string,
  fileContent: string,
  issue: CodeIssue
): Promise<CodeFix> {
  try {
    const prompt = `Fix this code issue:

File: ${filePath}
Issue Type: ${issue.type}
Severity: ${issue.severity}
Description: ${issue.description}
Suggestion: ${issue.suggestion || 'None'}

Original Code:
${fileContent}

Provide the fixed code with:
1. Complete fixed code for the file
2. Explanation of what was fixed
3. Confidence level (high/medium/low)

Return ONLY valid JSON:
{
  "fixedCode": "complete fixed code here",
  "explanation": "what was fixed and why",
  "confidence": "high"
}`;

    const result = await generateContentWithFallback(prompt);
    const text = result.text || '';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const data = JSON.parse(jsonMatch[0]);

    return {
      issue,
      fixedCode: data.fixedCode,
      explanation: data.explanation,
      confidence: data.confidence || 'medium'
    };
  } catch (error) {
    console.error('Error generating fix:', error);
    throw error;
  }
}

/**
 * Generate fixes for multiple issues
 */
export async function generateFixes(
  files: Array<{ path: string; content: string }>,
  issues: CodeIssue[]
): Promise<CodeFix[]> {
  const fixes: CodeFix[] = [];

  // Group issues by file
  const issuesByFile = new Map<string, CodeIssue[]>();
  issues.forEach(issue => {
    if (!issuesByFile.has(issue.file)) {
      issuesByFile.set(issue.file, []);
    }
    issuesByFile.get(issue.file)!.push(issue);
  });

  // Generate fix for each file
  for (const [filePath, fileIssues] of issuesByFile) {
    const file = files.find(f => f.path === filePath);
    if (!file) continue;

    // Fix all issues in the file at once
    try {
      const prompt = `Fix all these issues in this file:

File: ${filePath}
Issues:
${fileIssues.map((issue, i) => 
  `${i + 1}. ${issue.type} (${issue.severity}): ${issue.description}`
).join('\n')}

Original Code:
${file.content}

Provide the complete fixed code that addresses all issues.

Return ONLY valid JSON:
{
  "fixedCode": "complete fixed code here",
  "explanation": "what was fixed and why",
  "confidence": "high"
}`;

      const result = await generateContentWithFallback(prompt);
      const text = result.text || '';

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        
        fileIssues.forEach(issue => {
          fixes.push({
            issue,
            fixedCode: data.fixedCode,
            explanation: data.explanation,
            confidence: data.confidence || 'medium'
          });
        });
      }
    } catch (error) {
      console.error(`Error fixing file ${filePath}:`, error);
    }
  }

  return fixes;
}
