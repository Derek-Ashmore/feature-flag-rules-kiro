"use strict";
/**
 * Static configuration constants for the feature flag evaluator
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FEATURE_RULES = exports.ALL_FEATURES = exports.SUPPORTED_REGIONS = exports.SUPPORTED_PLANS = void 0;
/**
 * Supported user plans
 */
exports.SUPPORTED_PLANS = ['Basic', 'Pro'];
/**
 * Supported regions
 */
exports.SUPPORTED_REGIONS = ['US', 'EU'];
/**
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
    'us-payment-gateway'
];
/**
 * Static feature rules that map user attributes to features
 */
exports.FEATURE_RULES = [
    {
        id: 'pro-plan-features',
        conditions: [
            { attribute: 'plan', operator: 'equals', value: 'Pro' }
        ],
        features: ['advanced-analytics', 'premium-support', 'api-access']
    },
    {
        id: 'basic-plan-features',
        conditions: [
            { attribute: 'plan', operator: 'equals', value: 'Basic' }
        ],
        features: ['basic-dashboard', 'standard-support']
    },
    {
        id: 'us-region-features',
        conditions: [
            { attribute: 'region', operator: 'equals', value: 'US' }
        ],
        features: ['us-payment-gateway', 'us-compliance-tools']
    },
    {
        id: 'eu-region-features',
        conditions: [
            { attribute: 'region', operator: 'equals', value: 'EU' }
        ],
        features: ['gdpr-tools', 'eu-payment-gateway']
    }
];
//# sourceMappingURL=constants.js.map