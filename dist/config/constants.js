"use strict";
/**
 * Legacy static configuration constants for the feature flag evaluator
 *
 * These constants are kept for backward compatibility with existing tests
 * but should not be used in new code. Use dynamic configuration loading instead.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FEATURE_RULES = exports.ALL_FEATURES = exports.SUPPORTED_REGIONS = exports.SUPPORTED_PLANS = void 0;
/**
 * @deprecated Use dynamic configuration loading instead
 * Supported user plans
 */
exports.SUPPORTED_PLANS = ['Basic', 'Pro'];
/**
 * @deprecated Use dynamic configuration loading instead
 * Supported regions
 */
exports.SUPPORTED_REGIONS = ['US', 'EU'];
/**
 * @deprecated Use dynamic configuration loading instead
 * All available features in the system
 */
exports.ALL_FEATURES = [
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
/**
 * @deprecated Use dynamic configuration loading instead
 * Static feature rules that map user attributes to features
 */
exports.FEATURE_RULES = [
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
//# sourceMappingURL=constants.js.map