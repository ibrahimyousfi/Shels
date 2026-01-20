import type { Priority } from './core';

// ===== Business Impact Types =====
export interface BusinessImpactData {
  impactScore: number;
  priority: Priority;
  revenueImpact?: string;
  userImpact?: string;
  reputationImpact?: string;
  estimatedTime?: string;
  explanation: string;
  issueId?: string;
}
