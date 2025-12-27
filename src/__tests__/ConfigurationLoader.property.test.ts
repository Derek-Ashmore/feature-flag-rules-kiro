/**
 * Property-based tests for ConfigurationLoader implementation
 * Feature: feature-flag-evaluator
 */

import * as fc from 'fast-check';
import { ConfigurationLoader } from '../config/ConfigurationLoader';

describe('ConfigurationLoader Property Tests', () => {
  let loader: ConfigurationLoader;

  beforeEach(() => {
    loader = new ConfigurationLoader();
  });

  /**
   * Property 15: Valid YAML configuration loading
   * For any valid YAML configuration with proper structure, the ConfigurationLoader should successfully load and parse the configuration
   * **Validates: Requirements 4.1**
   */
  test('Property 15: Valid YAML configuration loading', () => {
    fc.assert(
      fc.property(
        // Generate valid configuration structures with proper referential integrity
        fc
          .record({
            supportedPlans: fc.array(
              fc.string().filter(s => s.trim().length > 0 && s.length > 1),
              { minLength: 1, maxLength: 3 }
            ),
            supportedRegions: fc.array(
              fc.string().filter(s => s.trim().length > 0 && s.length > 1),
              { minLength: 1, maxLength: 3 }
            ),
            features: fc.array(
              fc.record({
                id: fc
                  .string()
                  .filter(s => s.trim().length > 0 && s.length > 1),
                name: fc
                  .string()
                  .filter(s => s.trim().length > 0 && s.length > 1),
                description: fc.option(
                  fc.string().filter(s => s.trim().length > 0),
                  { nil: undefined }
                ),
              }),
              { minLength: 1, maxLength: 3 }
            ),
          })
          .chain(baseConfig => {
            const definedFeatureIds = baseConfig.features.map(f => f.id);
            const definedPlans = baseConfig.supportedPlans;
            const definedRegions = baseConfig.supportedRegions;

            return fc.record({
              supportedPlans: fc.constant(baseConfig.supportedPlans),
              supportedRegions: fc.constant(baseConfig.supportedRegions),
              features: fc.constant(baseConfig.features),
              rules: fc.array(
                fc.record({
                  id: fc
                    .string()
                    .filter(s => s.trim().length > 0 && s.length > 1),
                  conditions: fc.array(
                    fc.oneof(
                      // Plan conditions - must reference valid plans
                      fc.record({
                        attribute: fc.constant('plan'),
                        operator: fc.constant('equals'),
                        value: fc.constantFrom(...definedPlans),
                      }),
                      // Region conditions - must reference valid regions
                      fc.record({
                        attribute: fc.constant('region'),
                        operator: fc.constant('equals'),
                        value: fc.constantFrom(...definedRegions),
                      }),
                      // UserId conditions - can be any string
                      fc.record({
                        attribute: fc.constant('userId'),
                        operator: fc.constantFrom('equals', 'in'),
                        value: fc.string().filter(s => s.trim().length > 0),
                      })
                    ),
                    { minLength: 1, maxLength: 2 }
                  ),
                  features: fc.array(fc.constantFrom(...definedFeatureIds), {
                    minLength: 1,
                    maxLength: 2,
                  }),
                }),
                { minLength: 1, maxLength: 3 }
              ),
            });
          }),
        config => {
          // Test that valid configurations are successfully validated
          const result = loader.validateConfiguration(config);

          // If validation fails, log the errors for debugging
          if (!result.isValid) {
            console.log('Validation errors:', result.errors);
            console.log('Config:', JSON.stringify(config, null, 2));
          }

          // Should always return valid for properly structured configurations
          expect(result.isValid).toBe(true);
          expect(result.errors).toHaveLength(0);

          // Verify the configuration structure is preserved
          expect(config.supportedPlans).toBeDefined();
          expect(config.supportedRegions).toBeDefined();
          expect(config.features).toBeDefined();
          expect(config.rules).toBeDefined();

          // Verify arrays are non-empty (as generated)
          expect(config.supportedPlans.length).toBeGreaterThan(0);
          expect(config.supportedRegions.length).toBeGreaterThan(0);
          expect(config.features.length).toBeGreaterThan(0);
          expect(config.rules.length).toBeGreaterThan(0);

          // Verify all features have required properties
          config.features.forEach(feature => {
            expect(feature.id).toBeDefined();
            expect(feature.id.trim().length).toBeGreaterThan(0);
            expect(feature.name).toBeDefined();
            expect(feature.name.trim().length).toBeGreaterThan(0);
          });

          // Verify all rules have required properties
          config.rules.forEach(rule => {
            expect(rule.id).toBeDefined();
            expect(rule.id.trim().length).toBeGreaterThan(0);
            expect(rule.conditions).toBeDefined();
            expect(rule.conditions.length).toBeGreaterThan(0);
            expect(rule.features).toBeDefined();
            expect(rule.features.length).toBeGreaterThan(0);

            // Verify all conditions have required properties
            rule.conditions.forEach(condition => {
              expect(['plan', 'region', 'userId']).toContain(
                condition.attribute
              );
              expect(['equals', 'in']).toContain(condition.operator);
              expect(condition.value).toBeDefined();
            });
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 16: Invalid rule structure validation
   * For any configuration with invalid rule structure, the ConfigurationLoader should return validation errors
   * **Validates: Requirements 4.4**
   */
  test('Property 16: Invalid rule structure validation', () => {
    fc.assert(
      fc.property(
        // Generate configurations with invalid rule structures
        fc.record({
          supportedPlans: fc.array(
            fc.string().filter(s => s.trim().length > 0),
            { minLength: 1 }
          ),
          supportedRegions: fc.array(
            fc.string().filter(s => s.trim().length > 0),
            { minLength: 1 }
          ),
          features: fc.array(
            fc.record({
              id: fc.string().filter(s => s.trim().length > 0),
              name: fc.string().filter(s => s.trim().length > 0),
              description: fc.option(
                fc.string().filter(s => s.trim().length > 0)
              ),
            }),
            { minLength: 1 }
          ),
          rules: fc.oneof(
            // Invalid rule structures
            fc.array(
              fc.record({
                // Missing id
                conditions: fc.array(
                  fc.record({
                    attribute: fc.constantFrom('plan', 'region', 'userId'),
                    operator: fc.constantFrom('equals', 'in'),
                    value: fc.string(),
                  }),
                  { minLength: 1 }
                ),
                features: fc.array(fc.string(), { minLength: 1 }),
              }),
              { minLength: 1 }
            ),
            fc.array(
              fc.record({
                id: fc.string().filter(s => s.trim().length > 0),
                // Missing conditions
                features: fc.array(fc.string(), { minLength: 1 }),
              }),
              { minLength: 1 }
            ),
            fc.array(
              fc.record({
                id: fc.string().filter(s => s.trim().length > 0),
                conditions: fc.array(
                  fc.record({
                    attribute: fc.constantFrom('plan', 'region', 'userId'),
                    operator: fc.constantFrom('equals', 'in'),
                    value: fc.string(),
                  }),
                  { minLength: 1 }
                ),
                // Missing features
              }),
              { minLength: 1 }
            ),
            fc.array(
              fc.record({
                id: fc.string().filter(s => s.trim().length > 0),
                // Empty conditions array
                conditions: fc.constant([]),
                features: fc.array(fc.string(), { minLength: 1 }),
              }),
              { minLength: 1 }
            ),
            fc.array(
              fc.record({
                id: fc.string().filter(s => s.trim().length > 0),
                conditions: fc.array(
                  fc.record({
                    attribute: fc.constantFrom('plan', 'region', 'userId'),
                    operator: fc.constantFrom('equals', 'in'),
                    value: fc.string(),
                  }),
                  { minLength: 1 }
                ),
                // Empty features array
                features: fc.constant([]),
              }),
              { minLength: 1 }
            ),
            fc.array(
              fc.record({
                id: fc.string().filter(s => s.trim().length > 0),
                conditions: fc.array(
                  fc.record({
                    // Invalid attribute
                    attribute: fc
                      .string()
                      .filter(s => !['plan', 'region', 'userId'].includes(s)),
                    operator: fc.constantFrom('equals', 'in'),
                    value: fc.string(),
                  }),
                  { minLength: 1 }
                ),
                features: fc.array(fc.string(), { minLength: 1 }),
              }),
              { minLength: 1 }
            ),
            fc.array(
              fc.record({
                id: fc.string().filter(s => s.trim().length > 0),
                conditions: fc.array(
                  fc.record({
                    attribute: fc.constantFrom('plan', 'region', 'userId'),
                    // Invalid operator
                    operator: fc
                      .string()
                      .filter(s => !['equals', 'in'].includes(s)),
                    value: fc.string(),
                  }),
                  { minLength: 1 }
                ),
                features: fc.array(fc.string(), { minLength: 1 }),
              }),
              { minLength: 1 }
            )
          ),
        }),
        config => {
          const result = loader.validateConfiguration(config);

          // Should always return invalid for configurations with invalid rule structure
          expect(result.isValid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);

          // Should contain specific error messages about rule structure
          const errorString = result.errors.join(' ');
          const hasRuleStructureError =
            errorString.includes('must have a non-empty id') ||
            errorString.includes('must have non-empty conditions array') ||
            errorString.includes('must have non-empty features array') ||
            errorString.includes('has invalid attribute') ||
            errorString.includes('has invalid operator') ||
            errorString.includes('must have a value');

          expect(hasRuleStructureError).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 17: Configuration referential integrity
   * For any configuration where rules reference undefined features, plans, or regions,
   * the ConfigurationLoader should return validation errors identifying the missing references
   * **Validates: Requirements 4.5**
   */
  test('Property 17: Configuration referential integrity', () => {
    fc.assert(
      fc.property(
        fc
          .record({
            supportedPlans: fc.array(
              fc.string().filter(s => s.trim().length > 0),
              { minLength: 1, maxLength: 5 }
            ),
            supportedRegions: fc.array(
              fc.string().filter(s => s.trim().length > 0),
              { minLength: 1, maxLength: 5 }
            ),
            features: fc.array(
              fc.record({
                id: fc.string().filter(s => s.trim().length > 0),
                name: fc.string().filter(s => s.trim().length > 0),
                description: fc.option(
                  fc.string().filter(s => s.trim().length > 0)
                ),
              }),
              { minLength: 1, maxLength: 5 }
            ),
          })
          .chain(baseConfig => {
            const definedFeatureIds = baseConfig.features.map(f => f.id);
            const definedPlans = baseConfig.supportedPlans;
            const definedRegions = baseConfig.supportedRegions;

            return fc.record({
              supportedPlans: fc.constant(baseConfig.supportedPlans),
              supportedRegions: fc.constant(baseConfig.supportedRegions),
              features: fc.constant(baseConfig.features),
              rules: fc.array(
                fc.oneof(
                  // Rule referencing undefined feature
                  fc.record({
                    id: fc.string().filter(s => s.trim().length > 0),
                    conditions: fc.array(
                      fc.record({
                        attribute: fc.constantFrom('plan', 'region'),
                        operator: fc.constant('equals'),
                        value: fc.oneof(
                          fc.constantFrom(...definedPlans),
                          fc.constantFrom(...definedRegions)
                        ),
                      }),
                      { minLength: 1 }
                    ),
                    features: fc.array(
                      fc
                        .string()
                        .filter(
                          s =>
                            s.trim().length > 0 &&
                            !definedFeatureIds.includes(s)
                        ),
                      { minLength: 1 }
                    ),
                  }),
                  // Rule referencing undefined plan
                  fc.record({
                    id: fc.string().filter(s => s.trim().length > 0),
                    conditions: fc.array(
                      fc.record({
                        attribute: fc.constant('plan'),
                        operator: fc.constant('equals'),
                        value: fc
                          .string()
                          .filter(
                            s =>
                              s.trim().length > 0 && !definedPlans.includes(s)
                          ),
                      }),
                      { minLength: 1 }
                    ),
                    features: fc.array(fc.constantFrom(...definedFeatureIds), {
                      minLength: 1,
                    }),
                  }),
                  // Rule referencing undefined region
                  fc.record({
                    id: fc.string().filter(s => s.trim().length > 0),
                    conditions: fc.array(
                      fc.record({
                        attribute: fc.constant('region'),
                        operator: fc.constant('equals'),
                        value: fc
                          .string()
                          .filter(
                            s =>
                              s.trim().length > 0 && !definedRegions.includes(s)
                          ),
                      }),
                      { minLength: 1 }
                    ),
                    features: fc.array(fc.constantFrom(...definedFeatureIds), {
                      minLength: 1,
                    }),
                  })
                ),
                { minLength: 1 }
              ),
            });
          }),
        config => {
          const result = loader.validateConfiguration(config);

          // Should always return invalid for configurations with referential integrity issues
          expect(result.isValid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);

          // Should contain specific error messages about undefined references
          const errorString = result.errors.join(' ');
          const hasReferentialIntegrityError =
            errorString.includes('references undefined feature') ||
            errorString.includes('references undefined plan') ||
            errorString.includes('references undefined region');

          expect(hasReferentialIntegrityError).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
