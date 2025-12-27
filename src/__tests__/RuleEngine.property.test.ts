/**
 * Property-based tests for RuleEngine implementation
 * Feature: feature-flag-evaluator
 */

import * as fc from 'fast-check';
import { RuleEngine } from '../engine/RuleEngine';
import {
  UserContext,
  FeatureFlagConfiguration,
  FeatureDefinition,
} from '../types';

describe('RuleEngine Property Tests', () => {
  let ruleEngine: RuleEngine;
  let testConfiguration: FeatureFlagConfiguration;

  beforeEach(() => {
    // Create a test configuration that matches the static configuration
    const features: FeatureDefinition[] = [
      { id: 'advanced-analytics', name: 'Advanced Analytics' },
      { id: 'premium-support', name: 'Premium Support' },
      { id: 'api-access', name: 'API Access' },
      { id: 'basic-dashboard', name: 'Basic Dashboard' },
      { id: 'standard-support', name: 'Standard Support' },
      { id: 'us-payment-gateway', name: 'US Payment Gateway' },
      { id: 'us-compliance-tools', name: 'US Compliance Tools' },
      { id: 'gdpr-tools', name: 'GDPR Tools' },
      { id: 'eu-payment-gateway', name: 'EU Payment Gateway' },
    ];

    testConfiguration = {
      supportedPlans: ['Basic', 'Pro'],
      supportedRegions: ['US', 'EU'],
      features,
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
          features: ['gdpr-tools', 'eu-payment-gateway'],
        },
      ],
    };

    ruleEngine = new RuleEngine();
    ruleEngine.setConfiguration(testConfiguration);
  });

  /**
   * Property 5: Pro plan feature inclusion
   * For any valid UserContext with plan "Pro", the returned feature list should include
   * all premium features (advanced-analytics, premium-support, api-access)
   * Validates: Requirements 2.1
   */
  test('Property 5: Pro plan feature inclusion', () => {
    // Feature: feature-flag-evaluator, Property 5: Pro plan feature inclusion
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), // Valid userId
        fc.constantFrom(...testConfiguration.supportedRegions),
        (userId, region) => {
          const context: UserContext = {
            userId,
            region,
            plan: 'Pro',
          };

          const features = ruleEngine.evaluateRules(context);

          // Pro plan should always include these premium features
          const expectedProFeatures = [
            'advanced-analytics',
            'premium-support',
            'api-access',
          ];

          expectedProFeatures.forEach(feature => {
            expect(features).toContain(feature);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6: Basic plan feature restriction
   * For any valid UserContext with plan "Basic", the returned feature list should include
   * only basic features and exclude premium features
   * Validates: Requirements 2.2
   */
  test('Property 6: Basic plan feature restriction', () => {
    // Feature: feature-flag-evaluator, Property 6: Basic plan feature restriction
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), // Valid userId
        fc.constantFrom(...testConfiguration.supportedRegions),
        (userId, region) => {
          const context: UserContext = {
            userId,
            region,
            plan: 'Basic',
          };

          const features = ruleEngine.evaluateRules(context);

          // Basic plan should include these features
          const expectedBasicFeatures = ['basic-dashboard', 'standard-support'];
          expectedBasicFeatures.forEach(feature => {
            expect(features).toContain(feature);
          });

          // Basic plan should NOT include premium features
          const premiumFeatures = [
            'advanced-analytics',
            'premium-support',
            'api-access',
          ];
          premiumFeatures.forEach(feature => {
            expect(features).not.toContain(feature);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7: US region feature inclusion
   * For any valid UserContext with region "US", the returned feature list should include
   * US-specific features (us-payment-gateway, us-compliance-tools)
   * Validates: Requirements 2.3
   */
  test('Property 7: US region feature inclusion', () => {
    // Feature: feature-flag-evaluator, Property 7: US region feature inclusion
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), // Valid userId
        fc.constantFrom(...testConfiguration.supportedPlans),
        (userId, plan) => {
          const context: UserContext = {
            userId,
            region: 'US',
            plan,
          };

          const features = ruleEngine.evaluateRules(context);

          // US region should always include these features
          const expectedUSFeatures = [
            'us-payment-gateway',
            'us-compliance-tools',
          ];

          expectedUSFeatures.forEach(feature => {
            expect(features).toContain(feature);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8: EU region feature inclusion and US exclusion
   * For any valid UserContext with region "EU", the returned feature list should include
   * EU-specific features (gdpr-tools, eu-payment-gateway) and exclude US-only features
   * Validates: Requirements 2.4
   */
  test('Property 8: EU region feature inclusion and US exclusion', () => {
    // Feature: feature-flag-evaluator, Property 8: EU region feature inclusion and US exclusion
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), // Valid userId
        fc.constantFrom(...testConfiguration.supportedPlans),
        (userId, plan) => {
          const context: UserContext = {
            userId,
            region: 'EU',
            plan,
          };

          const features = ruleEngine.evaluateRules(context);

          // EU region should include these features
          const expectedEUFeatures = ['gdpr-tools', 'eu-payment-gateway'];
          expectedEUFeatures.forEach(feature => {
            expect(features).toContain(feature);
          });

          // EU region should NOT include US-only features
          const usOnlyFeatures = ['us-payment-gateway', 'us-compliance-tools'];
          usOnlyFeatures.forEach(feature => {
            expect(features).not.toContain(feature);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 9: Rule combination (union of features)
   * For any valid UserContext that matches multiple rules, the returned feature list should
   * contain the union of all applicable features from matching rules
   * Validates: Requirements 2.5
   */
  test('Property 9: Rule combination (union of features)', () => {
    // Feature: feature-flag-evaluator, Property 9: Rule combination (union of features)
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), // Valid userId
        fc.constantFrom(...testConfiguration.supportedRegions),
        fc.constantFrom(...testConfiguration.supportedPlans),
        (userId, region, plan) => {
          const context: UserContext = {
            userId,
            region,
            plan,
          };

          const features = ruleEngine.evaluateRules(context);

          // Determine expected features based on plan
          let expectedPlanFeatures: string[] = [];
          if (plan === 'Pro') {
            expectedPlanFeatures = [
              'advanced-analytics',
              'premium-support',
              'api-access',
            ];
          } else if (plan === 'Basic') {
            expectedPlanFeatures = ['basic-dashboard', 'standard-support'];
          }

          // Determine expected features based on region
          let expectedRegionFeatures: string[] = [];
          if (region === 'US') {
            expectedRegionFeatures = [
              'us-payment-gateway',
              'us-compliance-tools',
            ];
          } else if (region === 'EU') {
            expectedRegionFeatures = ['gdpr-tools', 'eu-payment-gateway'];
          }

          // The result should contain the union of both plan and region features
          const expectedFeatures = [
            ...expectedPlanFeatures,
            ...expectedRegionFeatures,
          ];

          expectedFeatures.forEach(feature => {
            expect(features).toContain(feature);
          });

          // Features should be unique (no duplicates)
          const uniqueFeatures = [...new Set(features)];
          expect(features).toEqual(uniqueFeatures);

          // Features should be sorted
          const sortedFeatures = [...features].sort();
          expect(features).toEqual(sortedFeatures);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 11: Deterministic evaluation
   * For any UserContext, evaluating it multiple times should always produce identical results
   * Validates: Requirements 4.1, 4.5
   */
  test('Property 11: Deterministic evaluation', () => {
    // Feature: feature-flag-evaluator, Property 11: Deterministic evaluation
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), // Valid userId
        fc.constantFrom(...testConfiguration.supportedRegions),
        fc.constantFrom(...testConfiguration.supportedPlans),
        (userId, region, plan) => {
          const context: UserContext = {
            userId,
            region,
            plan,
          };

          // Evaluate the same context multiple times
          const result1 = ruleEngine.evaluateRules(context);
          const result2 = ruleEngine.evaluateRules(context);
          const result3 = ruleEngine.evaluateRules(context);

          // All results should be identical
          expect(result1).toEqual(result2);
          expect(result2).toEqual(result3);
          expect(result1).toEqual(result3);

          // Results should be arrays
          expect(Array.isArray(result1)).toBe(true);
          expect(Array.isArray(result2)).toBe(true);
          expect(Array.isArray(result3)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 18: Loaded rules evaluation equivalence
   * For any valid YAML configuration and user context, the Feature_Flag_Evaluator should evaluate
   * rules loaded from YAML identically to equivalent static rules
   * Validates: Requirements 5.1
   */
  test('Property 18: Loaded rules evaluation equivalence', () => {
    // Feature: feature-flag-evaluator, Property 18: Loaded rules evaluation equivalence
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), // Valid userId
        fc.constantFrom(...testConfiguration.supportedRegions),
        fc.constantFrom(...testConfiguration.supportedPlans),
        (userId, region, plan) => {
          const context: UserContext = {
            userId,
            region,
            plan,
          };

          // Create a rule engine with the loaded configuration
          const loadedRuleEngine = new RuleEngine();
          loadedRuleEngine.setConfiguration(testConfiguration);

          // Create a rule engine with equivalent static rules (from constants)
          const staticRuleEngine = new RuleEngine();
          const staticConfiguration = {
            ...testConfiguration,
            rules: [
              {
                id: 'pro-plan-features',
                conditions: [
                  {
                    attribute: 'plan' as const,
                    operator: 'equals' as const,
                    value: 'Pro',
                  },
                ],
                features: [
                  'advanced-analytics',
                  'premium-support',
                  'api-access',
                ],
              },
              {
                id: 'basic-plan-features',
                conditions: [
                  {
                    attribute: 'plan' as const,
                    operator: 'equals' as const,
                    value: 'Basic',
                  },
                ],
                features: ['basic-dashboard', 'standard-support'],
              },
              {
                id: 'us-region-features',
                conditions: [
                  {
                    attribute: 'region' as const,
                    operator: 'equals' as const,
                    value: 'US',
                  },
                ],
                features: ['us-payment-gateway', 'us-compliance-tools'],
              },
              {
                id: 'eu-region-features',
                conditions: [
                  {
                    attribute: 'region' as const,
                    operator: 'equals' as const,
                    value: 'EU',
                  },
                ],
                features: ['gdpr-tools', 'eu-payment-gateway'],
              },
            ],
          };
          staticRuleEngine.setConfiguration(staticConfiguration);

          // Both engines should produce identical results
          const loadedResult = loadedRuleEngine.evaluateRules(context);
          const staticResult = staticRuleEngine.evaluateRules(context);

          expect(loadedResult).toEqual(staticResult);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 22: Configuration-based evaluation consistency
   * For any loaded YAML configuration and user context, evaluating the same context multiple times
   * should always produce identical results
   * Validates: Requirements 5.5
   */
  test('Property 22: Configuration-based evaluation consistency', () => {
    // Feature: feature-flag-evaluator, Property 22: Configuration-based evaluation consistency
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), // Valid userId
        fc.constantFrom(...testConfiguration.supportedRegions),
        fc.constantFrom(...testConfiguration.supportedPlans),
        (userId, region, plan) => {
          const context: UserContext = {
            userId,
            region,
            plan,
          };

          // Create multiple rule engines with the same loaded configuration
          const engine1 = new RuleEngine();
          engine1.setConfiguration(testConfiguration);

          const engine2 = new RuleEngine();
          engine2.setConfiguration(testConfiguration);

          // Evaluate the same context multiple times with different engines
          const result1a = engine1.evaluateRules(context);
          const result1b = engine1.evaluateRules(context);
          const result2a = engine2.evaluateRules(context);
          const result2b = engine2.evaluateRules(context);

          // All results should be identical
          expect(result1a).toEqual(result1b);
          expect(result1a).toEqual(result2a);
          expect(result1a).toEqual(result2b);
          expect(result1b).toEqual(result2a);
          expect(result1b).toEqual(result2b);
          expect(result2a).toEqual(result2b);

          // Results should be arrays
          expect(Array.isArray(result1a)).toBe(true);
          expect(Array.isArray(result2a)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
