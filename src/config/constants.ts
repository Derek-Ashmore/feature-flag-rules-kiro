/**
 * Legacy static configuration constants for the feature flag evaluator
 *
 * These constants are kept for backward compatibility with existing tests
 * but should not be used in new code. Use dynamic configuration loading instead.
 */

import { FeatureRule } from '../types';

/**
 * @deprecated Use dynamic configuration loading instead
 * Supported user plans
 */
export const SUPPORTED_PLANS = ['Basic', 'Pro'] as const;

/**
 * @deprecated Use dynamic configuration loading instead
 * Supported regions
 */
export const SUPPORTED_REGIONS = ['US', 'EU'] as const;

/**
 * @deprecated Use dynamic configuration loading instead
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
 * @deprecated Use dynamic configuration loading instead
 * Static feature rules that map user attributes to features
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

/**
 * Type definitions for supported values
 */
export type SupportedPlan = (typeof SUPPORTED_PLANS)[number];
export type SupportedRegion = (typeof SUPPORTED_REGIONS)[number];
export type FeatureIdentifier = (typeof ALL_FEATURES)[number];
