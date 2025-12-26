/**
 * Property-based tests for FeatureFlagEvaluator implementation
 * Feature: feature-flag-evaluator
 */

import * as fc from 'fast-check';
import { FeatureFlagEvaluator } from '../FeatureFlagEvaluator';
import { UserContext, EvaluationResult } from '../types';
import { SUPPORTED_PLANS, SUPPORTED_REGIONS } from '../config/constants';

describe('FeatureFlagEvaluator Property Tests', () => {
  let evaluator: FeatureFlagEvaluator;

  beforeEach(() => {
    evaluator = new FeatureFlagEvaluator();
  });

  /**
   * Property 1: Valid input produces valid output
   * For any valid UserContext (with non-empty userId, supported region, and supported plan),
   * the Feature_Flag_Evaluator should return a success response containing an array of feature identifiers
   * Validates: Requirements 1.1, 5.1
   */
  test('Property 1: Valid input produces valid output', () => {
    // Feature: feature-flag-evaluator, Property 1: Valid input produces valid output
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), // Valid userId
        fc.constantFrom(...SUPPORTED_REGIONS),
        fc.constantFrom(...SUPPORTED_PLANS),
        (userId, region, plan) => {
          const context: UserContext = {
            userId,
            region,
            plan,
          };

          const result: EvaluationResult = evaluator.evaluate(context);

          // Should return success
          expect(result.success).toBe(true);

          // Should have features array
          expect(result.features).toBeDefined();
          expect(Array.isArray(result.features)).toBe(true);

          // Should not have error
          expect(result.error).toBeUndefined();

          // All features should be strings
          result.features!.forEach(feature => {
            expect(typeof feature).toBe('string');
            expect(feature.length).toBeGreaterThan(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 12: Unique feature identifiers
   * For any successful evaluation result, the returned feature list should contain
   * no duplicate feature identifiers
   * Validates: Requirements 5.4
   */
  test('Property 12: Unique feature identifiers', () => {
    // Feature: feature-flag-evaluator, Property 12: Unique feature identifiers
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), // Valid userId
        fc.constantFrom(...SUPPORTED_REGIONS),
        fc.constantFrom(...SUPPORTED_PLANS),
        (userId, region, plan) => {
          const context: UserContext = {
            userId,
            region,
            plan,
          };

          const result: EvaluationResult = evaluator.evaluate(context);

          // Should be successful
          expect(result.success).toBe(true);
          expect(result.features).toBeDefined();

          // All features should be unique (no duplicates)
          const features = result.features!;
          const uniqueFeatures = [...new Set(features)];
          expect(features).toEqual(uniqueFeatures);
          expect(features.length).toBe(uniqueFeatures.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 13: Consistent feature ordering
   * For any successful evaluation result, the returned feature identifiers should be in alphabetical order
   * Validates: Requirements 5.5
   */
  test('Property 13: Consistent feature ordering', () => {
    // Feature: feature-flag-evaluator, Property 13: Consistent feature ordering
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), // Valid userId
        fc.constantFrom(...SUPPORTED_REGIONS),
        fc.constantFrom(...SUPPORTED_PLANS),
        (userId, region, plan) => {
          const context: UserContext = {
            userId,
            region,
            plan,
          };

          const result: EvaluationResult = evaluator.evaluate(context);

          // Should be successful
          expect(result.success).toBe(true);
          expect(result.features).toBeDefined();

          // Features should be in alphabetical order
          const features = result.features!;
          const sortedFeatures = [...features].sort();
          expect(features).toEqual(sortedFeatures);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 14: Error response structure
   * For any invalid UserContext, the Feature_Flag_Evaluator should return an error response
   * with a descriptive error message
   * Validates: Requirements 5.2
   */
  test('Property 14: Error response structure', () => {
    // Feature: feature-flag-evaluator, Property 14: Error response structure
    fc.assert(
      fc.property(
        fc.oneof(
          // Invalid userId cases
          fc.record({
            userId: fc.oneof(
              fc.constant(''),
              fc.constant('   '), // whitespace only
              fc.constant(null as any),
              fc.constant(undefined as any)
            ),
            region: fc.constantFrom(...SUPPORTED_REGIONS),
            plan: fc.constantFrom(...SUPPORTED_PLANS),
          }),
          // Invalid region cases
          fc.record({
            userId: fc
              .string({ minLength: 1 })
              .filter(s => s.trim().length > 0),
            region: fc
              .string()
              .filter(
                s => !(SUPPORTED_REGIONS as readonly string[]).includes(s)
              ),
            plan: fc.constantFrom(...SUPPORTED_PLANS),
          }),
          // Invalid plan cases
          fc.record({
            userId: fc
              .string({ minLength: 1 })
              .filter(s => s.trim().length > 0),
            region: fc.constantFrom(...SUPPORTED_REGIONS),
            plan: fc
              .string()
              .filter(s => !(SUPPORTED_PLANS as readonly string[]).includes(s)),
          }),
          // Null context
          fc.constant(null as any),
          // Undefined context
          fc.constant(undefined as any)
        ),
        context => {
          const result: EvaluationResult = evaluator.evaluate(context);

          // Should return failure
          expect(result.success).toBe(false);

          // Should have error message
          expect(result.error).toBeDefined();
          expect(typeof result.error).toBe('string');
          expect(result.error!.length).toBeGreaterThan(0);

          // Should not have features
          expect(result.features).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});
