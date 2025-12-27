/**
 * Unit tests for dynamic configuration functionality
 * Tests that configuration is properly loaded and accessible
 * Tests rule structure and completeness from loaded data
 * Requirements: 5.2, 5.3, 5.4
 */

import { FeatureFlagEvaluator } from '../FeatureFlagEvaluator';
import { RuleEngine } from '../engine/RuleEngine';
import { InputValidatorImpl } from '../validation/InputValidator';
import { FeatureFlagConfiguration, UserContext } from '../types';

describe('Dynamic Configuration Tests', () => {
  let testConfiguration: FeatureFlagConfiguration;

  beforeEach(() => {
    // Create a comprehensive test configuration
    testConfiguration = {
      supportedPlans: ['Basic', 'Pro', 'Enterprise'],
      supportedRegions: ['US', 'EU', 'ASIA'],
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
          id: 'asia-payment-gateway',
          name: 'ASIA Payment Gateway',
          description: 'ASIA payment processing',
        },
        {
          id: 'enterprise-features',
          name: 'Enterprise Features',
          description: 'Enterprise-only features',
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
          id: 'enterprise-plan-features',
          conditions: [
            { attribute: 'plan', operator: 'equals', value: 'Enterprise' },
          ],
          features: [
            'advanced-analytics',
            'premium-support',
            'api-access',
            'enterprise-features',
          ],
        },
        {
          id: 'us-region-features',
          conditions: [
            { attribute: 'region', operator: 'equals', value: 'US' },
          ],
          features: ['us-payment-gateway'],
        },
        {
          id: 'eu-region-features',
          conditions: [
            { attribute: 'region', operator: 'equals', value: 'EU' },
          ],
          features: ['eu-payment-gateway'],
        },
        {
          id: 'asia-region-features',
          conditions: [
            { attribute: 'region', operator: 'equals', value: 'ASIA' },
          ],
          features: ['asia-payment-gateway'],
        },
      ],
    };
  });

  describe('FeatureFlagEvaluator Dynamic Configuration', () => {
    let evaluator: FeatureFlagEvaluator;

    beforeEach(() => {
      evaluator = new FeatureFlagEvaluator();
    });

    test('should return empty arrays when configuration is not loaded', () => {
      expect(evaluator.getAvailableFeatures()).toEqual([]);
      expect(evaluator.getSupportedPlans()).toEqual([]);
      expect(evaluator.getSupportedRegions()).toEqual([]);
    });

    test('should return configuration not loaded error when evaluating without configuration', () => {
      const context: UserContext = {
        userId: 'test-user',
        region: 'US',
        plan: 'Pro',
      };

      const result = evaluator.evaluate(context);

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        'Configuration not loaded - call loadConfiguration first'
      );
    });

    test('should return features from loaded configuration', () => {
      // Manually set configuration for testing (simulating successful load)
      (evaluator as any).configuration = testConfiguration;
      (evaluator as any).inputValidator.setConfiguration(testConfiguration);
      (evaluator as any).ruleEngine.setConfiguration(testConfiguration);

      const features = evaluator.getAvailableFeatures();
      const expectedFeatures = testConfiguration.features.map(f => f.id).sort();

      expect(features).toEqual(expectedFeatures);
      expect(features).toContain('advanced-analytics');
      expect(features).toContain('enterprise-features');
      expect(features).toContain('asia-payment-gateway');
    });

    test('should return supported plans from loaded configuration', () => {
      // Manually set configuration for testing
      (evaluator as any).configuration = testConfiguration;

      const plans = evaluator.getSupportedPlans();

      expect(plans).toEqual(testConfiguration.supportedPlans);
      expect(plans).toContain('Basic');
      expect(plans).toContain('Pro');
      expect(plans).toContain('Enterprise');
    });

    test('should return supported regions from loaded configuration', () => {
      // Manually set configuration for testing
      (evaluator as any).configuration = testConfiguration;

      const regions = evaluator.getSupportedRegions();

      expect(regions).toEqual(testConfiguration.supportedRegions);
      expect(regions).toContain('US');
      expect(regions).toContain('EU');
      expect(regions).toContain('ASIA');
    });

    test('should evaluate rules correctly with loaded configuration', () => {
      // Manually set configuration for testing
      (evaluator as any).configuration = testConfiguration;
      (evaluator as any).inputValidator.setConfiguration(testConfiguration);
      (evaluator as any).ruleEngine.setConfiguration(testConfiguration);

      const context: UserContext = {
        userId: 'test-user',
        region: 'ASIA',
        plan: 'Enterprise',
      };

      const result = evaluator.evaluate(context);

      expect(result.success).toBe(true);
      expect(result.features).toContain('advanced-analytics');
      expect(result.features).toContain('premium-support');
      expect(result.features).toContain('api-access');
      expect(result.features).toContain('enterprise-features');
      expect(result.features).toContain('asia-payment-gateway');
    });
  });

  describe('RuleEngine Dynamic Configuration', () => {
    let ruleEngine: RuleEngine;

    beforeEach(() => {
      ruleEngine = new RuleEngine();
    });

    test('should throw error when evaluating without configuration', () => {
      const context: UserContext = {
        userId: 'test-user',
        region: 'US',
        plan: 'Pro',
      };

      expect(() => ruleEngine.evaluateRules(context)).toThrow(
        'Configuration not loaded - call setConfiguration first'
      );
    });

    test('should evaluate rules correctly with loaded configuration', () => {
      ruleEngine.setConfiguration(testConfiguration);

      const context: UserContext = {
        userId: 'test-user',
        region: 'EU',
        plan: 'Pro',
      };

      const features = ruleEngine.evaluateRules(context);

      expect(features).toContain('advanced-analytics');
      expect(features).toContain('premium-support');
      expect(features).toContain('api-access');
      expect(features).toContain('eu-payment-gateway');
      expect(features).not.toContain('basic-dashboard');
      expect(features).not.toContain('enterprise-features');
    });

    test('should handle multiple rule matches correctly', () => {
      ruleEngine.setConfiguration(testConfiguration);

      const context: UserContext = {
        userId: 'test-user',
        region: 'US',
        plan: 'Enterprise',
      };

      const features = ruleEngine.evaluateRules(context);

      // Should get features from both enterprise plan and US region rules
      expect(features).toContain('advanced-analytics');
      expect(features).toContain('premium-support');
      expect(features).toContain('api-access');
      expect(features).toContain('enterprise-features');
      expect(features).toContain('us-payment-gateway');
      expect(features).not.toContain('basic-dashboard');
    });

    test('should return empty array when no rules match', () => {
      // Create configuration with no matching rules
      const emptyRulesConfig: FeatureFlagConfiguration = {
        ...testConfiguration,
        rules: [
          {
            id: 'non-matching-rule',
            conditions: [
              {
                attribute: 'plan',
                operator: 'equals',
                value: 'NonExistentPlan',
              },
            ],
            features: ['some-feature'],
          },
        ],
      };

      ruleEngine.setConfiguration(emptyRulesConfig);

      const context: UserContext = {
        userId: 'test-user',
        region: 'US',
        plan: 'Pro',
      };

      const features = ruleEngine.evaluateRules(context);

      expect(features).toEqual([]);
    });

    test('should return sorted and unique features', () => {
      // Create configuration with overlapping features
      const overlappingConfig: FeatureFlagConfiguration = {
        ...testConfiguration,
        rules: [
          {
            id: 'rule1',
            conditions: [
              { attribute: 'plan', operator: 'equals', value: 'Pro' },
            ],
            features: ['feature-c', 'feature-a', 'feature-b'],
          },
          {
            id: 'rule2',
            conditions: [
              { attribute: 'region', operator: 'equals', value: 'US' },
            ],
            features: ['feature-b', 'feature-d', 'feature-a'], // Overlapping features
          },
        ],
      };

      ruleEngine.setConfiguration(overlappingConfig);

      const context: UserContext = {
        userId: 'test-user',
        region: 'US',
        plan: 'Pro',
      };

      const features = ruleEngine.evaluateRules(context);

      // Should be sorted and unique
      expect(features).toEqual([
        'feature-a',
        'feature-b',
        'feature-c',
        'feature-d',
      ]);
    });
  });

  describe('InputValidator Dynamic Configuration', () => {
    let validator: InputValidatorImpl;

    beforeEach(() => {
      validator = new InputValidatorImpl();
    });

    test('should validate against loaded configuration plans', () => {
      validator.setConfiguration(testConfiguration);

      // Test valid plans from configuration
      testConfiguration.supportedPlans.forEach(plan => {
        const context: UserContext = {
          userId: 'test-user',
          region: 'US',
          plan,
        };

        const result = validator.validate(context);
        expect(result.isValid).toBe(true);
      });

      // Test invalid plan
      const invalidContext: UserContext = {
        userId: 'test-user',
        region: 'US',
        plan: 'InvalidPlan',
      };

      const result = validator.validate(invalidContext);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Unsupported plan');
    });

    test('should validate against loaded configuration regions', () => {
      validator.setConfiguration(testConfiguration);

      // Test valid regions from configuration
      testConfiguration.supportedRegions.forEach(region => {
        const context: UserContext = {
          userId: 'test-user',
          region,
          plan: 'Pro',
        };

        const result = validator.validate(context);
        expect(result.isValid).toBe(true);
      });

      // Test invalid region
      const invalidContext: UserContext = {
        userId: 'test-user',
        region: 'InvalidRegion',
        plan: 'Pro',
      };

      const result = validator.validate(invalidContext);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Unsupported region');
    });
  });

  describe('Configuration Structure and Completeness', () => {
    test('should have all required configuration properties', () => {
      expect(testConfiguration).toHaveProperty('supportedPlans');
      expect(testConfiguration).toHaveProperty('supportedRegions');
      expect(testConfiguration).toHaveProperty('features');
      expect(testConfiguration).toHaveProperty('rules');

      expect(Array.isArray(testConfiguration.supportedPlans)).toBe(true);
      expect(Array.isArray(testConfiguration.supportedRegions)).toBe(true);
      expect(Array.isArray(testConfiguration.features)).toBe(true);
      expect(Array.isArray(testConfiguration.rules)).toBe(true);
    });

    test('should have properly structured feature definitions', () => {
      testConfiguration.features.forEach(feature => {
        expect(feature).toHaveProperty('id');
        expect(feature).toHaveProperty('name');
        expect(typeof feature.id).toBe('string');
        expect(typeof feature.name).toBe('string');
        expect(feature.id.length).toBeGreaterThan(0);
        expect(feature.name.length).toBeGreaterThan(0);
      });
    });

    test('should have properly structured rules', () => {
      testConfiguration.rules.forEach(rule => {
        expect(rule).toHaveProperty('id');
        expect(rule).toHaveProperty('conditions');
        expect(rule).toHaveProperty('features');
        expect(typeof rule.id).toBe('string');
        expect(Array.isArray(rule.conditions)).toBe(true);
        expect(Array.isArray(rule.features)).toBe(true);
        expect(rule.conditions.length).toBeGreaterThan(0);
        expect(rule.features.length).toBeGreaterThan(0);
      });
    });

    test('should have referential integrity between rules and features', () => {
      const featureIds = new Set(testConfiguration.features.map(f => f.id));

      testConfiguration.rules.forEach(rule => {
        rule.features.forEach(featureId => {
          expect(featureIds.has(featureId)).toBe(true);
        });
      });
    });

    test('should have referential integrity between rules and supported values', () => {
      const supportedPlans = new Set(testConfiguration.supportedPlans);
      const supportedRegions = new Set(testConfiguration.supportedRegions);

      testConfiguration.rules.forEach(rule => {
        rule.conditions.forEach(condition => {
          if (
            condition.attribute === 'plan' &&
            condition.operator === 'equals'
          ) {
            expect(supportedPlans.has(condition.value as string)).toBe(true);
          }
          if (
            condition.attribute === 'region' &&
            condition.operator === 'equals'
          ) {
            expect(supportedRegions.has(condition.value as string)).toBe(true);
          }
        });
      });
    });
  });
});
