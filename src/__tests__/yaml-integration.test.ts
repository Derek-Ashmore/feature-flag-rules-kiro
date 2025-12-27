/**
 * YAML Configuration Integration Tests
 *
 * These tests verify the complete evaluation flow with YAML configuration files,
 * test error handling across component boundaries with configuration loading,
 * and test configuration reloading scenarios.
 *
 * Requirements: All requirements (integration with YAML configuration)
 */

import * as path from 'path';
import { FeatureFlagEvaluator } from '../FeatureFlagEvaluator';
import { UserContext, EvaluationResult } from '../types';

describe('YAML Configuration Integration Tests', () => {
  let evaluator: FeatureFlagEvaluator;
  const fixturesPath = path.join(__dirname, 'fixtures');

  beforeEach(() => {
    evaluator = new FeatureFlagEvaluator();
  });

  describe('YAML Configuration Loading and Evaluation', () => {
    it('should load sample configuration and evaluate Pro US user correctly', async () => {
      const configPath = path.join(fixturesPath, 'sample-config.yml');

      // Load configuration from YAML file
      const loadResult = await evaluator.loadConfiguration(configPath);
      expect(loadResult.success).toBe(true);
      expect(loadResult.error).toBeUndefined();

      // Test evaluation with loaded configuration
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

    it('should load sample configuration and evaluate Pro EU user correctly', async () => {
      const configPath = path.join(fixturesPath, 'sample-config.yml');

      const loadResult = await evaluator.loadConfiguration(configPath);
      expect(loadResult.success).toBe(true);

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
    });

    it('should load sample configuration and evaluate Basic US user correctly', async () => {
      const configPath = path.join(fixturesPath, 'sample-config.yml');

      const loadResult = await evaluator.loadConfiguration(configPath);
      expect(loadResult.success).toBe(true);

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
    });

    it('should load minimal configuration and evaluate correctly', async () => {
      const configPath = path.join(fixturesPath, 'minimal-config.yml');

      const loadResult = await evaluator.loadConfiguration(configPath);
      expect(loadResult.success).toBe(true);

      const context: UserContext = {
        userId: 'basic-user',
        region: 'US',
        plan: 'Basic',
      };

      const result: EvaluationResult = evaluator.evaluate(context);

      expect(result.success).toBe(true);
      expect(result.features).toBeDefined();
      expect(result.features).toHaveLength(1);
      expect(result.features).toEqual(['basic-feature']);
    });

    it('should return query results based on loaded YAML configuration', async () => {
      const configPath = path.join(fixturesPath, 'sample-config.yml');

      const loadResult = await evaluator.loadConfiguration(configPath);
      expect(loadResult.success).toBe(true);

      // Test query methods return data from loaded configuration
      const availableFeatures = evaluator.getAvailableFeatures();
      const supportedPlans = evaluator.getSupportedPlans();
      const supportedRegions = evaluator.getSupportedRegions();

      expect(availableFeatures).toEqual([
        'advanced-analytics',
        'api-access',
        'basic-dashboard',
        'eu-payment-gateway',
        'gdpr-tools',
        'premium-support',
        'standard-support',
        'us-compliance-tools',
        'us-payment-gateway',
      ]);
      expect(supportedPlans).toEqual(['Basic', 'Pro']);
      expect(supportedRegions).toEqual(['US', 'EU']);
    });
  });

  describe('YAML Configuration Error Handling', () => {
    it('should handle missing configuration file gracefully', async () => {
      const configPath = path.join(fixturesPath, 'nonexistent-config.yml');

      const loadResult = await evaluator.loadConfiguration(configPath);

      expect(loadResult.success).toBe(false);
      expect(loadResult.error).toBe('Configuration file not found');
      expect(loadResult.configuration).toBeUndefined();
    });

    it('should handle invalid YAML configuration gracefully', async () => {
      const configPath = path.join(fixturesPath, 'invalid-config.yml');

      const loadResult = await evaluator.loadConfiguration(configPath);

      expect(loadResult.success).toBe(false);
      expect(loadResult.error).toContain('Configuration validation failed');
      expect(loadResult.configuration).toBeUndefined();
    });

    it('should prevent evaluation when configuration loading fails', async () => {
      const configPath = path.join(fixturesPath, 'nonexistent-config.yml');

      // Attempt to load non-existent configuration
      const loadResult = await evaluator.loadConfiguration(configPath);
      expect(loadResult.success).toBe(false);

      // Evaluation should fail when configuration is not loaded
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

    it('should validate user context against loaded configuration', async () => {
      const configPath = path.join(fixturesPath, 'minimal-config.yml');

      const loadResult = await evaluator.loadConfiguration(configPath);
      expect(loadResult.success).toBe(true);

      // Test with plan not supported by loaded configuration
      const invalidPlanContext: UserContext = {
        userId: 'test-user',
        region: 'US',
        plan: 'Pro', // Pro is not supported in minimal config
      };

      const result1 = evaluator.evaluate(invalidPlanContext);
      expect(result1.success).toBe(false);
      expect(result1.error).toBe('Unsupported plan');

      // Test with region not supported by loaded configuration
      const invalidRegionContext: UserContext = {
        userId: 'test-user',
        region: 'EU', // EU is not supported in minimal config
        plan: 'Basic',
      };

      const result2 = evaluator.evaluate(invalidRegionContext);
      expect(result2.success).toBe(false);
      expect(result2.error).toBe('Unsupported region');
    });
  });

  describe('Configuration Reloading Scenarios', () => {
    it('should handle configuration reloading correctly', async () => {
      // Load initial configuration
      const initialConfigPath = path.join(fixturesPath, 'minimal-config.yml');
      const initialLoadResult =
        await evaluator.loadConfiguration(initialConfigPath);
      expect(initialLoadResult.success).toBe(true);

      // Test with initial configuration
      const context: UserContext = {
        userId: 'test-user',
        region: 'US',
        plan: 'Basic',
      };

      const initialResult = evaluator.evaluate(context);
      expect(initialResult.success).toBe(true);
      expect(initialResult.features).toEqual(['basic-feature']);

      // Reload with different configuration
      const newConfigPath = path.join(fixturesPath, 'sample-config.yml');
      const newLoadResult = await evaluator.loadConfiguration(newConfigPath);
      expect(newLoadResult.success).toBe(true);

      // Test with new configuration - same context should now have different results
      const newResult = evaluator.evaluate(context);
      expect(newResult.success).toBe(true);
      expect(newResult.features).toEqual([
        'basic-dashboard',
        'standard-support',
        'us-compliance-tools',
        'us-payment-gateway',
      ]);
      expect(newResult.features).not.toEqual(initialResult.features);
    });

    it('should update query methods after configuration reload', async () => {
      // Load initial configuration
      const initialConfigPath = path.join(fixturesPath, 'minimal-config.yml');
      await evaluator.loadConfiguration(initialConfigPath);

      const initialFeatures = evaluator.getAvailableFeatures();
      const initialPlans = evaluator.getSupportedPlans();
      const initialRegions = evaluator.getSupportedRegions();

      expect(initialFeatures).toEqual(['basic-feature']);
      expect(initialPlans).toEqual(['Basic']);
      expect(initialRegions).toEqual(['US']);

      // Reload with different configuration
      const newConfigPath = path.join(fixturesPath, 'sample-config.yml');
      await evaluator.loadConfiguration(newConfigPath);

      const newFeatures = evaluator.getAvailableFeatures();
      const newPlans = evaluator.getSupportedPlans();
      const newRegions = evaluator.getSupportedRegions();

      expect(newFeatures).not.toEqual(initialFeatures);
      expect(newPlans).not.toEqual(initialPlans);
      expect(newRegions).not.toEqual(initialRegions);

      expect(newFeatures).toHaveLength(9);
      expect(newPlans).toEqual(['Basic', 'Pro']);
      expect(newRegions).toEqual(['US', 'EU']);
    });

    it('should maintain evaluation consistency after successful reload', async () => {
      const configPath = path.join(fixturesPath, 'sample-config.yml');

      // Load configuration
      const loadResult = await evaluator.loadConfiguration(configPath);
      expect(loadResult.success).toBe(true);

      const context: UserContext = {
        userId: 'consistency-test-user',
        region: 'US',
        plan: 'Pro',
      };

      // Perform multiple evaluations to ensure consistency
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

    it('should handle failed reload gracefully', async () => {
      // Load initial valid configuration
      const validConfigPath = path.join(fixturesPath, 'sample-config.yml');
      const initialLoadResult =
        await evaluator.loadConfiguration(validConfigPath);
      expect(initialLoadResult.success).toBe(true);

      // Test that evaluation works with initial configuration
      const context: UserContext = {
        userId: 'test-user',
        region: 'US',
        plan: 'Pro',
      };

      const initialResult = evaluator.evaluate(context);
      expect(initialResult.success).toBe(true);

      // Attempt to reload with invalid configuration
      const invalidConfigPath = path.join(
        fixturesPath,
        'nonexistent-config.yml'
      );
      const failedLoadResult =
        await evaluator.loadConfiguration(invalidConfigPath);
      expect(failedLoadResult.success).toBe(false);

      // Evaluation should still work with previous valid configuration
      const resultAfterFailedReload = evaluator.evaluate(context);
      expect(resultAfterFailedReload.success).toBe(true);
      expect(resultAfterFailedReload.features).toEqual(initialResult.features);
    });
  });

  describe('Cross-Component Integration with YAML', () => {
    it('should ensure InputValidator uses loaded YAML configuration', async () => {
      const configPath = path.join(fixturesPath, 'minimal-config.yml');

      const loadResult = await evaluator.loadConfiguration(configPath);
      expect(loadResult.success).toBe(true);

      // Test that validation uses loaded configuration constraints
      const contexts = [
        {
          context: { userId: 'user', region: 'US', plan: 'Basic' },
          shouldSucceed: true,
          description: 'valid according to loaded config',
        },
        {
          context: { userId: 'user', region: 'EU', plan: 'Basic' },
          shouldSucceed: false,
          description: 'invalid region according to loaded config',
        },
        {
          context: { userId: 'user', region: 'US', plan: 'Pro' },
          shouldSucceed: false,
          description: 'invalid plan according to loaded config',
        },
      ];

      contexts.forEach(({ context, shouldSucceed }) => {
        const result = evaluator.evaluate(context);
        if (shouldSucceed) {
          expect(result.success).toBe(true);
        } else {
          expect(result.success).toBe(false);
        }
      });
    });

    it('should ensure RuleEngine uses loaded YAML rules', async () => {
      const configPath = path.join(fixturesPath, 'sample-config.yml');

      const loadResult = await evaluator.loadConfiguration(configPath);
      expect(loadResult.success).toBe(true);

      // Test that rule evaluation uses loaded rules
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
        },
        {
          context: { userId: 'user2', region: 'EU', plan: 'Basic' },
          expectedFeatures: [
            'basic-dashboard',
            'eu-payment-gateway',
            'gdpr-tools',
            'standard-support',
          ],
        },
      ];

      testCases.forEach(({ context, expectedFeatures }) => {
        const result = evaluator.evaluate(context);
        expect(result.success).toBe(true);
        expect(result.features).toEqual(expectedFeatures);
      });
    });

    it('should ensure output formatting works with loaded configuration', async () => {
      const configPath = path.join(fixturesPath, 'sample-config.yml');

      const loadResult = await evaluator.loadConfiguration(configPath);
      expect(loadResult.success).toBe(true);

      const context: UserContext = {
        userId: 'format-test-user',
        region: 'US',
        plan: 'Pro',
      };

      const result = evaluator.evaluate(context);

      expect(result.success).toBe(true);
      expect(result.features).toBeDefined();

      // Verify output formatting requirements with loaded data
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
});
