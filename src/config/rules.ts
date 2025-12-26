/**
 * Static rule configuration for the Feature Flag Evaluator
 *
 * This file contains all the predefined rules that determine which features
 * are available to users based on their plan and region attributes.
 */

import { FeatureRule } from '../types';

/**
 * Supported user plans
 */
export const SUPPORTED_PLANS = ['Basic', 'Pro'] as const;

/**
 * Supported user regions
 */
export const SUPPORTED_REGIONS = ['US', 'EU'] as const;

/**
 * All available features in the system
 */
export const ALL_FEATURES = [
  'advanced-analytics',
  'api-access',
  'basic-dashboard',
  'eu-payment-gateway',
  'gdpr-tools',
  'premium-support',
  'standard-support',
  'us-compliance-tools',
  'us-payment-gateway',
] as const;

/**
 * Static feature rules that map user attributes to enabled features
 *
 * Rules are evaluated based on user context (plan, region) and the union
 * of all matching rules determines the final set of enabled features.
 */
export const FEATURE_RULES: FeatureRule[] = [
  {
    id: 'pro-plan-features',
    conditions: [{ attribute: 'plan', operator: 'equals', value: 'Pro' }],
    features: ['advanced-analytics', 'premium-support', 'api-access'],
  },
  {
    id: 'basic-plan-features',
    conditions: [{ attribute: 'plan', operator: 'equals', value: 'Basic' }],
    features: ['basic-dashboard', 'standard-support'],
  },
  {
    id: 'us-region-features',
    conditions: [{ attribute: 'region', operator: 'equals', value: 'US' }],
    features: ['us-payment-gateway', 'us-compliance-tools'],
  },
  {
    id: 'eu-region-features',
    conditions: [{ attribute: 'region', operator: 'equals', value: 'EU' }],
    features: ['gdpr-tools', 'eu-payment-gateway'],
  },
];
