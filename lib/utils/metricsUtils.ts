import type { CodeMetrics } from '@/lib/types';

export interface MetricItem {
  label: string;
  value: number;
  color: 'green' | 'yellow' | 'red';
  description: string;
  isInverted?: boolean;
  showExtra?: boolean;
}

/**
 * Extract metric score from different formats
 */
export function extractMetricScore(metric: number | { score?: number } | undefined): number {
  if (typeof metric === 'number') return metric;
  if (metric && typeof metric === 'object' && 'score' in metric) {
    return metric.score || 0;
  }
  return 0;
}

/**
 * Extract complexity value from different formats
 */
export function extractComplexityValue(complexity: number | { average?: number; max?: number; distribution?: any } | undefined): {
  value: number;
  max?: number;
  distribution?: any;
} {
  if (typeof complexity === 'number') {
    return { value: complexity };
  }
  if (complexity && typeof complexity === 'object') {
    return {
      value: complexity.average || 0,
      max: complexity.max,
      distribution: complexity.distribution
    };
  }
  return { value: 0 };
}

/**
 * Get color for metric value
 */
export function getMetricColor(value: number, threshold1: number, threshold2: number, isInverted = false): 'green' | 'yellow' | 'red' {
  if (isInverted) {
    return value <= threshold1 ? 'green' : value <= threshold2 ? 'yellow' : 'red';
  }
  return value >= threshold1 ? 'green' : value >= threshold2 ? 'yellow' : 'red';
}

/**
 * Build metric items from CodeMetrics
 */
export function buildMetricItems(metrics: CodeMetrics): MetricItem[] {
  const maintainabilityScore = extractMetricScore(metrics.maintainability);
  const testabilityScore = extractMetricScore(metrics.testability);
  const complexity = extractComplexityValue(metrics.complexity);

  const items: MetricItem[] = [
    {
      label: 'Maintainability',
      value: maintainabilityScore,
      color: getMetricColor(maintainabilityScore, 70, 50),
      description: 'How easy is it to maintain and modify the code?'
    },
    {
      label: 'Testability',
      value: testabilityScore,
      color: getMetricColor(testabilityScore, 70, 50),
      description: 'How easy is it to test the code?'
    },
    {
      label: 'Complexity (Avg)',
      value: complexity.value,
      color: getMetricColor(complexity.value, 30, 60, true),
      description: 'Average cyclomatic complexity (lower is better)',
      isInverted: true,
      showExtra: complexity.max !== undefined
    }
  ];

  return items.filter(item => item.value !== undefined);
}
