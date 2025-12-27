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
  loadConfiguration(configPath: string): Promise<ConfigurationResult>;
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
  setConfiguration(configuration: FeatureFlagConfiguration): void;
}

/**
 * Interface for input validation component
 */
export interface InputValidator {
  validate(context: UserContext): ValidationResult;
  setConfiguration(configuration: FeatureFlagConfiguration): void;
}

/**
 * Definition of a feature in the configuration
 */
export interface FeatureDefinition {
  id: string;
  name: string;
  description?: string;
}

/**
 * Complete feature flag configuration loaded from YAML
 */
export interface FeatureFlagConfiguration {
  rules: FeatureRule[];
  supportedPlans: string[];
  supportedRegions: string[];
  features: FeatureDefinition[];
}

/**
 * Result of configuration loading operation
 */
export interface ConfigurationResult {
  success: boolean;
  configuration?: FeatureFlagConfiguration;
  error?: string;
}

/**
 * Interface for configuration loading component
 */
export interface ConfigurationLoader {
  loadFromFile(filePath: string): Promise<ConfigurationResult>;
  validateConfiguration(config: any): ValidationResult;
}

/**
 * Enumeration of possible evaluation errors
 */
export enum EvaluationError {
  // Configuration errors
  CONFIG_FILE_NOT_FOUND = 'Configuration file not found',
  CONFIG_PARSE_ERROR = 'Failed to parse YAML configuration',
  CONFIG_VALIDATION_ERROR = 'Configuration validation failed',
  CONFIG_NOT_LOADED = 'Configuration not loaded - call loadConfiguration first',

  // Input validation errors
  MISSING_CONTEXT = 'Missing or null user context',
  INVALID_USER_ID = 'Invalid or empty userId',
  UNSUPPORTED_REGION = 'Unsupported region',
  UNSUPPORTED_PLAN = 'Unsupported plan',
  VALIDATION_FAILED = 'Input validation failed',
}
