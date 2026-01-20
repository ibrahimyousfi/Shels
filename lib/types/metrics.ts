// ===== Code Metrics Types =====
export interface MaintainabilityMetrics {
  score: number;
  factors: string[];
}

export interface TestabilityMetrics {
  score: number;
  recommendations: string[];
}

export interface ComplexityMetrics {
  average: number;
  max: number;
  distribution: Record<string, number>;
}

export interface SecurityMetrics {
  score: number;
  vulnerabilities: number;
  recommendations: string[];
}

export interface PerformanceMetrics {
  score: number;
  bottlenecks: string[];
  recommendations: string[];
}

export interface TechnicalDebt {
  hours: number;
  cost: number;
  breakdown: Array<{ type: string; hours: number }>;
}

export interface CodeMetrics {
  maintainability: MaintainabilityMetrics | number;
  complexity: ComplexityMetrics | number;
  testability: TestabilityMetrics | number;
  security?: SecurityMetrics;
  performance?: PerformanceMetrics;
  overall: number;
  recommendations: string[];
  technicalDebt?: TechnicalDebt;
  trends?: {
    improvement: string[];
    degradation: string[];
  };
}
