/**
 * Basic setup test to verify project structure and dependencies
 */

import * as fc from 'fast-check';
import {
  UserContext,
  EvaluationResult,
  SUPPORTED_PLANS,
  SUPPORTED_REGIONS,
  ALL_FEATURES,
  FEATURE_RULES,
} from '../index';

describe('Project Setup', () => {
  test('should import core types successfully', () => {
    // Test that all core types are available
    const userContext: UserContext = {
      userId: 'test-user',
      region: 'US',
      plan: 'Pro',
    };

    const evaluationResult: EvaluationResult = {
      success: true,
      features: ['advanced-analytics'],
    };

    expect(userContext).toBeDefined();
    expect(evaluationResult).toBeDefined();
  });

  test('should have valid configuration constants', () => {
    expect(SUPPORTED_PLANS).toEqual(['Basic', 'Pro']);
    expect(SUPPORTED_REGIONS).toEqual(['US', 'EU']);
    expect(ALL_FEATURES).toHaveLength(9);
    expect(FEATURE_RULES).toHaveLength(4);
  });

  test('should have valid feature rules structure', () => {
    FEATURE_RULES.forEach(rule => {
      expect(rule).toHaveProperty('id');
      expect(rule).toHaveProperty('conditions');
      expect(rule).toHaveProperty('features');
      expect(Array.isArray(rule.conditions)).toBe(true);
      expect(Array.isArray(rule.features)).toBe(true);
    });
  });

  test('property-based test framework is working', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.string(),
        fc.string(),
        (userId, region, plan) => {
          const context: UserContext = { userId, region, plan };
          // Simple property: context should have all required fields
          return (
            typeof context.userId === 'string' &&
            typeof context.region === 'string' &&
            typeof context.plan === 'string'
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
