import { generateContentWithFallback } from '../utils/aiHelper';
import { CodeFile, CodeIssue } from './codeAnalyzer';

export interface CodeMetrics {
  maintainability: number; // 0-100
  complexity: number; // 0-100 (higher = more complex)
  testability: number; // 0-100
  security: number; // 0-100
  performance: number; // 0-100
  overall: number; // 0-100
  recommendations: string[];
  trends: {
    improvement: string[];
    degradation: string[];
  };
}

/**
 * Calculate comprehensive code metrics
 */
export async function calculateCodeMetrics(
  files: CodeFile[],
  issues: CodeIssue[]
): Promise<CodeMetrics> {
  const codebaseContent = files
    .map(file => `File: ${file.path}\n${file.content}`)
    .join('\n\n---\n\n');

  const prompt = `Analyze this codebase and calculate comprehensive metrics.

Codebase:
${codebaseContent}

Issues Found: ${issues.length}
${issues.map(i => `- ${i.type} (${i.severity}): ${i.description}`).join('\n')}

Calculate metrics (0-100 scale):

1. **Maintainability**: How easy is it to maintain and modify?
   - Code organization
   - Documentation
   - Code clarity
   - Modularity

2. **Complexity**: How complex is the codebase?
   - Cyclomatic complexity
   - Code duplication
   - Nested structures
   - Dependencies

3. **Testability**: How easy is it to test?
   - Test coverage potential
   - Code isolation
   - Mockability
   - Test infrastructure

4. **Security**: How secure is the code?
   - Security vulnerabilities
   - Best practices
   - Input validation
   - Data protection

5. **Performance**: How performant is the code?
   - Algorithm efficiency
   - Resource usage
   - Optimization opportunities
   - Scalability

6. **Overall Score**: Weighted average of all metrics

7. **Recommendations**: Specific actionable recommendations

8. **Trends**: What's improving vs degrading

Return ONLY valid JSON:
{
  "maintainability": 75,
  "complexity": 60,
  "testability": 80,
  "security": 70,
  "performance": 85,
  "overall": 74,
  "recommendations": [
    "Add input validation",
    "Reduce code duplication"
  ],
  "trends": {
    "improvement": ["Better error handling", "Improved structure"],
    "degradation": ["Increased complexity", "Security issues"]
  }
}`;

  try {
    const result = await generateContentWithFallback(prompt);
    const text = result.text || '';

    if (!text || text.trim().length === 0) {
      throw new Error('Empty response from AI model');
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response. Response text:', text.substring(0, 500));
      throw new Error('No JSON found in AI response');
    }

    let data;
    try {
      data = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON parse error. JSON string:', jsonMatch[0].substring(0, 500));
      throw new Error('Failed to parse JSON from AI response');
    }

    return {
      maintainability: data.maintainability || 0,
      complexity: data.complexity || 0,
      testability: data.testability || 0,
      security: data.security || 0,
      performance: data.performance || 0,
      overall: data.overall || 0,
      recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
      trends: data.trends || {
        improvement: [],
        degradation: []
      }
    };
  } catch (error: any) {
    console.error('Error calculating code metrics:', error);
    
    // Check if it's a quota error
    if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      const quotaError = {
        error: {
          code: 429,
          message: 'API quota exceeded. Please wait or use a different API key.',
          status: 'RESOURCE_EXHAUSTED'
        }
      };
      throw new Error(JSON.stringify(quotaError));
    }
    
    throw error;
  }
}
