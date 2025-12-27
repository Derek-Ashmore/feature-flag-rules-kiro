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
export declare const SUPPORTED_PLANS: readonly ["Basic", "Pro"];
/**
 * @deprecated Use dynamic configuration loading instead
 * Supported regions
 */
export declare const SUPPORTED_REGIONS: readonly ["US", "EU"];
/**
 * @deprecated Use dynamic configuration loading instead
 * All available features in the system
 */
export declare const ALL_FEATURES: readonly ["advanced-analytics", "api-access", "basic-dashboard", "eu-payment-gateway", "gdpr-tools", "premium-support", "standard-support", "us-compliance-tools", "us-payment-gateway"];
/**
 * @deprecated Use dynamic configuration loading instead
 * Static feature rules that map user attributes to features
 */
export declare const FEATURE_RULES: FeatureRule[];
/**
 * Type definitions for supported values
 */
export type SupportedPlan = (typeof SUPPORTED_PLANS)[number];
export type SupportedRegion = (typeof SUPPORTED_REGIONS)[number];
export type FeatureIdentifier = (typeof ALL_FEATURES)[number];
//# sourceMappingURL=constants.d.ts.map