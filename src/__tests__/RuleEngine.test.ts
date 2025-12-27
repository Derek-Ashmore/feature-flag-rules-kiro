/**
 * Unit tests for RuleEngine implementation
 *
 * These tests focus on specific examples and edge cases for individual rule matching
 * and feature combination logic.
 */

import { RuleEngine } from '../engine/RuleEngine';
import {
  UserContext,
  FeatureRule,
  FeatureFlagConfiguration,
  FeatureDefinition,
} from '../types';

describe('RuleEngine Unit Tests', () => {
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

  describe('Individual rule matching logic', () => {
    test('should match Pro plan rule correctly', () => {
      const context: UserContext = {
        userId: 'user123',
        region: 'US',
        plan: 'Pro',
      };

      const features = ruleEngine.evaluateRules(context);

      // Should include Pro plan features
      expect(features).toContain('advanced-analytics');
      expect(features).toContain('premium-support');
      expect(features).toContain('api-access');
    });

    test('should match Basic plan rule correctly', () => {
      const context: UserContext = {
        userId: 'user456',
        region: 'EU',
        plan: 'Basic',
      };

      const features = ruleEngine.evaluateRules(context);

      // Should include Basic plan features
      expect(features).toContain('basic-dashboard');
      expect(features).toContain('standard-support');

      // Should NOT include Pro plan features
      expect(features).not.toContain('advanced-analytics');
      expect(features).not.toContain('premium-support');
      expect(features).not.toContain('api-access');
    });

    test('should match US region rule correctly', () => {
      const context: UserContext = {
        userId: 'user789',
        region: 'US',
        plan: 'Basic',
      };

      const features = ruleEngine.evaluateRules(context);

      // Should include US region features
      expect(features).toContain('us-payment-gateway');
      expect(features).toContain('us-compliance-tools');

      // Should NOT include EU region features
      expect(features).not.toContain('gdpr-tools');
      expect(features).not.toContain('eu-payment-gateway');
    });

    test('should match EU region rule correctly', () => {
      const context: UserContext = {
        userId: 'user101',
        region: 'EU',
        plan: 'Pro',
      };

      const features = ruleEngine.evaluateRules(context);

      // Should include EU region features
      expect(features).toContain('gdpr-tools');
      expect(features).toContain('eu-payment-gateway');

      // Should NOT include US region features
      expect(features).not.toContain('us-payment-gateway');
      expect(features).not.toContain('us-compliance-tools');
    });

    test('should not match any rules for unsupported plan', () => {
      // Create a custom rule engine with test rules to verify no matching behavior
      const testRules: FeatureRule[] = [
        {
          id: 'test-rule',
          conditions: [
            { attribute: 'plan', operator: 'equals', value: 'Enterprise' },
          ],
          features: ['enterprise-feature'],
        },
      ];

      const customConfiguration = {
        ...testConfiguration,
        rules: testRules,
      };

      const testEngine = new RuleEngine();
      testEngine.setConfiguration(customConfiguration);

      const context: UserContext = {
        userId: 'user123',
        region: 'US',
        plan: 'Basic',
      };

      const features = testEngine.evaluateRules(context);

      // Should return empty array when no rules match
      expect(features).toEqual([]);
    });

    test('should not match any rules for unsupported region', () => {
      // Create a custom rule engine with test rules to verify no matching behavior
      const testRules: FeatureRule[] = [
        {
          id: 'test-rule',
          conditions: [
            { attribute: 'region', operator: 'equals', value: 'ASIA' },
          ],
          features: ['asia-feature'],
        },
      ];

      const customConfiguration = {
        ...testConfiguration,
        rules: testRules,
      };

      const testEngine = new RuleEngine();
      testEngine.setConfiguration(customConfiguration);

      const context: UserContext = {
        userId: 'user123',
        region: 'US',
        plan: 'Pro',
      };

      const features = testEngine.evaluateRules(context);

      // Should return empty array when no rules match
      expect(features).toEqual([]);
    });
  });

  describe('Feature combination from multiple rules', () => {
    test('should combine Pro plan and US region features', () => {
      const context: UserContext = {
        userId: 'user123',
        region: 'US',
        plan: 'Pro',
      };

      const features = ruleEngine.evaluateRules(context);

      // Should include features from both Pro plan rule and US region rule
      const expectedFeatures = [
        // Pro plan features
        'advanced-analytics',
        'premium-support',
        'api-access',
        // US region features
        'us-payment-gateway',
        'us-compliance-tools',
      ];

      expectedFeatures.forEach(feature => {
        expect(features).toContain(feature);
      });

      // Should have exactly these features (no more, no less)
      expect(features).toHaveLength(5);
    });

    test('should combine Pro plan and EU region features', () => {
      const context: UserContext = {
        userId: 'user456',
        region: 'EU',
        plan: 'Pro',
      };

      const features = ruleEngine.evaluateRules(context);

      // Should include features from both Pro plan rule and EU region rule
      const expectedFeatures = [
        // Pro plan features
        'advanced-analytics',
        'premium-support',
        'api-access',
        // EU region features
        'gdpr-tools',
        'eu-payment-gateway',
      ];

      expectedFeatures.forEach(feature => {
        expect(features).toContain(feature);
      });

      // Should have exactly these features
      expect(features).toHaveLength(5);
    });

    test('should combine Basic plan and US region features', () => {
      const context: UserContext = {
        userId: 'user789',
        region: 'US',
        plan: 'Basic',
      };

      const features = ruleEngine.evaluateRules(context);

      // Should include features from both Basic plan rule and US region rule
      const expectedFeatures = [
        // Basic plan features
        'basic-dashboard',
        'standard-support',
        // US region features
        'us-payment-gateway',
        'us-compliance-tools',
      ];

      expectedFeatures.forEach(feature => {
        expect(features).toContain(feature);
      });

      // Should have exactly these features
      expect(features).toHaveLength(4);
    });

    test('should combine Basic plan and EU region features', () => {
      const context: UserContext = {
        userId: 'user101',
        region: 'EU',
        plan: 'Basic',
      };

      const features = ruleEngine.evaluateRules(context);

      // Should include features from both Basic plan rule and EU region rule
      const expectedFeatures = [
        // Basic plan features
        'basic-dashboard',
        'standard-support',
        // EU region features
        'gdpr-tools',
        'eu-payment-gateway',
      ];

      expectedFeatures.forEach(feature => {
        expect(features).toContain(feature);
      });

      // Should have exactly these features
      expect(features).toHaveLength(4);
    });

    test('should handle duplicate features correctly', () => {
      // Create a custom rule engine with overlapping features to test deduplication
      const testRules: FeatureRule[] = [
        {
          id: 'rule1',
          conditions: [{ attribute: 'plan', operator: 'equals', value: 'Pro' }],
          features: ['feature-a', 'feature-b', 'shared-feature'],
        },
        {
          id: 'rule2',
          conditions: [
            { attribute: 'region', operator: 'equals', value: 'US' },
          ],
          features: ['feature-c', 'shared-feature'],
        },
      ];

      const customConfiguration = {
        ...testConfiguration,
        rules: testRules,
      };

      const testEngine = new RuleEngine();
      testEngine.setConfiguration(customConfiguration);

      const context: UserContext = {
        userId: 'user123',
        region: 'US',
        plan: 'Pro',
      };

      const features = testEngine.evaluateRules(context);

      // Should include all unique features (shared-feature should appear only once)
      expect(features).toContain('feature-a');
      expect(features).toContain('feature-b');
      expect(features).toContain('feature-c');
      expect(features).toContain('shared-feature');

      // Should have exactly 4 unique features
      expect(features).toHaveLength(4);

      // Should not have duplicates
      const uniqueFeatures = [...new Set(features)];
      expect(features).toEqual(uniqueFeatures);
    });

    test('should return features in sorted order', () => {
      const context: UserContext = {
        userId: 'user123',
        region: 'US',
        plan: 'Pro',
      };

      const features = ruleEngine.evaluateRules(context);

      // Features should be in alphabetical order
      const sortedFeatures = [...features].sort();
      expect(features).toEqual(sortedFeatures);
    });

    test('should handle rules with multiple conditions', () => {
      // Create a custom rule engine with multi-condition rules
      const testRules: FeatureRule[] = [
        {
          id: 'multi-condition-rule',
          conditions: [
            { attribute: 'plan', operator: 'equals', value: 'Pro' },
            { attribute: 'region', operator: 'equals', value: 'US' },
          ],
          features: ['exclusive-pro-us-feature'],
        },
        {
          id: 'single-condition-rule',
          conditions: [{ attribute: 'plan', operator: 'equals', value: 'Pro' }],
          features: ['general-pro-feature'],
        },
      ];

      const customConfiguration = {
        ...testConfiguration,
        rules: testRules,
      };

      const testEngine = new RuleEngine();
      testEngine.setConfiguration(customConfiguration);

      // Test context that matches both rules
      const matchingContext: UserContext = {
        userId: 'user123',
        region: 'US',
        plan: 'Pro',
      };

      const matchingFeatures = testEngine.evaluateRules(matchingContext);
      expect(matchingFeatures).toContain('exclusive-pro-us-feature');
      expect(matchingFeatures).toContain('general-pro-feature');
      expect(matchingFeatures).toHaveLength(2);

      // Test context that matches only the single-condition rule
      const partialMatchContext: UserContext = {
        userId: 'user456',
        region: 'EU',
        plan: 'Pro',
      };

      const partialFeatures = testEngine.evaluateRules(partialMatchContext);
      expect(partialFeatures).not.toContain('exclusive-pro-us-feature');
      expect(partialFeatures).toContain('general-pro-feature');
      expect(partialFeatures).toHaveLength(1);
    });

    test('should handle rules with "in" operator', () => {
      // Create a custom rule engine with "in" operator rules
      const testRules: FeatureRule[] = [
        {
          id: 'multi-region-rule',
          conditions: [
            { attribute: 'region', operator: 'in', value: ['US', 'EU'] },
          ],
          features: ['global-feature'],
        },
        {
          id: 'multi-plan-rule',
          conditions: [
            { attribute: 'plan', operator: 'in', value: ['Pro', 'Enterprise'] },
          ],
          features: ['premium-feature'],
        },
      ];

      const customConfiguration = {
        ...testConfiguration,
        rules: testRules,
      };

      const testEngine = new RuleEngine();
      testEngine.setConfiguration(customConfiguration);

      // Test US region (should match multi-region rule)
      const usContext: UserContext = {
        userId: 'user123',
        region: 'US',
        plan: 'Basic',
      };

      const usFeatures = testEngine.evaluateRules(usContext);
      expect(usFeatures).toContain('global-feature');
      expect(usFeatures).not.toContain('premium-feature');

      // Test Pro plan (should match both rules)
      const proContext: UserContext = {
        userId: 'user456',
        region: 'EU',
        plan: 'Pro',
      };

      const proFeatures = testEngine.evaluateRules(proContext);
      expect(proFeatures).toContain('global-feature');
      expect(proFeatures).toContain('premium-feature');
      expect(proFeatures).toHaveLength(2);
    });
  });

  describe('Edge cases', () => {
    test('should return empty array when no rules match', () => {
      // Create a custom rule engine with no matching rules
      const testRules: FeatureRule[] = [
        {
          id: 'non-matching-rule',
          conditions: [
            { attribute: 'plan', operator: 'equals', value: 'Enterprise' },
          ],
          features: ['enterprise-feature'],
        },
      ];

      const customConfiguration = {
        ...testConfiguration,
        rules: testRules,
      };

      const testEngine = new RuleEngine();
      testEngine.setConfiguration(customConfiguration);

      const context: UserContext = {
        userId: 'user123',
        region: 'US',
        plan: 'Basic',
      };

      const features = testEngine.evaluateRules(context);
      expect(features).toEqual([]);
    });

    test('should handle empty rules array', () => {
      const customConfiguration = {
        ...testConfiguration,
        rules: [],
      };

      const emptyEngine = new RuleEngine();
      emptyEngine.setConfiguration(customConfiguration);

      const context: UserContext = {
        userId: 'user123',
        region: 'US',
        plan: 'Pro',
      };

      const features = emptyEngine.evaluateRules(context);
      expect(features).toEqual([]);
    });

    test('should handle rules with empty features array', () => {
      const testRules: FeatureRule[] = [
        {
          id: 'empty-features-rule',
          conditions: [{ attribute: 'plan', operator: 'equals', value: 'Pro' }],
          features: [],
        },
      ];

      const customConfiguration = {
        ...testConfiguration,
        rules: testRules,
      };

      const testEngine = new RuleEngine();
      testEngine.setConfiguration(customConfiguration);

      const context: UserContext = {
        userId: 'user123',
        region: 'US',
        plan: 'Pro',
      };

      const features = testEngine.evaluateRules(context);
      expect(features).toEqual([]);
    });

    test('should throw error when configuration is not set', () => {
      const engineWithoutConfig = new RuleEngine();

      const context: UserContext = {
        userId: 'user123',
        region: 'US',
        plan: 'Pro',
      };

      expect(() => {
        engineWithoutConfig.evaluateRules(context);
      }).toThrow('Configuration not loaded - call setConfiguration first');
    });
  });
});
