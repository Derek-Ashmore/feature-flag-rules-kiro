/**
 * Property-based tests for InputValidator implementation
 * Feature: feature-flag-evaluator
 */

import * as fc from 'fast-check';
import { InputValidatorImpl } from '../validation/InputValidator';
import { UserContext, EvaluationError } from '../types';
import { SUPPORTED_PLANS, SUPPORTED_REGIONS } from '../config/constants';

describe('InputValidator Property Tests', () => {
  let validator: InputValidatorImpl;

  beforeEach(() => {
    validator = new InputValidatorImpl();
  });

  /**
   * Property 2: Invalid userId rejection
   * For any UserContext with invalid userId (null, empty, or whitespace-only),
   * the Feature_Flag_Evaluator should return an error response indicating invalid user identification
   * Validates: Requirements 1.2
   */
  test('Property 2: Invalid userId rejection', () => {
    // Feature: feature-flag-evaluator, Property 2: Invalid userId rejection
    fc.assert(
      fc.property(
        // Generate invalid userIds: empty strings, whitespace-only strings, null, undefined
        fc.oneof(
          fc.constant(''),
          fc.constant('   '),
          fc.constant('\t'),
          fc.constant('\n'),
          fc.constant('  \t  \n  '),
          fc.constant(null),
          fc.constant(undefined)
        ),
        fc.constantFrom(...SUPPORTED_REGIONS),
        fc.constantFrom(...SUPPORTED_PLANS),
        (invalidUserId, region, plan) => {
          const context = {
            userId: invalidUserId,
            region,
            plan,
          } as UserContext;

          const result = validator.validate(context);

          // Should return error for invalid userId
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain(EvaluationError.INVALID_USER_ID);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3: Invalid region rejection
   * For any UserContext with unsupported region value,
   * the Feature_Flag_Evaluator should return an error response indicating unsupported region
   * Validates: Requirements 1.3, 3.3
   */
  test('Property 3: Invalid region rejection', () => {
    // Feature: feature-flag-evaluator, Property 3: Invalid region rejection
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), // Valid userId
        // Generate invalid regions (anything not in SUPPORTED_REGIONS)
        fc
          .string()
          .filter(region => !SUPPORTED_REGIONS.includes(region as any)),
        fc.constantFrom(...SUPPORTED_PLANS),
        (userId, invalidRegion, plan) => {
          const context: UserContext = {
            userId,
            region: invalidRegion,
            plan,
          };

          const result = validator.validate(context);

          // Should return error for invalid region
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain(EvaluationError.UNSUPPORTED_REGION);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4: Invalid plan rejection
   * For any UserContext with unsupported plan value,
   * the Feature_Flag_Evaluator should return an error response indicating unsupported plan
   * Validates: Requirements 1.4, 3.4
   */
  test('Property 4: Invalid plan rejection', () => {
    // Feature: feature-flag-evaluator, Property 4: Invalid plan rejection
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), // Valid userId
        fc.constantFrom(...SUPPORTED_REGIONS),
        // Generate invalid plans (anything not in SUPPORTED_PLANS)
        fc.string().filter(plan => !SUPPORTED_PLANS.includes(plan as any)),
        (userId, region, invalidPlan) => {
          const context: UserContext = {
            userId,
            region,
            plan: invalidPlan,
          };

          const result = validator.validate(context);

          // Should return error for invalid plan
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain(EvaluationError.UNSUPPORTED_PLAN);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 10: Input validation before processing
   * For any invalid UserContext, the Feature_Flag_Evaluator should return an error
   * without attempting rule evaluation
   * Validates: Requirements 3.5
   */
  test('Property 10: Input validation before processing', () => {
    // Feature: feature-flag-evaluator, Property 10: Input validation before processing
    fc.assert(
      fc.property(
        // Generate various types of invalid contexts
        fc.oneof(
          // Null/undefined contexts
          fc.constant(null),
          fc.constant(undefined),
          // Contexts with invalid userIds
          fc.record({
            userId: fc.oneof(
              fc.constant(''),
              fc.constant('   '),
              fc.constant('\t\n'),
              fc.constant(null),
              fc.constant(undefined)
            ),
            region: fc.constantFrom(...SUPPORTED_REGIONS),
            plan: fc.constantFrom(...SUPPORTED_PLANS),
          }),
          // Contexts with invalid regions
          fc.record({
            userId: fc
              .string({ minLength: 1 })
              .filter(s => s.trim().length > 0),
            region: fc
              .string()
              .filter(region => !SUPPORTED_REGIONS.includes(region as any)),
            plan: fc.constantFrom(...SUPPORTED_PLANS),
          }),
          // Contexts with invalid plans
          fc.record({
            userId: fc
              .string({ minLength: 1 })
              .filter(s => s.trim().length > 0),
            region: fc.constantFrom(...SUPPORTED_REGIONS),
            plan: fc
              .string()
              .filter(plan => !SUPPORTED_PLANS.includes(plan as any)),
          })
        ),
        invalidContext => {
          const result = validator.validate(invalidContext as UserContext);

          // Should always return invalid result for any invalid context
          expect(result.isValid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);

          // Should contain at least one of the expected error types
          const hasExpectedError = result.errors.some(error =>
            [
              EvaluationError.MISSING_CONTEXT,
              EvaluationError.INVALID_USER_ID,
              EvaluationError.UNSUPPORTED_REGION,
              EvaluationError.UNSUPPORTED_PLAN,
            ].includes(error as EvaluationError)
          );
          expect(hasExpectedError).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
