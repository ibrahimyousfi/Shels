import type { CodeIssue } from './analysis';

// ===== Risk Timeline Types =====
export interface RiskItem {
  issue: CodeIssue;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  urgency: 'fix-now' | 'fix-soon' | 'can-wait' | 'nice-to-have';
  impact: string;
  timeline: string;
}

export interface RiskTimeline {
  critical: RiskItem[];
  high: RiskItem[];
  medium: RiskItem[];
  low: RiskItem[];
  summary: {
    fixNow: number;
    fixSoon: number;
    canWait: number;
    niceToHave: number;
  };
  recommendations: string[];
}
