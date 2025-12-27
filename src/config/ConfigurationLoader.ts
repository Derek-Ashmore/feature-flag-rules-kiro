import * as fs from 'fs';
import * as yaml from 'js-yaml';
import {
  ConfigurationLoader as IConfigurationLoader,
  ConfigurationResult,
  FeatureFlagConfiguration,
  ValidationResult,
  EvaluationError,
  FeatureDefinition,
} from '../types';

/**
 * Loads and validates YAML configuration files for feature flag rules
 */
export class ConfigurationLoader implements IConfigurationLoader {
  /**
   * Loads configuration from a YAML file
   * @param filePath Path to the YAML configuration file
   * @returns Promise resolving to configuration result
   */
  async loadFromFile(filePath: string): Promise<ConfigurationResult> {
    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          error: EvaluationError.CONFIG_FILE_NOT_FOUND,
        };
      }

      // Read file content
      const fileContent = fs.readFileSync(filePath, 'utf8');

      // Parse YAML
      let parsedConfig: any;
      try {
        parsedConfig = yaml.load(fileContent);
      } catch (parseError) {
        return {
          success: false,
          error: `${EvaluationError.CONFIG_PARSE_ERROR}: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`,
        };
      }

      // Validate configuration structure
      const validationResult = this.validateConfiguration(parsedConfig);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: `${EvaluationError.CONFIG_VALIDATION_ERROR}: ${validationResult.errors.join(', ')}`,
        };
      }

      // Convert to typed configuration
      const configuration: FeatureFlagConfiguration = {
        rules: parsedConfig.rules || [],
        supportedPlans: parsedConfig.supportedPlans || [],
        supportedRegions: parsedConfig.supportedRegions || [],
        features: parsedConfig.features || [],
      };

      return {
        success: true,
        configuration,
      };
    } catch (error) {
      return {
        success: false,
        error: `${EvaluationError.CONFIG_FILE_NOT_FOUND}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Validates the structure and content of a configuration object
   * @param config Configuration object to validate
   * @returns Validation result with errors if any
   */
  validateConfiguration(config: any): ValidationResult {
    const errors: string[] = [];

    // Check if config is an object
    if (!config || typeof config !== 'object') {
      errors.push('Configuration must be an object');
      return { isValid: false, errors };
    }

    // Validate required top-level properties
    if (!Array.isArray(config.supportedPlans)) {
      errors.push('supportedPlans must be an array');
    } else if (config.supportedPlans.length === 0) {
      errors.push('supportedPlans cannot be empty');
    } else if (
      !config.supportedPlans.every(
        (plan: any) => typeof plan === 'string' && plan.trim().length > 0
      )
    ) {
      errors.push('All supportedPlans must be non-empty strings');
    }

    if (!Array.isArray(config.supportedRegions)) {
      errors.push('supportedRegions must be an array');
    } else if (config.supportedRegions.length === 0) {
      errors.push('supportedRegions cannot be empty');
    } else if (
      !config.supportedRegions.every(
        (region: any) => typeof region === 'string' && region.trim().length > 0
      )
    ) {
      errors.push('All supportedRegions must be non-empty strings');
    }

    if (!Array.isArray(config.features)) {
      errors.push('features must be an array');
    } else if (config.features.length === 0) {
      errors.push('features cannot be empty');
    } else {
      // Validate feature definitions
      const featureIds = new Set<string>();
      config.features.forEach((feature: any, index: number) => {
        if (!feature || typeof feature !== 'object') {
          errors.push(`Feature at index ${index} must be an object`);
          return;
        }

        if (
          !feature.id ||
          typeof feature.id !== 'string' ||
          feature.id.trim().length === 0
        ) {
          errors.push(`Feature at index ${index} must have a non-empty id`);
          return;
        }

        if (featureIds.has(feature.id)) {
          errors.push(`Duplicate feature id: ${feature.id}`);
          return;
        }
        featureIds.add(feature.id);

        if (
          !feature.name ||
          typeof feature.name !== 'string' ||
          feature.name.trim().length === 0
        ) {
          errors.push(`Feature ${feature.id} must have a non-empty name`);
        }

        if (
          feature.description !== undefined &&
          (typeof feature.description !== 'string' ||
            feature.description.trim().length === 0)
        ) {
          errors.push(
            `Feature ${feature.id} description must be a non-empty string if provided`
          );
        }
      });
    }

    if (!Array.isArray(config.rules)) {
      errors.push('rules must be an array');
    } else if (config.rules.length === 0) {
      errors.push('rules cannot be empty');
    } else {
      // Validate rules and check referential integrity
      const validFeatureIds = new Set(
        config.features?.map((f: FeatureDefinition) => f.id) || []
      );
      const validPlans = new Set(config.supportedPlans || []);
      const validRegions = new Set(config.supportedRegions || []);

      config.rules.forEach((rule: any, index: number) => {
        if (!rule || typeof rule !== 'object') {
          errors.push(`Rule at index ${index} must be an object`);
          return;
        }

        if (
          !rule.id ||
          typeof rule.id !== 'string' ||
          rule.id.trim().length === 0
        ) {
          errors.push(`Rule at index ${index} must have a non-empty id`);
        }

        if (!Array.isArray(rule.conditions) || rule.conditions.length === 0) {
          errors.push(
            `Rule ${rule.id || index} must have non-empty conditions array`
          );
        } else {
          rule.conditions.forEach((condition: any, condIndex: number) => {
            if (!condition || typeof condition !== 'object') {
              errors.push(
                `Rule ${rule.id || index} condition ${condIndex} must be an object`
              );
              return;
            }

            if (!['plan', 'region', 'userId'].includes(condition.attribute)) {
              errors.push(
                `Rule ${rule.id || index} condition ${condIndex} has invalid attribute: ${condition.attribute}`
              );
            }

            if (!['equals', 'in'].includes(condition.operator)) {
              errors.push(
                `Rule ${rule.id || index} condition ${condIndex} has invalid operator: ${condition.operator}`
              );
            }

            if (condition.value === undefined || condition.value === null) {
              errors.push(
                `Rule ${rule.id || index} condition ${condIndex} must have a value`
              );
            }

            // Check referential integrity for plan and region conditions
            if (
              condition.attribute === 'plan' &&
              condition.operator === 'equals'
            ) {
              if (!validPlans.has(condition.value)) {
                errors.push(
                  `Rule ${rule.id || index} references undefined plan: ${condition.value}`
                );
              }
            }

            if (
              condition.attribute === 'region' &&
              condition.operator === 'equals'
            ) {
              if (!validRegions.has(condition.value)) {
                errors.push(
                  `Rule ${rule.id || index} references undefined region: ${condition.value}`
                );
              }
            }
          });
        }

        if (!Array.isArray(rule.features) || rule.features.length === 0) {
          errors.push(
            `Rule ${rule.id || index} must have non-empty features array`
          );
        } else {
          rule.features.forEach((featureId: any) => {
            if (
              typeof featureId !== 'string' ||
              featureId.trim().length === 0
            ) {
              errors.push(
                `Rule ${rule.id || index} has invalid feature id: ${featureId}`
              );
            } else if (!validFeatureIds.has(featureId)) {
              errors.push(
                `Rule ${rule.id || index} references undefined feature: ${featureId}`
              );
            }
          });
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
