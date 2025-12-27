/**
 * Integration tests for Feature Flag Evaluator
 *
 * These tests verify the complete evaluation flow with various user contexts
 * and test error handling across component boundaries. They ensure that
 * InputValidator, RuleEngine, and output formatting work together correctly.
 *
 * Note: These tests use the sample YAML configuration to maintain compatibility
 * with the original static configuration behavior.
 */

import * as path from 'path';
import { FeatureFlagEvaluator } from '../FeatureFlagEvaluator';
import { UserContext, EvaluationResult } from '../types';

describe('Feature Flag Evaluator - Integration Tests', () => {
  let evaluator: FeatureFlagEvaluator;

  beforeEach(async () => {
    evaluator = new FeatureFlagEvaluator();

    // Load the sample configuration to maintain compatibility with original tests
    const configPath = path.join(__dirname, 'fixtures', 'sample-config.yml');
    const loadResult = await evaluator.loadConfiguration(configPath);

    if (!loadResult.success) {
      throw new Error(`Failed to load test configuration: ${loadResult.error}`);
    }
  });

  describe('Complete Evaluation Flow', () => {
    it('should handle Pro US user with complete feature set', () => {
      const context: UserContext = {
        userId: 'pro-us-user-001',
        region: 'US',
        plan: 'Pro',
      };

      const result: EvaluationResult = evaluator.evaluate(context);

      expect(result.success).toBe(true);
      expect(result.features).toBeDefined();
      expect(result.features).toHaveLength(5);
      expect(result.features).toEqual([
        'advanced-analytics',
        'api-access',
        'premium-support',
        'us-compliance-tools',
        'us-payment-gateway',
      ]);
      expect(result.error).toBeUndefined();
    });

    it('should handle Pro EU user with region-specific features', () => {
      const context: UserContext = {
        userId: 'pro-eu-user-001',
        region: 'EU',
        plan: 'Pro',
      };

      const result: EvaluationResult = evaluator.evaluate(context);

      expect(result.success).toBe(true);
      expect(result.features).toBeDefined();
      expect(result.features).toHaveLength(5);
      expect(result.features).toEqual([
        'advanced-analytics',
        'api-access',
        'eu-payment-gateway',
        'gdpr-tools',
        'premium-support',
      ]);
      expect(result.error).toBeUndefined();
    });

    it('should handle Basic US user with limited feature set', () => {
      const context: UserContext = {
        userId: 'basic-us-user-001',
        region: 'US',
        plan: 'Basic',
      };

      const result: EvaluationResult = evaluator.evaluate(context);

      expect(result.success).toBe(true);
      expect(result.features).toBeDefined();
      expect(result.features).toHaveLength(4);
      expect(result.features).toEqual([
        'basic-dashboard',
        'standard-support',
        'us-compliance-tools',
        'us-payment-gateway',
      ]);
      expect(result.error).toBeUndefined();
    });

    it('should handle Basic EU user with region-appropriate features', () => {
      const context: UserContext = {
        userId: 'basic-eu-user-001',
        region: 'EU',
        plan: 'Basic',
      };

      const result: EvaluationResult = evaluator.evaluate(context);

      expect(result.success).toBe(true);
      expect(result.features).toBeDefined();
      expect(result.features).toHaveLength(4);
      expect(result.features).toEqual([
        'basic-dashboard',
        'eu-payment-gateway',
        'gdpr-tools',
        'standard-support',
      ]);
      expect(result.error).toBeUndefined();
    });

    it('should maintain deterministic results across multiple evaluations', () => {
      const context: UserContext = {
        userId: 'deterministic-test-user',
        region: 'US',
        plan: 'Pro',
      };

      // Perform multiple evaluations
      const results = Array.from({ length: 10 }, () =>
        evaluator.evaluate(context)
      );

      // All results should be identical
      const firstResult = results[0];
      results.forEach(result => {
        expect(result.success).toBe(firstResult.success);
        expect(result.features).toEqual(firstResult.features);
        expect(result.error).toBe(firstResult.error);
      });
    });

    it('should ensure features are always sorted alphabetically', () => {
      const testContexts: UserContext[] = [
        { userId: 'user1', region: 'US', plan: 'Pro' },
        { userId: 'user2', region: 'EU', plan: 'Pro' },
        { userId: 'user3', region: 'US', plan: 'Basic' },
        { userId: 'user4', region: 'EU', plan: 'Basic' },
      ];

      testContexts.forEach(context => {
        const result = evaluator.evaluate(context);
        expect(result.success).toBe(true);
        expect(result.features).toBeDefined();

        // Verify features are sorted alphabetically
        const sortedFeatures = [...result.features!].sort();
        expect(result.features).toEqual(sortedFeatures);
      });
    });

    it('should ensure no duplicate features in results', () => {
      const testContexts: UserContext[] = [
        { userId: 'user1', region: 'US', plan: 'Pro' },
        { userId: 'user2', region: 'EU', plan: 'Pro' },
        { userId: 'user3', region: 'US', plan: 'Basic' },
        { userId: 'user4', region: 'EU', plan: 'Basic' },
      ];

      testContexts.forEach(context => {
        const result = evaluator.evaluate(context);
        expect(result.success).toBe(true);
        expect(result.features).toBeDefined();

        // Verify no duplicates
        const uniqueFeatures = [...new Set(result.features!)];
        expect(result.features).toEqual(uniqueFeatures);
      });
    });
  });

  describe('Error Handling Across Component Boundaries', () => {
    it('should propagate validation errors from InputValidator through complete flow', () => {
      const invalidContexts = [
        {
          context: null,
          expectedError: 'Missing or null user context',
        },
        {
          context: undefined,
          expectedError: 'Missing or null user context',
        },
        {
          context: { userId: '', region: 'US', plan: 'Pro' },
          expectedError: 'Invalid or empty userId',
        },
        {
          context: { userId: '   ', region: 'US', plan: 'Pro' },
          expectedError: 'Invalid or empty userId',
        },
        {
          context: { userId: 'user', region: 'INVALID', plan: 'Pro' },
          expectedError: 'Unsupported region',
        },
        {
          context: { userId: 'user', region: 'US', plan: 'INVALID' },
          expectedError: 'Unsupported plan',
        },
      ];

      invalidContexts.forEach(({ context, expectedError }) => {
        const result = evaluator.evaluate(context as any);

        expect(result.success).toBe(false);
        expect(result.error).toBe(expectedError);
        expect(result.features).toBeUndefined();
      });
    });

    it('should handle evaluation without configuration loading', () => {
      // Create a new evaluator without loading configuration
      const unconfiguredEvaluator = new FeatureFlagEvaluator();

      const context: UserContext = {
        userId: 'test-user',
        region: 'US',
        plan: 'Pro',
      };

      const result = unconfiguredEvaluator.evaluate(context);

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        'Configuration not loaded - call loadConfiguration first'
      );
      expect(result.features).toBeUndefined();
    });

    it('should handle malformed context objects gracefully', () => {
      const malformedContexts = [
        { userId: null, region: 'US', plan: 'Pro' },
        { userId: 'user', region: null, plan: 'Pro' },
        { userId: 'user', region: 'US', plan: null },
        { userId: undefined, region: 'US', plan: 'Pro' },
        { userId: 'user', region: undefined, plan: 'Pro' },
        { userId: 'user', region: 'US', plan: undefined },
        {} as UserContext, // Empty object
        { userId: 'user' } as UserContext, // Missing fields
        { region: 'US', plan: 'Pro' } as UserContext, // Missing userId
      ];

      malformedContexts.forEach(context => {
        const result = evaluator.evaluate(context as UserContext);

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.features).toBeUndefined();
      });
    });

    it('should maintain error response structure consistency', () => {
      const invalidContext: UserContext = {
        userId: '',
        region: 'INVALID',
        plan: 'INVALID',
      };

      const result = evaluator.evaluate(invalidContext);

      // Verify error response structure
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('error');
      expect(result).not.toHaveProperty('features');
      expect(result.success).toBe(false);
      expect(typeof result.error).toBe('string');
      expect(result.error!.length).toBeGreaterThan(0);
    });

    it('should handle edge cases in user context values', () => {
      const edgeCaseContexts = [
        {
          context: { userId: 'a'.repeat(1000), region: 'US', plan: 'Pro' },
          shouldSucceed: true,
          description: 'very long userId',
        },
        {
          context: { userId: '123', region: 'US', plan: 'Pro' },
          shouldSucceed: true,
          description: 'numeric userId',
        },
        {
          context: { userId: 'user@domain.com', region: 'US', plan: 'Pro' },
          shouldSucceed: true,
          description: 'email-like userId',
        },
        {
          context: {
            userId: 'user-with-special-chars_123',
            region: 'US',
            plan: 'Pro',
          },
          shouldSucceed: true,
          description: 'userId with special characters',
        },
      ];

      edgeCaseContexts.forEach(({ context, shouldSucceed }) => {
        const result = evaluator.evaluate(context);

        if (shouldSucceed) {
          expect(result.success).toBe(true);
          expect(result.features).toBeDefined();
          expect(result.error).toBeUndefined();
        } else {
          expect(result.success).toBe(false);
          expect(result.error).toBeDefined();
          expect(result.features).toBeUndefined();
        }
      });
    });
  });

  describe('Component Integration Verification', () => {
    it('should verify InputValidator integration with main flow', () => {
      // Test that validation happens before rule evaluation
      const validContext: UserContext = {
        userId: 'test-user',
        region: 'US',
        plan: 'Pro',
      };

      const invalidContext: UserContext = {
        userId: '',
        region: 'US',
        plan: 'Pro',
      };

      const validResult = evaluator.evaluate(validContext);
      const invalidResult = evaluator.evaluate(invalidContext);

      // Valid context should proceed to rule evaluation
      expect(validResult.success).toBe(true);
      expect(validResult.features).toBeDefined();

      // Invalid context should fail at validation stage
      expect(invalidResult.success).toBe(false);
      expect(invalidResult.error).toBe('Invalid or empty userId');
    });

    it('should verify RuleEngine integration with main flow', () => {
      // Test that rule engine correctly processes validated input
      const contexts = [
        {
          context: { userId: 'user1', region: 'US', plan: 'Pro' },
          expectedFeatureCount: 5,
          mustInclude: ['advanced-analytics', 'us-payment-gateway'],
        },
        {
          context: { userId: 'user2', region: 'EU', plan: 'Basic' },
          expectedFeatureCount: 4,
          mustInclude: ['basic-dashboard', 'gdpr-tools'],
        },
      ];

      contexts.forEach(({ context, expectedFeatureCount, mustInclude }) => {
        const result = evaluator.evaluate(context);

        expect(result.success).toBe(true);
        expect(result.features).toHaveLength(expectedFeatureCount);
        mustInclude.forEach(feature => {
          expect(result.features).toContain(feature);
        });
      });
    });

    it('should verify output formatting integration', () => {
      const context: UserContext = {
        userId: 'format-test-user',
        region: 'US',
        plan: 'Pro',
      };

      const result = evaluator.evaluate(context);

      expect(result.success).toBe(true);
      expect(result.features).toBeDefined();

      // Verify output formatting requirements
      expect(Array.isArray(result.features)).toBe(true);
      expect(result.features!.length).toBeGreaterThan(0);

      // Verify alphabetical sorting
      const sortedFeatures = [...result.features!].sort();
      expect(result.features).toEqual(sortedFeatures);

      // Verify uniqueness
      const uniqueFeatures = [...new Set(result.features!)];
      expect(result.features).toEqual(uniqueFeatures);
    });
  });

  describe('Query Methods Integration', () => {
    it('should verify query methods work independently of evaluation state', () => {
      // Test that query methods work before any evaluations
      const availableFeatures = evaluator.getAvailableFeatures();
      const supportedPlans = evaluator.getSupportedPlans();
      const supportedRegions = evaluator.getSupportedRegions();

      expect(availableFeatures).toBeDefined();
      expect(supportedPlans).toBeDefined();
      expect(supportedRegions).toBeDefined();

      // Perform an evaluation
      const context: UserContext = {
        userId: 'test-user',
        region: 'US',
        plan: 'Pro',
      };
      evaluator.evaluate(context);

      // Query methods should return same results after evaluation
      expect(evaluator.getAvailableFeatures()).toEqual(availableFeatures);
      expect(evaluator.getSupportedPlans()).toEqual(supportedPlans);
      expect(evaluator.getSupportedRegions()).toEqual(supportedRegions);
    });

    it('should verify query methods return consistent data with evaluation results', () => {
      const availableFeatures = evaluator.getAvailableFeatures();
      const supportedPlans = evaluator.getSupportedPlans();
      const supportedRegions = evaluator.getSupportedRegions();

      // Test that evaluation results only contain features from available features
      supportedRegions.forEach(region => {
        supportedPlans.forEach(plan => {
          const context: UserContext = {
            userId: `test-user-${region}-${plan}`,
            region,
            plan,
          };

          const result = evaluator.evaluate(context);
          expect(result.success).toBe(true);

          result.features!.forEach(feature => {
            expect(availableFeatures).toContain(feature);
          });
        });
      });
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle multiple rapid evaluations without issues', () => {
      const contexts: UserContext[] = Array.from({ length: 100 }, (_, i) => ({
        userId: `user-${i}`,
        region: i % 2 === 0 ? 'US' : 'EU',
        plan: i % 2 === 0 ? 'Pro' : 'Basic',
      }));

      const results = contexts.map(context => evaluator.evaluate(context));

      // All evaluations should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.features).toBeDefined();
        expect(result.error).toBeUndefined();
      });

      // Results should be consistent for same context
      const usProResults = results.filter((_, i) => i % 2 === 0);
      const euBasicResults = results.filter((_, i) => i % 2 === 1);

      // All US Pro users should have same features
      const firstUsProFeatures = usProResults[0].features;
      usProResults.forEach(result => {
        expect(result.features).toEqual(firstUsProFeatures);
      });

      // All EU Basic users should have same features
      const firstEuBasicFeatures = euBasicResults[0].features;
      euBasicResults.forEach(result => {
        expect(result.features).toEqual(firstEuBasicFeatures);
      });
    });

    it('should maintain state isolation between evaluations', () => {
      const context1: UserContext = {
        userId: 'user1',
        region: 'US',
        plan: 'Pro',
      };

      const context2: UserContext = {
        userId: 'user2',
        region: 'EU',
        plan: 'Basic',
      };

      // Interleave evaluations to test state isolation
      const result1a = evaluator.evaluate(context1);
      const result2a = evaluator.evaluate(context2);
      const result1b = evaluator.evaluate(context1);
      const result2b = evaluator.evaluate(context2);

      // Results should be consistent regardless of evaluation order
      expect(result1a).toEqual(result1b);
      expect(result2a).toEqual(result2b);
      expect(result1a).not.toEqual(result2a);
    });
  });
});
