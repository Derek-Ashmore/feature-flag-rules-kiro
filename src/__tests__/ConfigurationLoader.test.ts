/**
 * Unit tests for ConfigurationLoader
 */

import * as fs from 'fs';
import * as path from 'path';
import { ConfigurationLoader } from '../config/ConfigurationLoader';
import { EvaluationError } from '../types';

describe('ConfigurationLoader', () => {
  let loader: ConfigurationLoader;
  let tempDir: string;

  beforeEach(() => {
    loader = new ConfigurationLoader();
    tempDir = path.join(__dirname, 'temp');

    // Create temp directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up temp files
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(tempDir, file));
      });
      fs.rmdirSync(tempDir);
    }
  });

  describe('loadFromFile', () => {
    it('should return error when file does not exist', async () => {
      const result = await loader.loadFromFile('nonexistent.yml');

      expect(result.success).toBe(false);
      expect(result.error).toBe(EvaluationError.CONFIG_FILE_NOT_FOUND);
      expect(result.configuration).toBeUndefined();
    });

    it('should return error when YAML is invalid', async () => {
      const invalidYaml = 'invalid: yaml: content: [unclosed';
      const filePath = path.join(tempDir, 'invalid.yml');
      fs.writeFileSync(filePath, invalidYaml);

      const result = await loader.loadFromFile(filePath);

      expect(result.success).toBe(false);
      expect(result.error).toContain(EvaluationError.CONFIG_PARSE_ERROR);
      expect(result.configuration).toBeUndefined();
    });

    it('should return error when configuration structure is invalid', async () => {
      const invalidConfig = 'invalid: structure';
      const filePath = path.join(tempDir, 'invalid-structure.yml');
      fs.writeFileSync(filePath, invalidConfig);

      const result = await loader.loadFromFile(filePath);

      expect(result.success).toBe(false);
      expect(result.error).toContain(EvaluationError.CONFIG_VALIDATION_ERROR);
      expect(result.configuration).toBeUndefined();
    });

    it('should successfully load valid YAML configuration', async () => {
      const validConfig = `
supportedPlans:
  - Basic
  - Pro

supportedRegions:
  - US
  - EU

features:
  - id: basic-feature
    name: Basic Feature
    description: A basic feature
  - id: pro-feature
    name: Pro Feature

rules:
  - id: basic-rule
    conditions:
      - attribute: plan
        operator: equals
        value: Basic
    features:
      - basic-feature
  - id: pro-rule
    conditions:
      - attribute: plan
        operator: equals
        value: Pro
    features:
      - pro-feature
`;
      const filePath = path.join(tempDir, 'valid.yml');
      fs.writeFileSync(filePath, validConfig);

      const result = await loader.loadFromFile(filePath);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.configuration).toBeDefined();
      expect(result.configuration!.supportedPlans).toEqual(['Basic', 'Pro']);
      expect(result.configuration!.supportedRegions).toEqual(['US', 'EU']);
      expect(result.configuration!.features).toHaveLength(2);
      expect(result.configuration!.rules).toHaveLength(2);
    });
  });

  describe('validateConfiguration', () => {
    it('should reject null configuration', () => {
      const result = loader.validateConfiguration(null);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Configuration must be an object');
    });

    it('should reject configuration without supportedPlans', () => {
      const config = {
        supportedRegions: ['US'],
        features: [{ id: 'test', name: 'Test' }],
        rules: [{ id: 'test', conditions: [], features: [] }],
      };

      const result = loader.validateConfiguration(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('supportedPlans must be an array');
    });

    it('should reject configuration with empty supportedPlans', () => {
      const config = {
        supportedPlans: [],
        supportedRegions: ['US'],
        features: [{ id: 'test', name: 'Test' }],
        rules: [{ id: 'test', conditions: [], features: [] }],
      };

      const result = loader.validateConfiguration(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('supportedPlans cannot be empty');
    });

    it('should reject configuration with invalid feature structure', () => {
      const config = {
        supportedPlans: ['Basic'],
        supportedRegions: ['US'],
        features: [{ name: 'Test' }], // missing id
        rules: [{ id: 'test', conditions: [], features: [] }],
      };

      const result = loader.validateConfiguration(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Feature at index 0 must have a non-empty id'
      );
    });

    it('should reject configuration with duplicate feature ids', () => {
      const config = {
        supportedPlans: ['Basic'],
        supportedRegions: ['US'],
        features: [
          { id: 'test', name: 'Test 1' },
          { id: 'test', name: 'Test 2' },
        ],
        rules: [{ id: 'test', conditions: [], features: [] }],
      };

      const result = loader.validateConfiguration(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Duplicate feature id: test');
    });

    it('should reject rules that reference undefined features', () => {
      const config = {
        supportedPlans: ['Basic'],
        supportedRegions: ['US'],
        features: [{ id: 'existing', name: 'Existing' }],
        rules: [
          {
            id: 'test-rule',
            conditions: [
              { attribute: 'plan', operator: 'equals', value: 'Basic' },
            ],
            features: ['nonexistent'],
          },
        ],
      };

      const result = loader.validateConfiguration(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Rule test-rule references undefined feature: nonexistent'
      );
    });

    it('should reject rules that reference undefined plans', () => {
      const config = {
        supportedPlans: ['Basic'],
        supportedRegions: ['US'],
        features: [{ id: 'test', name: 'Test' }],
        rules: [
          {
            id: 'test-rule',
            conditions: [
              { attribute: 'plan', operator: 'equals', value: 'Nonexistent' },
            ],
            features: ['test'],
          },
        ],
      };

      const result = loader.validateConfiguration(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Rule test-rule references undefined plan: Nonexistent'
      );
    });

    it('should accept valid configuration', () => {
      const config = {
        supportedPlans: ['Basic', 'Pro'],
        supportedRegions: ['US', 'EU'],
        features: [
          { id: 'basic-feature', name: 'Basic Feature' },
          {
            id: 'pro-feature',
            name: 'Pro Feature',
            description: 'A premium feature',
          },
        ],
        rules: [
          {
            id: 'basic-rule',
            conditions: [
              { attribute: 'plan', operator: 'equals', value: 'Basic' },
            ],
            features: ['basic-feature'],
          },
          {
            id: 'pro-rule',
            conditions: [
              { attribute: 'plan', operator: 'equals', value: 'Pro' },
            ],
            features: ['pro-feature'],
          },
        ],
      };

      const result = loader.validateConfiguration(config);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
