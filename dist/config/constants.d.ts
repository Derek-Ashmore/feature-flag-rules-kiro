/**
 * Static configuration constants for the feature flag evaluator
 */
import { FeatureRule } from '../types';
/**
 * Supported user plans
 */
export declare const SUPPORTED_PLANS: readonly ["Basic", "Pro"];
/**
 * Supported regions
 */
export declare const SUPPORTED_REGIONS: readonly ["US", "EU"];
/**
 * All available features in the system
 */
export declare const ALL_FEATURES: readonly ["advanced-analytics", "api-access", "basic-dashboard", "eu-payment-gateway", "gdpr-tools", "premium-support", "standard-support", "us-compliance-tools", "us-payment-gateway"];
/**
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