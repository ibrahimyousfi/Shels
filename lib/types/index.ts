// Re-export all types from organized modules
export * from './core';
export * from './analysis';
export * from './tests';
export * from './fixes';
export * from './business';
export * from './metrics';
export * from './timeline';
export * from './marathon';
export * from './session';
export * from './components';
export * from './api';

// ===== Additional Types =====
export type ErrorType = 'error' | 'warning' | 'info';

export interface ErrorState {
  message: string;
  type?: ErrorType;
}

export interface ProgressState {
  step: string;
  percentage: number;
}
