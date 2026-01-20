import { generateContentWithFallback } from '../utils/aiHelper';
import type { CodeIssue, RiskTimeline, RiskItem } from '@/lib/types';

/**
 * Generate risk timeline - prioritize issues by urgency
 */
export async function generateRiskTimeline(
  issues: CodeIssue[],
  codebaseContext?: string
): Promise<RiskTimeline> {
  const prompt = `Analyze these code issues and create a risk timeline prioritizing what needs to be fixed.

Issues:
${issues.map((issue, i) => 
  `${i + 1}. ${issue.type} (${issue.severity}): ${issue.description} - File: ${issue.file}`
).join('\n')}

${codebaseContext ? `Codebase Context:\n${codebaseContext}` : ''}

For each issue, determine:

1. **Risk Level:**
   - Critical: Security/data loss risk, breaks functionality
   - High: Major security/functionality issue
   - Medium: Moderate issue
   - Low: Minor issue

2. **Urgency:**
   - fix-now: Must fix immediately (security/data risk)
   - fix-soon: Fix within days (major functionality)
   - can-wait: Fix when possible (moderate issues)
   - nice-to-have: Optional improvements

3. **Impact:**
   - What happens if not fixed
   - Who/what is affected

4. **Timeline:**
   - When should this be fixed (e.g., "Today", "This week", "This month", "Next sprint")

5. **Overall Recommendations:**
   - What should be fixed first
   - What can wait
   - Suggested fix order

Return ONLY valid JSON:
{
  "critical": [
    {
      "issue": { "type": "security", "severity": "high", ... },
      "riskLevel": "critical",
      "urgency": "fix-now",
      "impact": "Allows attacker to hijack tracking",
      "timeline": "Today"
    }
  ],
  "high": [...],
  "medium": [...],
  "low": [...],
  "summary": {
    "fixNow": 2,
    "fixSoon": 3,
    "canWait": 2,
    "niceToHave": 1
  },
  "recommendations": [
    "Fix security issues first",
    "Address high-severity bugs this week"
  ]
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

    // Map issues back to original
    const mapIssues = (items: any[]) => {
      if (!Array.isArray(items)) return [];
      return items.map((item: any) => {
        const originalIssue = issues.find(i => 
          i.file === item.issue?.file && 
          i.description === item.issue?.description
        );
        return {
          ...item,
          issue: originalIssue || item.issue
        };
      });
    };

    return {
      critical: mapIssues(data.critical || []),
      high: mapIssues(data.high || []),
      medium: mapIssues(data.medium || []),
      low: mapIssues(data.low || []),
      summary: data.summary || {
        fixNow: 0,
        fixSoon: 0,
        canWait: 0,
        niceToHave: 0
      },
      recommendations: Array.isArray(data.recommendations) ? data.recommendations : []
    };
  } catch (error: any) {
    console.error('Error generating risk timeline:', error);
    
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
