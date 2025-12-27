/**
 * Additional tests to improve code coverage
 * These tests target specific uncovered lines and branches
 */

import { ConfigurationLoader } from '../config/ConfigurationLoader';
import { RuleEngine } from '../engine/RuleEngine';
import { FeatureFlagEvaluator } from '../FeatureFlagEvaluator';
import * as mainIndex from '../index';
import * as configIndex from '../config/index';
import * as rules from '../config/rules';
import { UserContext } from '../types';
import * as fs from 'fs';
import * as path from 'path';

describe('Coverage Tests', () => {
  describe('Main Index Module', () => {
    test('should export defaultEvaluator', () => {
      expect(mainIndex.defaultEvaluator).toBeInstanceOf(FeatureFlagEvaluator);
    });

    test('should export all types and classes', () => {
      expect(mainIndex.InputValidatorImpl).toBeDefined();
      expect(mainIndex.RuleEngine).toBeDefined();
      expect(mainIndex.FeatureFlagEvaluator).toBeDefined();
    });
  });

  describe('Config Index Module', () => {
    test('should export ConfigurationLoader', () => {
      expect(configIndex.ConfigurationLoader).toBeDefined();
    });

    test('should export legacy constants', () => {
      expect(configIndex.SUPPORTED_PLANS).toBeDefined();
      expect(configIndex.SUPPORTED_REGIONS).toBeDefined();
      expect(configIndex.ALL_FEATURES).toBeDefined();
      expect(configIndex.FEATURE_RULES).toBeDefined();
    });

    test('should export static constants', () => {
      expect(configIndex.STATIC_SUPPORTED_PLANS).toBeDefined();
      expect(configIndex.STATIC_SUPPORTED_REGIONS).toBeDefined();
      expect(configIndex.STATIC_ALL_FEATURES).toBeDefined();
      expect(configIndex.STATIC_FEATURE_RULES).toBeDefined();
    });
  });

  describe('Legacy Rules Module', () => {
    test('should export legacy constants', () => {
      expect(rules.SUPPORTED_PLANS).toEqual(['Basic', 'Pro']);
      expect(rules.SUPPORTED_REGIONS).toEqual(['US', 'EU']);
      expect(rules.ALL_FEATURES).toContain('advanced-analytics');
      expect(rules.FEATURE_RULES).toHaveLength(4);
    });

    test('should have proper rule structure', () => {
      const proRule = rules.FEATURE_RULES.find(
        r => r.id === 'pro-plan-features'
      );
      expect(proRule).toBeDefined();
      expect(proRule?.conditions).toHaveLength(1);
      expect(proRule?.features).toContain('advanced-analytics');
    });
  });

  describe('ConfigurationLoader Error Paths', () => {
    let loader: ConfigurationLoader;

    beforeEach(() => {
      loader = new ConfigurationLoader();
    });

    test('should handle file not found error', async () => {
      const result = await loader.loadFromFile('nonexistent-file.yml');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Configuration file not found');
    });

    test('should handle invalid YAML syntax', async () => {
      // Create a temporary invalid YAML file
      const invalidYamlPath = path.join(
        __dirname,
        'fixtures',
        'invalid-syntax.yml'
      );
      const invalidYaml = `
supportedPlans:
  - Basic
  - Pro
invalid: [unclosed array
`;
      fs.writeFileSync(invalidYamlPath, invalidYaml);

      try {
        const result = await loader.loadFromFile(invalidYamlPath);
        expect(result.success).toBe(false);
        expect(result.error).toContain('Failed to parse YAML');
      } finally {
        // Clean up
        if (fs.existsSync(invalidYamlPath)) {
          fs.unlinkSync(invalidYamlPath);
        }
      }
    });

    test('should validate empty supportedPlans array', () => {
      const config = {
        supportedPlans: [],
        supportedRegions: ['US'],
        features: [{ id: 'test', name: 'Test' }],
        rules: [],
      };

      const result = loader.validateConfiguration(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('supportedPlans cannot be empty');
    });

    test('should validate empty supportedRegions array', () => {
      const config = {
        supportedPlans: ['Basic'],
        supportedRegions: [],
        features: [{ id: 'test', name: 'Test' }],
        rules: [],
      };

      const result = loader.validateConfiguration(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('supportedRegions cannot be empty');
    });

    test('should validate empty features array', () => {
      const config = {
        supportedPlans: ['Basic'],
        supportedRegions: ['US'],
        features: [],
        rules: [],
      };

      const result = loader.validateConfiguration(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('features cannot be empty');
    });

    test('should validate feature with invalid description', () => {
      const config = {
        supportedPlans: ['Basic'],
        supportedRegions: ['US'],
        features: [{ id: 'test', name: 'Test', description: '' }],
        rules: [],
      };

      const result = loader.validateConfiguration(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Feature test description must be a non-empty string if provided'
      );
    });

    test('should validate rule with empty conditions', () => {
      const config = {
        supportedPlans: ['Basic'],
        supportedRegions: ['US'],
        features: [{ id: 'test', name: 'Test' }],
        rules: [
          {
            id: 'test-rule',
            conditions: [],
            features: ['test'],
          },
        ],
      };

      const result = loader.validateConfiguration(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Rule test-rule must have non-empty conditions array'
      );
    });

    test('should validate rule with empty features', () => {
      const config = {
        supportedPlans: ['Basic'],
        supportedRegions: ['US'],
        features: [{ id: 'test', name: 'Test' }],
        rules: [
          {
            id: 'test-rule',
            conditions: [
              { attribute: 'plan', operator: 'equals', value: 'Basic' },
            ],
            features: [],
          },
        ],
      };

      const result = loader.validateConfiguration(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Rule test-rule must have non-empty features array'
      );
    });
  });

  describe('RuleEngine Edge Cases', () => {
    let engine: RuleEngine;

    beforeEach(() => {
      engine = new RuleEngine();
    });

    test('should handle rules with no matching conditions', () => {
      const configuration = {
        rules: [
          {
            id: 'test-rule',
            conditions: [
              {
                attribute: 'plan' as const,
                operator: 'equals' as const,
                value: 'Enterprise',
              },
            ],
            features: ['enterprise-feature'],
          },
        ],
        supportedPlans: ['Basic', 'Pro', 'Enterprise'],
        supportedRegions: ['US', 'EU'],
        features: [{ id: 'enterprise-feature', name: 'Enterprise Feature' }],
      };

      engine.setConfiguration(configuration);

      const context: UserContext = {
        userId: 'user1',
        plan: 'Basic',
        region: 'US',
      };

      const result = engine.evaluateRules(context);
      expect(result).toEqual([]);
    });

    test('should handle rules with multiple conditions where some match', () => {
      const configuration = {
        rules: [
          {
            id: 'complex-rule',
            conditions: [
              {
                attribute: 'plan' as const,
                operator: 'equals' as const,
                value: 'Pro',
              },
              {
                attribute: 'region' as const,
                operator: 'equals' as const,
                value: 'EU',
              },
            ],
            features: ['complex-feature'],
          },
        ],
        supportedPlans: ['Basic', 'Pro'],
        supportedRegions: ['US', 'EU'],
        features: [{ id: 'complex-feature', name: 'Complex Feature' }],
      };

      engine.setConfiguration(configuration);

      const context: UserContext = {
        userId: 'user1',
        plan: 'Pro',
        region: 'US', // Different region
      };

      const result = engine.evaluateRules(context);
      expect(result).toEqual([]);
    });

    test('should handle userId-based conditions', () => {
      const configuration = {
        rules: [
          {
            id: 'user-specific-rule',
            conditions: [
              {
                attribute: 'userId' as const,
                operator: 'equals' as const,
                value: 'special-user',
              },
            ],
            features: ['special-feature'],
          },
        ],
        supportedPlans: ['Basic', 'Pro'],
        supportedRegions: ['US', 'EU'],
        features: [{ id: 'special-feature', name: 'Special Feature' }],
      };

      engine.setConfiguration(configuration);

      const context: UserContext = {
        userId: 'special-user',
        plan: 'Basic',
        region: 'US',
      };

      const result = engine.evaluateRules(context);
      expect(result).toEqual(['special-feature']);
    });

    test('should throw error when evaluating without configuration', () => {
      const context: UserContext = {
        userId: 'user1',
        plan: 'Basic',
        region: 'US',
      };

      expect(() => engine.evaluateRules(context)).toThrow(
        'Configuration not loaded'
      );
    });
  });

  describe('FeatureFlagEvaluator Edge Cases', () => {
    let evaluator: FeatureFlagEvaluator;

    beforeEach(() => {
      evaluator = new FeatureFlagEvaluator();
    });

    test('should handle evaluation without loaded configuration', () => {
      const context: UserContext = {
        userId: 'user1',
        plan: 'Basic',
        region: 'US',
      };

      const result = evaluator.evaluate(context);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Configuration not loaded');
    });

    test('should handle query methods without loaded configuration', () => {
      expect(evaluator.getAvailableFeatures()).toEqual([]);
      expect(evaluator.getSupportedPlans()).toEqual([]);
      expect(evaluator.getSupportedRegions()).toEqual([]);
    });
  });
});
