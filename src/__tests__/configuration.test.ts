/**
 * Unit tests for configuration constants
 * Tests that configuration contains expected values and has proper structure
 * Requirements: 4.2, 4.3, 4.4
 */

import {
  SUPPORTED_PLANS,
  SUPPORTED_REGIONS,
  ALL_FEATURES,
  FEATURE_RULES,
  SupportedPlan,
  SupportedRegion,
  FeatureIdentifier,
} from '../config/constants';

describe('Configuration Constants', () => {
  describe('Supported Plans (Requirement 4.3)', () => {
    test('should contain exactly Basic and Pro plans', () => {
      expect(SUPPORTED_PLANS).toEqual(['Basic', 'Pro']);
    });

    test('should have exactly 2 supported plans', () => {
      expect(SUPPORTED_PLANS).toHaveLength(2);
    });

    test('should contain Basic plan', () => {
      expect(SUPPORTED_PLANS).toContain('Basic');
    });

    test('should contain Pro plan', () => {
      expect(SUPPORTED_PLANS).toContain('Pro');
    });
  });

  describe('Supported Regions (Requirement 4.4)', () => {
    test('should contain exactly US and EU regions', () => {
      expect(SUPPORTED_REGIONS).toEqual(['US', 'EU']);
    });

    test('should have exactly 2 supported regions', () => {
      expect(SUPPORTED_REGIONS).toHaveLength(2);
    });

    test('should contain US region', () => {
      expect(SUPPORTED_REGIONS).toContain('US');
    });

    test('should contain EU region', () => {
      expect(SUPPORTED_REGIONS).toContain('EU');
    });
  });

  describe('Available Features (Requirement 4.2)', () => {
    test('should contain all expected features', () => {
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
      expect(ALL_FEATURES).toEqual(expectedFeatures);
    });

    test('should have exactly 9 features', () => {
      expect(ALL_FEATURES).toHaveLength(9);
    });

    test('should be sorted alphabetically', () => {
      const sortedFeatures = [...ALL_FEATURES].sort();
      expect(ALL_FEATURES).toEqual(sortedFeatures);
    });

    test('should contain no duplicate features', () => {
      const uniqueFeatures = [...new Set(ALL_FEATURES)];
      expect(ALL_FEATURES).toHaveLength(uniqueFeatures.length);
    });

    test('should contain premium features', () => {
      expect(ALL_FEATURES).toContain('advanced-analytics');
      expect(ALL_FEATURES).toContain('premium-support');
      expect(ALL_FEATURES).toContain('api-access');
    });

    test('should contain basic features', () => {
      expect(ALL_FEATURES).toContain('basic-dashboard');
      expect(ALL_FEATURES).toContain('standard-support');
    });

    test('should contain region-specific features', () => {
      expect(ALL_FEATURES).toContain('us-payment-gateway');
      expect(ALL_FEATURES).toContain('us-compliance-tools');
      expect(ALL_FEATURES).toContain('gdpr-tools');
      expect(ALL_FEATURES).toContain('eu-payment-gateway');
    });
  });

  describe('Feature Rules Structure', () => {
    test('should have exactly 4 feature rules', () => {
      expect(FEATURE_RULES).toHaveLength(4);
    });

    test('should contain all expected rule IDs', () => {
      const ruleIds = FEATURE_RULES.map(rule => rule.id);
      expect(ruleIds).toContain('pro-plan-features');
      expect(ruleIds).toContain('basic-plan-features');
      expect(ruleIds).toContain('us-region-features');
      expect(ruleIds).toContain('eu-region-features');
    });

    test('should have unique rule IDs', () => {
      const ruleIds = FEATURE_RULES.map(rule => rule.id);
      const uniqueIds = [...new Set(ruleIds)];
      expect(ruleIds).toHaveLength(uniqueIds.length);
    });

    test('each rule should have required structure', () => {
      FEATURE_RULES.forEach(rule => {
        expect(rule).toHaveProperty('id');
        expect(rule).toHaveProperty('conditions');
        expect(rule).toHaveProperty('features');

        expect(typeof rule.id).toBe('string');
        expect(Array.isArray(rule.conditions)).toBe(true);
        expect(Array.isArray(rule.features)).toBe(true);

        expect(rule.id.length).toBeGreaterThan(0);
        expect(rule.conditions.length).toBeGreaterThan(0);
        expect(rule.features.length).toBeGreaterThan(0);
      });
    });

    test('each condition should have valid structure', () => {
      FEATURE_RULES.forEach(rule => {
        rule.conditions.forEach(condition => {
          expect(condition).toHaveProperty('attribute');
          expect(condition).toHaveProperty('operator');
          expect(condition).toHaveProperty('value');

          expect(['plan', 'region', 'userId']).toContain(condition.attribute);
          expect(['equals', 'in']).toContain(condition.operator);
          expect(
            typeof condition.value === 'string' ||
              Array.isArray(condition.value)
          ).toBe(true);
        });
      });
    });

    test('all rule features should exist in ALL_FEATURES', () => {
      FEATURE_RULES.forEach(rule => {
        rule.features.forEach(feature => {
          expect(ALL_FEATURES).toContain(feature as FeatureIdentifier);
        });
      });
    });
  });

  describe('Specific Rule Content', () => {
    test('pro-plan-features rule should be correctly configured', () => {
      const proRule = FEATURE_RULES.find(
        rule => rule.id === 'pro-plan-features'
      );
      expect(proRule).toBeDefined();
      expect(proRule!.conditions).toEqual([
        { attribute: 'plan', operator: 'equals', value: 'Pro' },
      ]);
      expect(proRule!.features).toEqual([
        'advanced-analytics',
        'premium-support',
        'api-access',
      ]);
    });

    test('basic-plan-features rule should be correctly configured', () => {
      const basicRule = FEATURE_RULES.find(
        rule => rule.id === 'basic-plan-features'
      );
      expect(basicRule).toBeDefined();
      expect(basicRule!.conditions).toEqual([
        { attribute: 'plan', operator: 'equals', value: 'Basic' },
      ]);
      expect(basicRule!.features).toEqual([
        'basic-dashboard',
        'standard-support',
      ]);
    });

    test('us-region-features rule should be correctly configured', () => {
      const usRule = FEATURE_RULES.find(
        rule => rule.id === 'us-region-features'
      );
      expect(usRule).toBeDefined();
      expect(usRule!.conditions).toEqual([
        { attribute: 'region', operator: 'equals', value: 'US' },
      ]);
      expect(usRule!.features).toEqual([
        'us-payment-gateway',
        'us-compliance-tools',
      ]);
    });

    test('eu-region-features rule should be correctly configured', () => {
      const euRule = FEATURE_RULES.find(
        rule => rule.id === 'eu-region-features'
      );
      expect(euRule).toBeDefined();
      expect(euRule!.conditions).toEqual([
        { attribute: 'region', operator: 'equals', value: 'EU' },
      ]);
      expect(euRule!.features).toEqual(['gdpr-tools', 'eu-payment-gateway']);
    });
  });

  describe('Type Definitions', () => {
    test('SupportedPlan type should work correctly', () => {
      const basicPlan: SupportedPlan = 'Basic';
      const proPlan: SupportedPlan = 'Pro';

      expect(basicPlan).toBe('Basic');
      expect(proPlan).toBe('Pro');
    });

    test('SupportedRegion type should work correctly', () => {
      const usRegion: SupportedRegion = 'US';
      const euRegion: SupportedRegion = 'EU';

      expect(usRegion).toBe('US');
      expect(euRegion).toBe('EU');
    });

    test('FeatureIdentifier type should work correctly', () => {
      const feature: FeatureIdentifier = 'advanced-analytics';
      expect(feature).toBe('advanced-analytics');
    });
  });

  describe('Configuration Completeness', () => {
    test('should cover all plan-based features', () => {
      const planRules = FEATURE_RULES.filter(rule =>
        rule.conditions.some(condition => condition.attribute === 'plan')
      );
      expect(planRules).toHaveLength(2); // Basic and Pro

      const planValues = planRules.flatMap(rule =>
        rule.conditions
          .filter(condition => condition.attribute === 'plan')
          .map(condition => condition.value)
      );
      expect(planValues).toContain('Basic');
      expect(planValues).toContain('Pro');
    });

    test('should cover all region-based features', () => {
      const regionRules = FEATURE_RULES.filter(rule =>
        rule.conditions.some(condition => condition.attribute === 'region')
      );
      expect(regionRules).toHaveLength(2); // US and EU

      const regionValues = regionRules.flatMap(rule =>
        rule.conditions
          .filter(condition => condition.attribute === 'region')
          .map(condition => condition.value)
      );
      expect(regionValues).toContain('US');
      expect(regionValues).toContain('EU');
    });

    test('should have no orphaned features in rules', () => {
      const allRuleFeatures = FEATURE_RULES.flatMap(rule => rule.features);
      const uniqueRuleFeatures = [...new Set(allRuleFeatures)];

      // All features in rules should exist in ALL_FEATURES
      uniqueRuleFeatures.forEach(feature => {
        expect(ALL_FEATURES).toContain(feature as FeatureIdentifier);
      });
    });
  });
});
