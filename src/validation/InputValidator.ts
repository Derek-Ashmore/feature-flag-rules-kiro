/**
 * Input validation component for the Feature Flag Evaluator
 */

import {
  UserContext,
  ValidationResult,
  InputValidator,
  EvaluationError,
} from '../types';
import { SUPPORTED_PLANS, SUPPORTED_REGIONS } from '../config/constants';

/**
 * Implementation of the InputValidator interface
 * Validates UserContext structure and field requirements
 */
export class InputValidatorImpl implements InputValidator {
  /**
   * Validates a UserContext object
   * @param context - The user context to validate
   * @returns ValidationResult indicating success or failure with error details
   */
  validate(context: UserContext): ValidationResult {
    const errors: string[] = [];

    // Check if context exists
    if (!context || context === null || context === undefined) {
      errors.push(EvaluationError.MISSING_CONTEXT);
      return { isValid: false, errors };
    }

    // Validate userId
    if (!this.isValidUserId(context.userId)) {
      errors.push(EvaluationError.INVALID_USER_ID);
    }

    // Validate region
    if (!this.isValidRegion(context.region)) {
      errors.push(EvaluationError.UNSUPPORTED_REGION);
    }

    // Validate plan
    if (!this.isValidPlan(context.plan)) {
      errors.push(EvaluationError.UNSUPPORTED_PLAN);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates userId field
   * @param userId - The userId to validate
   * @returns true if valid, false otherwise
   */
  private isValidUserId(userId: string): boolean {
    // Check if userId exists and is not null/undefined
    if (!userId || userId === null || userId === undefined) {
      return false;
    }

    // Check if userId is a string
    if (typeof userId !== 'string') {
      return false;
    }

    // Check if userId is not empty or only whitespace
    if (userId.trim().length === 0) {
      return false;
    }

    return true;
  }

  /**
   * Validates region field
   * @param region - The region to validate
   * @returns true if valid, false otherwise
   */
  private isValidRegion(region: string): boolean {
    // Check if region exists and is a string
    if (!region || typeof region !== 'string') {
      return false;
    }

    // Check if region is in supported regions
    return SUPPORTED_REGIONS.includes(region as any);
  }

  /**
   * Validates plan field
   * @param plan - The plan to validate
   * @returns true if valid, false otherwise
   */
  private isValidPlan(plan: string): boolean {
    // Check if plan exists and is a string
    if (!plan || typeof plan !== 'string') {
      return false;
    }

    // Check if plan is in supported plans
    return SUPPORTED_PLANS.includes(plan as any);
  }
}
