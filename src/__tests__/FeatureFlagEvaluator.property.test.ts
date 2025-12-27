/**
 * Property-based tests for FeatureFlagEvaluator implementation
 * Feature: feature-flag-evaluator
 */

import * as fc from 'fast-check';
import { FeatureFlagEvaluator } from '../FeatureFlagEvaluator';
import {
  UserContext,
  EvaluationResult,
  FeatureFlagConfiguration,
  RuleCondition,
} from '../types';
import { SUPPORTED_PLANS, SUPPORTED_REGIONS } from '../config/constants';

describe('FeatureFlagEvaluator Property Tests', () => {
  let evaluator: FeatureFlagEvaluator;
  let testConfiguration: FeatureFlagConfiguration;

  beforeEach(() => {
    evaluator = new FeatureFlagEvaluator();

    // Set up test configuration that matches the static constants
    testConfiguration = {
      supportedPlans: [...SUPPORTED_PLANS],
      supportedRegions: [...SUPPORTED_REGIONS],
      features: [
        {
          id: 'advanced-analytics',
          name: 'Advanced Analytics',
          description: 'Advanced reporting features',
        },
        {
          id: 'premium-support',
          name: 'Premium Support',
          description: '24/7 premium support',
        },
        {
          id: 'api-access',
          name: 'API Access',
          description: 'Full REST API access',
        },
        {
          id: 'basic-dashboard',
          name: 'Basic Dashboard',
          description: 'Standard dashboard',
        },
        {
          id: 'standard-support',
          name: 'Standard Support',
          description: 'Business hours support',
        },
        {
          id: 'us-payment-gateway',
          name: 'US Payment Gateway',
          description: 'US payment processing',
        },
        {
          id: 'eu-payment-gateway',
          name: 'EU Payment Gateway',
          description: 'EU payment processing',
        },
        {
          id: 'gdpr-tools',
          name: 'GDPR Tools',
          description: 'EU GDPR compliance features',
        },
        {
          id: 'us-compliance-tools',
          name: 'US Compliance Tools',
          description: 'US regulatory compliance features',
        },
      ],
      rules: [
        {
          id: 'pro-plan-features',
          conditions: [{ attribute: 'plan', operator: 'equals', value: 'Pro' }],
          features: ['advanced-analytics', 'premium-support', 'api-access'],
        },
        {
          id: 'basic-plan-features',
          conditions: [
            { attribute: 'plan', operator: 'equals', value: 'Basic' },
          ],
          features: ['basic-dashboard', 'standard-support'],
        },
        {
          id: 'us-region-features',
          conditions: [
            { attribute: 'region', operator: 'equals', value: 'US' },
          ],
          features: ['us-payment-gateway', 'us-compliance-tools'],
        },
        {
          id: 'eu-region-features',
          conditions: [
            { attribute: 'region', operator: 'equals', value: 'EU' },
          ],
          features: ['eu-payment-gateway', 'gdpr-tools'],
        },
      ],
    };

    // Load configuration into evaluator
    (evaluator as any).configuration = testConfiguration;
    (evaluator as any).inputValidator.setConfiguration(testConfiguration);
    (evaluator as any).ruleEngine.setConfiguration(testConfiguration);
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

  /**
   * Property 19: Dynamic feature query accuracy
   * For any loaded YAML configuration, querying for available features should return exactly
   * the Feature_Identifiers defined in the configuration
   * Validates: Requirements 5.2
   */
  test('Property 19: Dynamic feature query accuracy', async () => {
    // Feature: feature-flag-evaluator, Property 19: Dynamic feature query accuracy
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          supportedPlans: fc.array(fc.string({ minLength: 1 }), {
            minLength: 1,
            maxLength: 5,
          }),
          supportedRegions: fc.array(fc.string({ minLength: 1 }), {
            minLength: 1,
            maxLength: 5,
          }),
          features: fc.array(
            fc.record({
              id: fc.string({ minLength: 1 }),
              name: fc.string({ minLength: 1 }),
              description: fc.option(fc.string(), { nil: undefined }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          rules: fc.array(
            fc.record({
              id: fc.string({ minLength: 1 }),
              conditions: fc.array(
                fc.record({
                  attribute: fc.constantFrom(
                    'plan',
                    'region',
                    'userId'
                  ) as fc.Arbitrary<'plan' | 'region' | 'userId'>,
                  operator: fc.constant('equals') as fc.Arbitrary<
                    'equals' | 'in'
                  >,
                  value: fc.string({ minLength: 1 }),
                }) as fc.Arbitrary<RuleCondition>,
                { minLength: 1, maxLength: 3 }
              ),
              features: fc.array(fc.string({ minLength: 1 }), {
                minLength: 1,
                maxLength: 5,
              }),
            }),
            { minLength: 0, maxLength: 5 }
          ),
        }),
        async (config: FeatureFlagConfiguration) => {
          const evaluator = new FeatureFlagEvaluator();

          // Manually set configuration (simulating successful load)
          (evaluator as any).configuration = config;
          (evaluator as any).inputValidator.setConfiguration(config);
          (evaluator as any).ruleEngine.setConfiguration(config);

          const availableFeatures = evaluator.getAvailableFeatures();
          const expectedFeatures = config.features.map(f => f.id).sort();

          // Should return exactly the features defined in configuration
          expect(availableFeatures).toEqual(expectedFeatures);
          expect(availableFeatures.length).toBe(config.features.length);

          // All returned features should be from the configuration
          availableFeatures.forEach(feature => {
            expect(config.features.some(f => f.id === feature)).toBe(true);
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 20: Dynamic plan query accuracy
   * For any loaded YAML configuration, querying for supported plans should return exactly
   * the plan values defined in the configuration
   * Validates: Requirements 5.3
   */
  test('Property 20: Dynamic plan query accuracy', async () => {
    // Feature: feature-flag-evaluator, Property 20: Dynamic plan query accuracy
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          supportedPlans: fc.array(fc.string({ minLength: 1 }), {
            minLength: 1,
            maxLength: 5,
          }),
          supportedRegions: fc.array(fc.string({ minLength: 1 }), {
            minLength: 1,
            maxLength: 5,
          }),
          features: fc.array(
            fc.record({
              id: fc.string({ minLength: 1 }),
              name: fc.string({ minLength: 1 }),
              description: fc.option(fc.string(), { nil: undefined }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          rules: fc.array(
            fc.record({
              id: fc.string({ minLength: 1 }),
              conditions: fc.array(
                fc.record({
                  attribute: fc.constantFrom(
                    'plan',
                    'region',
                    'userId'
                  ) as fc.Arbitrary<'plan' | 'region' | 'userId'>,
                  operator: fc.constant('equals') as fc.Arbitrary<
                    'equals' | 'in'
                  >,
                  value: fc.string({ minLength: 1 }),
                }) as fc.Arbitrary<RuleCondition>,
                { minLength: 1, maxLength: 3 }
              ),
              features: fc.array(fc.string({ minLength: 1 }), {
                minLength: 1,
                maxLength: 5,
              }),
            }),
            { minLength: 0, maxLength: 5 }
          ),
        }),
        async (config: FeatureFlagConfiguration) => {
          const evaluator = new FeatureFlagEvaluator();

          // Manually set configuration (simulating successful load)
          (evaluator as any).configuration = config;
          (evaluator as any).inputValidator.setConfiguration(config);
          (evaluator as any).ruleEngine.setConfiguration(config);

          const supportedPlans = evaluator.getSupportedPlans();

          // Should return exactly the plans defined in configuration
          expect(supportedPlans).toEqual(config.supportedPlans);
          expect(supportedPlans.length).toBe(config.supportedPlans.length);

          // All returned plans should be from the configuration
          supportedPlans.forEach(plan => {
            expect(config.supportedPlans.includes(plan)).toBe(true);
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 21: Dynamic region query accuracy
   * For any loaded YAML configuration, querying for supported regions should return exactly
   * the region values defined in the configuration
   * Validates: Requirements 5.4
   */
  test('Property 21: Dynamic region query accuracy', async () => {
    // Feature: feature-flag-evaluator, Property 21: Dynamic region query accuracy
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          supportedPlans: fc.array(fc.string({ minLength: 1 }), {
            minLength: 1,
            maxLength: 5,
          }),
          supportedRegions: fc.array(fc.string({ minLength: 1 }), {
            minLength: 1,
            maxLength: 5,
          }),
          features: fc.array(
            fc.record({
              id: fc.string({ minLength: 1 }),
              name: fc.string({ minLength: 1 }),
              description: fc.option(fc.string(), { nil: undefined }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          rules: fc.array(
            fc.record({
              id: fc.string({ minLength: 1 }),
              conditions: fc.array(
                fc.record({
                  attribute: fc.constantFrom(
                    'plan',
                    'region',
                    'userId'
                  ) as fc.Arbitrary<'plan' | 'region' | 'userId'>,
                  operator: fc.constant('equals') as fc.Arbitrary<
                    'equals' | 'in'
                  >,
                  value: fc.string({ minLength: 1 }),
                }) as fc.Arbitrary<RuleCondition>,
                { minLength: 1, maxLength: 3 }
              ),
              features: fc.array(fc.string({ minLength: 1 }), {
                minLength: 1,
                maxLength: 5,
              }),
            }),
            { minLength: 0, maxLength: 5 }
          ),
        }),
        async (config: FeatureFlagConfiguration) => {
          const evaluator = new FeatureFlagEvaluator();

          // Manually set configuration (simulating successful load)
          (evaluator as any).configuration = config;
          (evaluator as any).inputValidator.setConfiguration(config);
          (evaluator as any).ruleEngine.setConfiguration(config);

          const supportedRegions = evaluator.getSupportedRegions();

          // Should return exactly the regions defined in configuration
          expect(supportedRegions).toEqual(config.supportedRegions);
          expect(supportedRegions.length).toBe(config.supportedRegions.length);

          // All returned regions should be from the configuration
          supportedRegions.forEach(region => {
            expect(config.supportedRegions.includes(region)).toBe(true);
          });
        }
      ),
      { numRuns: 50 }
    );
  });
});
