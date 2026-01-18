import { generateContentWithFallback } from '../utils/aiHelper';
import { CodeIssue } from './codeAnalyzer';

export interface BusinessImpact {
  issueId: string;
  estimatedCost?: {
    revenue?: string;
    users?: string;
    time?: string;
    reputation?: string;
  };
  businessMetrics?: {
    conversion?: string;
    seo?: string;
    security?: string;
    performance?: string;
  };
  impactScore: number; // 0-100
  priority: 'critical' | 'high' | 'medium' | 'low';
  explanation: string;
  realWorldExample?: string;
}

const BUSINESS_IMPACT_PROMPT = `Analyze the business impact of this code issue. Think like a CTO or Product Manager, not just a developer.

Issue Details:
- Type: {ISSUE_TYPE}
- Severity: {SEVERITY}
- File: {FILE}
- Description: {DESCRIPTION}
- Context: {CONTEXT}

Analyze and provide:
1. **Estimated Cost Impact**: 
   - Revenue loss (if applicable)
   - User impact (churn, bounce rate)
   - Time wasted
   - Reputation damage

2. **Business Metrics Affected**:
   - Conversion rate impact
   - SEO ranking impact
   - Security posture
   - Performance metrics

3. **Impact Score** (0-100): How critical is this for business?

4. **Real-world Example**: A concrete scenario showing the impact

5. **Priority**: critical/high/medium/low based on business impact, not just technical severity

Return ONLY valid JSON:
{
  "estimatedCost": {
    "revenue": "e.g., '30% lead loss' or 'N/A'",
    "users": "e.g., '5% bounce rate increase' or 'N/A'",
    "time": "e.g., '2 hours/week debugging' or 'N/A'",
    "reputation": "e.g., 'Security breach risk' or 'N/A'"
  },
  "businessMetrics": {
    "conversion": "e.g., '15% drop in form submissions' or 'N/A'",
    "seo": "e.g., 'Page speed penalty' or 'N/A'",
    "security": "e.g., 'XSS attack vector' or 'N/A'",
    "performance": "e.g., '500ms delay per request' or 'N/A'"
  },
  "impactScore": 85,
  "priority": "critical",
  "explanation": "Clear explanation of business impact in 2-3 sentences",
  "realWorldExample": "Concrete scenario: 'If an attacker exploits this XSS vulnerability, they could steal user session cookies, leading to account takeovers and potential data breach affecting 10,000+ users.'"
}`;

export async function analyzeBusinessImpact(
  issue: CodeIssue,
  codebaseContext?: string
): Promise<BusinessImpact> {
  try {
    const prompt = BUSINESS_IMPACT_PROMPT
      .replace('{ISSUE_TYPE}', issue.type)
      .replace('{SEVERITY}', issue.severity)
      .replace('{FILE}', issue.file)
      .replace('{DESCRIPTION}', issue.description)
      .replace('{CONTEXT}', codebaseContext || 'No additional context available');

    const response = await generateContentWithFallback(prompt);
    const text = response.text || '';
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const impact: BusinessImpact = JSON.parse(jsonMatch[0]);
    
    // Add issueId
    impact.issueId = `${issue.file}-${issue.type}-${issue.severity}`;
    
    return impact;
  } catch (error: any) {
    console.error('Error analyzing business impact:', error);
    
    // Fallback: basic impact based on severity
    const fallbackScore = issue.severity === 'high' ? 75 : issue.severity === 'medium' ? 50 : 25;
    const fallbackPriority = issue.severity === 'high' ? 'high' : issue.severity === 'medium' ? 'medium' : 'low';
    
    return {
      issueId: `${issue.file}-${issue.type}-${issue.severity}`,
      impactScore: fallbackScore,
      priority: fallbackPriority as 'critical' | 'high' | 'medium' | 'low',
      explanation: `This ${issue.severity} severity ${issue.type} issue could impact user experience and system reliability.`,
      estimatedCost: {},
      businessMetrics: {}
    };
  }
}

export async function analyzeMultipleIssues(
  issues: CodeIssue[],
  codebaseContext?: string
): Promise<BusinessImpact[]> {
  const impacts = await Promise.all(
    issues.map(issue => analyzeBusinessImpact(issue, codebaseContext))
  );
  
  // Sort by impact score (highest first)
  return impacts.sort((a, b) => b.impactScore - a.impactScore);
}
