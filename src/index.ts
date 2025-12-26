/**
 * Main entry point for the Feature Flag Evaluator
 *
 * This module provides a complete feature flag evaluation system with
 * input validation, rule-based evaluation, and consistent output formatting.
 */

// Export all types and interfaces
export * from './types';

// Export configuration constants for external use
export * from './config/constants';

// Export implementation classes
export { InputValidatorImpl } from './validation/InputValidator';
export { RuleEngine } from './engine/RuleEngine';
export { FeatureFlagEvaluator } from './FeatureFlagEvaluator';

// Create and export a default instance for convenience
import { FeatureFlagEvaluator } from './FeatureFlagEvaluator';
export const defaultEvaluator = new FeatureFlagEvaluator();
