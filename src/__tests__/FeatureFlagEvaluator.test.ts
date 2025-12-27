/**
 * Unit tests for FeatureFlagEvaluator
 */

import { FeatureFlagEvaluator } from '../FeatureFlagEvaluator';
import {
  UserContext,
  EvaluationResult,
  FeatureFlagConfiguration,
} from '../types';

describe('FeatureFlagEvaluator', () => {
  let evaluator: FeatureFlagEvaluator;
  let testConfiguration: FeatureFlagConfiguration;

  beforeEach(() => {
    evaluator = new FeatureFlagEvaluator();

    // Set up test configuration
    testConfiguration = {
      supportedPlans: ['Basic', 'Pro'],
      supportedRegions: ['US', 'EU'],
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

  describe('evaluate', () => {
    it('should return success with features for valid Pro US user', () => {
      const context: UserContext = {
        userId: 'user123',
        region: 'US',
        plan: 'Pro',
      };

      const result: EvaluationResult = evaluator.evaluate(context);

      expect(result.success).toBe(true);
      expect(result.features).toBeDefined();
      expect(result.features).toContain('advanced-analytics');
      expect(result.features).toContain('premium-support');
      expect(result.features).toContain('api-access');
      expect(result.features).toContain('us-payment-gateway');
      expect(result.features).toContain('us-compliance-tools');
      expect(result.error).toBeUndefined();
    });

    it('should return success with features for valid Basic EU user', () => {
      const context: UserContext = {
        userId: 'user456',
        region: 'EU',
        plan: 'Basic',
      };

      const result: EvaluationResult = evaluator.evaluate(context);

      expect(result.success).toBe(true);
      expect(result.features).toBeDefined();
      expect(result.features).toContain('basic-dashboard');
      expect(result.features).toContain('standard-support');
      expect(result.features).toContain('gdpr-tools');
      expect(result.features).toContain('eu-payment-gateway');
      expect(result.error).toBeUndefined();
    });

    it('should return error for invalid userId', () => {
      const context: UserContext = {
        userId: '',
        region: 'US',
        plan: 'Pro',
      };

      const result: EvaluationResult = evaluator.evaluate(context);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid or empty userId');
      expect(result.features).toBeUndefined();
    });

    it('should return error for invalid region', () => {
      const context: UserContext = {
        userId: 'user123',
        region: 'INVALID',
        plan: 'Pro',
      };

      const result: EvaluationResult = evaluator.evaluate(context);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unsupported region');
      expect(result.features).toBeUndefined();
    });

    it('should return error for invalid plan', () => {
      const context: UserContext = {
        userId: 'user123',
        region: 'US',
        plan: 'INVALID',
      };

      const result: EvaluationResult = evaluator.evaluate(context);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unsupported plan');
      expect(result.features).toBeUndefined();
    });

    it('should return error for null context', () => {
      const result: EvaluationResult = evaluator.evaluate(null as any);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Missing or null user context');
      expect(result.features).toBeUndefined();
    });

    it('should return error when configuration is not loaded', () => {
      const freshEvaluator = new FeatureFlagEvaluator();
      const context: UserContext = {
        userId: 'user123',
        region: 'US',
        plan: 'Pro',
      };

      const result: EvaluationResult = freshEvaluator.evaluate(context);

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        'Configuration not loaded - call loadConfiguration first'
      );
      expect(result.features).toBeUndefined();
    });

    it('should return features in sorted order', () => {
      const context: UserContext = {
        userId: 'user123',
        region: 'US',
        plan: 'Pro',
      };

      const result: EvaluationResult = evaluator.evaluate(context);

      expect(result.success).toBe(true);
      expect(result.features).toBeDefined();

      // Check that features are sorted alphabetically
      const sortedFeatures = [...result.features!].sort();
      expect(result.features).toEqual(sortedFeatures);
    });

    it('should return unique features (no duplicates)', () => {
      const context: UserContext = {
        userId: 'user123',
        region: 'US',
        plan: 'Pro',
      };

      const result: EvaluationResult = evaluator.evaluate(context);

      expect(result.success).toBe(true);
      expect(result.features).toBeDefined();

      // Check that all features are unique
      const uniqueFeatures = [...new Set(result.features!)];
      expect(result.features).toEqual(uniqueFeatures);
    });
  });

  describe('getAvailableFeatures', () => {
    it('should return complete feature list in sorted order', () => {
      const features = evaluator.getAvailableFeatures();

      expect(features).toBeDefined();
      expect(features.length).toBe(9); // Total number of features in test configuration

      // Test that all expected features are present
      const expectedFeatures = [
        'advanced-analytics',
        'api-access',
        'basic-dashboard',
        'eu-payment-gateway',
        'gdpr-tools',
        'premium-support',
        'standard-support',
        'us-compliance-tools',
        'us-payment-gateway',
      ];

      expectedFeatures.forEach(feature => {
        expect(features).toContain(feature);
      });

      // Check that features are sorted alphabetically
      const sortedFeatures = [...features].sort();
      expect(features).toEqual(sortedFeatures);
    });

    it('should return empty array when configuration is not loaded', () => {
      const freshEvaluator = new FeatureFlagEvaluator();
      const features = freshEvaluator.getAvailableFeatures();
      expect(features).toEqual([]);
    });
  });

  describe('getSupportedPlans', () => {
    it('should return supported plans', () => {
      const plans = evaluator.getSupportedPlans();

      expect(plans).toBeDefined();
      expect(plans).toEqual(['Basic', 'Pro']);
    });

    it('should return empty array when configuration is not loaded', () => {
      const freshEvaluator = new FeatureFlagEvaluator();
      const plans = freshEvaluator.getSupportedPlans();
      expect(plans).toEqual([]);
    });
  });

  describe('getSupportedRegions', () => {
    it('should return supported regions', () => {
      const regions = evaluator.getSupportedRegions();

      expect(regions).toBeDefined();
      expect(regions).toEqual(['US', 'EU']);
    });

    it('should return empty array when configuration is not loaded', () => {
      const freshEvaluator = new FeatureFlagEvaluator();
      const regions = freshEvaluator.getSupportedRegions();
      expect(regions).toEqual([]);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete evaluation flow with all components working together', () => {
      // Test that InputValidator, RuleEngine, and output formatting all work together
      const testCases = [
        {
          context: { userId: 'user1', region: 'US', plan: 'Pro' },
          expectedFeatures: [
            'advanced-analytics',
            'api-access',
            'premium-support',
            'us-compliance-tools',
            'us-payment-gateway',
          ],
          shouldSucceed: true,
        },
        {
          context: { userId: 'user2', region: 'EU', plan: 'Basic' },
          expectedFeatures: [
            'basic-dashboard',
            'eu-payment-gateway',
            'gdpr-tools',
            'standard-support',
          ],
          shouldSucceed: true,
        },
        {
          context: { userId: '', region: 'US', plan: 'Pro' },
          expectedFeatures: [],
          shouldSucceed: false,
          expectedError: 'Invalid or empty userId',
        },
        {
          context: { userId: 'user3', region: 'INVALID', plan: 'Pro' },
          expectedFeatures: [],
          shouldSucceed: false,
          expectedError: 'Unsupported region',
        },
      ];

      testCases.forEach(
        ({ context, expectedFeatures, shouldSucceed, expectedError }) => {
          const result = evaluator.evaluate(context);

          expect(result.success).toBe(shouldSucceed);

          if (shouldSucceed) {
            expect(result.features).toBeDefined();
            expect(result.features).toEqual(expectedFeatures);
            expect(result.error).toBeUndefined();
          } else {
            expect(result.features).toBeUndefined();
            expect(result.error).toBe(expectedError);
          }
        }
      );
    });

    it('should maintain consistent behavior across multiple evaluations', () => {
      const context: UserContext = {
        userId: 'consistent-user',
        region: 'US',
        plan: 'Pro',
      };

      // Run the same evaluation multiple times
      const results = Array.from({ length: 5 }, () =>
        evaluator.evaluate(context)
      );

      // All results should be identical
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.features).toEqual(results[0].features);
        expect(result.error).toBeUndefined();
      });
    });

    it('should properly propagate errors from validation through the entire flow', () => {
      const invalidContexts = [
        null,
        undefined,
        { userId: null, region: 'US', plan: 'Pro' },
        { userId: 'user', region: null, plan: 'Pro' },
        { userId: 'user', region: 'US', plan: null },
        { userId: '   ', region: 'US', plan: 'Pro' },
        { userId: 'user', region: 'INVALID', plan: 'Pro' },
        { userId: 'user', region: 'US', plan: 'INVALID' },
      ];

      invalidContexts.forEach(context => {
        const result = evaluator.evaluate(context as any);
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.features).toBeUndefined();
      });
    });
  });
});
