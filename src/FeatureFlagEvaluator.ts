/**
 * Main Feature Flag Evaluator implementation
 *
 * This is the primary interface for the feature flag evaluation system.
 * It orchestrates input validation, rule evaluation, and output formatting
 * to provide a complete feature flag evaluation service.
 */

import {
  FeatureFlagEvaluator as IFeatureFlagEvaluator,
  UserContext,
  EvaluationResult,
  ValidationResult,
} from './types';
import { InputValidatorImpl } from './validation/InputValidator';
import { RuleEngine } from './engine/RuleEngine';
import {
  ALL_FEATURES,
  SUPPORTED_PLANS,
  SUPPORTED_REGIONS,
} from './config/constants';

/**
 * Main implementation of the FeatureFlagEvaluator interface.
 *
 * This class provides the primary entry point for feature flag evaluation,
 * coordinating between input validation, rule evaluation, and output formatting
 * to deliver consistent and reliable feature flag decisions.
 */
export class FeatureFlagEvaluator implements IFeatureFlagEvaluator {
  private readonly inputValidator: InputValidatorImpl;
  private readonly ruleEngine: RuleEngine;

  constructor() {
    this.inputValidator = new InputValidatorImpl();
    this.ruleEngine = new RuleEngine();
  }

  /**
   * Evaluates feature flags for a given user context.
   *
   * This method orchestrates the complete evaluation process:
   * 1. Validates the input user context
   * 2. Evaluates applicable rules if validation passes
   * 3. Formats and returns the result with proper deduplication and sorting
   *
   * @param context - The user context containing userId, region, and plan
   * @returns EvaluationResult with either enabled features or error information
   */
  evaluate(context: UserContext): EvaluationResult {
    // Step 1: Validate input
    const validationResult: ValidationResult =
      this.inputValidator.validate(context);

    if (!validationResult.isValid) {
      // Return first validation error as the primary error message
      return {
        success: false,
        error: validationResult.errors[0] || 'Validation failed',
      };
    }

    // Step 2: Evaluate rules
    try {
      const enabledFeatures = this.ruleEngine.evaluateRules(context);

      // Step 3: Format output (deduplication and sorting handled by RuleEngine)
      return {
        success: true,
        features: enabledFeatures,
      };
    } catch (error) {
      // Handle any unexpected errors during rule evaluation
      const errorMessage =
        error instanceof Error ? error.message : 'Rule evaluation failed';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Returns the complete list of all available features in the system.
   *
   * This method provides visibility into all possible feature identifiers
   * that could be returned by the evaluation process, useful for API
   * consumers who need to understand the complete feature catalog.
   *
   * @returns Array of all available feature identifiers, sorted alphabetically
   */
  getAvailableFeatures(): string[] {
    // Return a copy of the features array, sorted alphabetically
    return [...ALL_FEATURES].sort();
  }

  /**
   * Returns the list of supported user plans.
   *
   * This method provides the complete list of valid plan values that
   * can be used in UserContext objects for evaluation.
   *
   * @returns Array of supported plan identifiers
   */
  getSupportedPlans(): string[] {
    // Return a copy of the supported plans array
    return [...SUPPORTED_PLANS];
  }

  /**
   * Returns the list of supported regions.
   *
   * This method provides the complete list of valid region values that
   * can be used in UserContext objects for evaluation.
   *
   * @returns Array of supported region identifiers
   */
  getSupportedRegions(): string[] {
    // Return a copy of the supported regions array
    return [...SUPPORTED_REGIONS];
  }
}
