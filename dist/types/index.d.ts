/**
 * Core interfaces for the Feature Flag Evaluator
 */
/**
 * User context containing the information needed for feature flag evaluation
 */
export interface UserContext {
    userId: string;
    region: string;
    plan: string;
}
/**
 * Result of a feature flag evaluation
 */
export interface EvaluationResult {
    success: boolean;
    features?: string[];
    error?: string;
}
/**
 * A rule that determines feature availability based on user attributes
 */
export interface FeatureRule {
    id: string;
    conditions: RuleCondition[];
    features: string[];
}
/**
 * A condition within a feature rule
 */
export interface RuleCondition {
    attribute: 'plan' | 'region' | 'userId';
    operator: 'equals' | 'in';
    value: string | string[];
}
/**
 * Result of input validation
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
/**
 * Main interface for the feature flag evaluator
 */
export interface FeatureFlagEvaluator {
    evaluate(context: UserContext): EvaluationResult;
    getAvailableFeatures(): string[];
    getSupportedPlans(): string[];
    getSupportedRegions(): string[];
}
/**
 * Interface for the rule engine component
 */
export interface RuleEngine {
    evaluateRules(context: UserContext): string[];
}
/**
 * Interface for input validation component
 */
export interface InputValidator {
    validate(context: UserContext): ValidationResult;
}
/**
 * Enumeration of possible evaluation errors
 */
export declare enum EvaluationError {
    MISSING_CONTEXT = "Missing or null user context",
    INVALID_USER_ID = "Invalid or empty userId",
    UNSUPPORTED_REGION = "Unsupported region",
    UNSUPPORTED_PLAN = "Unsupported plan",
    VALIDATION_FAILED = "Input validation failed"
}
//# sourceMappingURL=index.d.ts.map