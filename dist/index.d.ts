/**
 * Main entry point for the Feature Flag Evaluator
 *
 * This module provides a complete feature flag evaluation system with
 * input validation, rule-based evaluation, and consistent output formatting.
 */
export * from './types';
export * from './config/constants';
export { InputValidatorImpl } from './validation/InputValidator';
export { RuleEngine } from './engine/RuleEngine';
export { FeatureFlagEvaluator } from './FeatureFlagEvaluator';
import { FeatureFlagEvaluator } from './FeatureFlagEvaluator';
export declare const defaultEvaluator: FeatureFlagEvaluator;
//# sourceMappingURL=index.d.ts.map