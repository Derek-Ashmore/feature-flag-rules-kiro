/**
 * Tests for InputValidator implementation
 */

import { InputValidatorImpl } from '../validation/InputValidator';
import { UserContext, EvaluationError } from '../types';

describe('InputValidator', () => {
  let validator: InputValidatorImpl;

  beforeEach(() => {
    validator = new InputValidatorImpl();
  });

  describe('Valid inputs', () => {
    test('should validate correct UserContext', () => {
      const context: UserContext = {
        userId: 'test-user-123',
        region: 'US',
        plan: 'Pro',
      };

      const result = validator.validate(context);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should validate Basic plan', () => {
      const context: UserContext = {
        userId: 'user-456',
        region: 'EU',
        plan: 'Basic',
      };

      const result = validator.validate(context);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Invalid inputs', () => {
    test('should reject null context', () => {
      const result = validator.validate(null as any);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(EvaluationError.MISSING_CONTEXT);
    });

    test('should reject undefined context', () => {
      const result = validator.validate(undefined as any);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(EvaluationError.MISSING_CONTEXT);
    });

    test('should reject empty userId', () => {
      const context: UserContext = {
        userId: '',
        region: 'US',
        plan: 'Pro',
      };

      const result = validator.validate(context);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(EvaluationError.INVALID_USER_ID);
    });

    test('should reject whitespace-only userId', () => {
      const context: UserContext = {
        userId: '   ',
        region: 'US',
        plan: 'Pro',
      };

      const result = validator.validate(context);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(EvaluationError.INVALID_USER_ID);
    });

    test('should reject unsupported region', () => {
      const context: UserContext = {
        userId: 'test-user',
        region: 'ASIA',
        plan: 'Pro',
      };

      const result = validator.validate(context);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(EvaluationError.UNSUPPORTED_REGION);
    });

    test('should reject unsupported plan', () => {
      const context: UserContext = {
        userId: 'test-user',
        region: 'US',
        plan: 'Enterprise',
      };

      const result = validator.validate(context);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(EvaluationError.UNSUPPORTED_PLAN);
    });

    test('should collect multiple validation errors', () => {
      const context: UserContext = {
        userId: '',
        region: 'INVALID',
        plan: 'INVALID',
      };

      const result = validator.validate(context);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors).toContain(EvaluationError.INVALID_USER_ID);
      expect(result.errors).toContain(EvaluationError.UNSUPPORTED_REGION);
      expect(result.errors).toContain(EvaluationError.UNSUPPORTED_PLAN);
    });
  });

  describe('Edge cases for userId validation', () => {
    test('should reject userId with only tabs', () => {
      const context: UserContext = {
        userId: '\t\t\t',
        region: 'US',
        plan: 'Pro',
      };

      const result = validator.validate(context);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(EvaluationError.INVALID_USER_ID);
    });

    test('should reject userId with only newlines', () => {
      const context: UserContext = {
        userId: '\n\n',
        region: 'US',
        plan: 'Pro',
      };

      const result = validator.validate(context);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(EvaluationError.INVALID_USER_ID);
    });

    test('should reject userId with mixed whitespace characters', () => {
      const context: UserContext = {
        userId: ' \t\n\r ',
        region: 'US',
        plan: 'Pro',
      };

      const result = validator.validate(context);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(EvaluationError.INVALID_USER_ID);
    });

    test('should reject null userId', () => {
      const context = {
        userId: null,
        region: 'US',
        plan: 'Pro',
      } as any;

      const result = validator.validate(context);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(EvaluationError.INVALID_USER_ID);
    });

    test('should reject undefined userId', () => {
      const context = {
        userId: undefined,
        region: 'US',
        plan: 'Pro',
      } as any;

      const result = validator.validate(context);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(EvaluationError.INVALID_USER_ID);
    });

    test('should reject non-string userId (number)', () => {
      const context = {
        userId: 12345,
        region: 'US',
        plan: 'Pro',
      } as any;

      const result = validator.validate(context);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(EvaluationError.INVALID_USER_ID);
    });

    test('should reject non-string userId (boolean)', () => {
      const context = {
        userId: true,
        region: 'US',
        plan: 'Pro',
      } as any;

      const result = validator.validate(context);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(EvaluationError.INVALID_USER_ID);
    });

    test('should reject non-string userId (object)', () => {
      const context = {
        userId: { id: 'test' },
        region: 'US',
        plan: 'Pro',
      } as any;

      const result = validator.validate(context);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(EvaluationError.INVALID_USER_ID);
    });
  });

  describe('Edge cases for region validation', () => {
    test('should reject null region', () => {
      const context = {
        userId: 'test-user',
        region: null,
        plan: 'Pro',
      } as any;

      const result = validator.validate(context);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(EvaluationError.UNSUPPORTED_REGION);
    });

    test('should reject undefined region', () => {
      const context = {
        userId: 'test-user',
        region: undefined,
        plan: 'Pro',
      } as any;

      const result = validator.validate(context);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(EvaluationError.UNSUPPORTED_REGION);
    });

    test('should reject empty string region', () => {
      const context: UserContext = {
        userId: 'test-user',
        region: '',
        plan: 'Pro',
      };

      const result = validator.validate(context);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(EvaluationError.UNSUPPORTED_REGION);
    });

    test('should reject non-string region (number)', () => {
      const context = {
        userId: 'test-user',
        region: 123,
        plan: 'Pro',
      } as any;

      const result = validator.validate(context);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(EvaluationError.UNSUPPORTED_REGION);
    });

    test('should reject case-sensitive region variations', () => {
      const testCases = ['us', 'Us', 'uS', 'eu', 'Eu', 'eU'];

      testCases.forEach(region => {
        const context: UserContext = {
          userId: 'test-user',
          region,
          plan: 'Pro',
        };

        const result = validator.validate(context);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(EvaluationError.UNSUPPORTED_REGION);
      });
    });

    test('should reject region with extra whitespace', () => {
      const testCases = [' US', 'US ', ' US ', '\tEU', 'EU\n'];

      testCases.forEach(region => {
        const context: UserContext = {
          userId: 'test-user',
          region,
          plan: 'Pro',
        };

        const result = validator.validate(context);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(EvaluationError.UNSUPPORTED_REGION);
      });
    });
  });

  describe('Edge cases for plan validation', () => {
    test('should reject null plan', () => {
      const context = {
        userId: 'test-user',
        region: 'US',
        plan: null,
      } as any;

      const result = validator.validate(context);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(EvaluationError.UNSUPPORTED_PLAN);
    });

    test('should reject undefined plan', () => {
      const context = {
        userId: 'test-user',
        region: 'US',
        plan: undefined,
      } as any;

      const result = validator.validate(context);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(EvaluationError.UNSUPPORTED_PLAN);
    });

    test('should reject empty string plan', () => {
      const context: UserContext = {
        userId: 'test-user',
        region: 'US',
        plan: '',
      };

      const result = validator.validate(context);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(EvaluationError.UNSUPPORTED_PLAN);
    });

    test('should reject non-string plan (number)', () => {
      const context = {
        userId: 'test-user',
        region: 'US',
        plan: 456,
      } as any;

      const result = validator.validate(context);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(EvaluationError.UNSUPPORTED_PLAN);
    });

    test('should reject case-sensitive plan variations', () => {
      const testCases = ['basic', 'BASIC', 'Basic', 'pro', 'PRO', 'Pro'];
      const expectedValid = ['Basic', 'Pro']; // Only exact matches should be valid

      testCases.forEach(plan => {
        const context: UserContext = {
          userId: 'test-user',
          region: 'US',
          plan,
        };

        const result = validator.validate(context);

        if (expectedValid.includes(plan)) {
          expect(result.isValid).toBe(true);
        } else {
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain(EvaluationError.UNSUPPORTED_PLAN);
        }
      });
    });

    test('should reject plan with extra whitespace', () => {
      const testCases = [' Basic', 'Basic ', ' Basic ', '\tPro', 'Pro\n'];

      testCases.forEach(plan => {
        const context: UserContext = {
          userId: 'test-user',
          region: 'US',
          plan,
        };

        const result = validator.validate(context);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(EvaluationError.UNSUPPORTED_PLAN);
      });
    });
  });

  describe('Boundary conditions for supported values', () => {
    test('should accept exact supported region values', () => {
      const supportedRegions = ['US', 'EU'];

      supportedRegions.forEach(region => {
        const context: UserContext = {
          userId: 'test-user',
          region,
          plan: 'Pro',
        };

        const result = validator.validate(context);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    test('should accept exact supported plan values', () => {
      const supportedPlans = ['Basic', 'Pro'];

      supportedPlans.forEach(plan => {
        const context: UserContext = {
          userId: 'test-user',
          region: 'US',
          plan,
        };

        const result = validator.validate(context);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    test('should reject values just outside supported boundaries', () => {
      const invalidRegions = ['USA', 'Europe', 'UK', 'CA'];
      const invalidPlans = ['Free', 'Premium', 'Enterprise', 'Starter'];

      invalidRegions.forEach(region => {
        const context: UserContext = {
          userId: 'test-user',
          region,
          plan: 'Pro',
        };

        const result = validator.validate(context);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(EvaluationError.UNSUPPORTED_REGION);
      });

      invalidPlans.forEach(plan => {
        const context: UserContext = {
          userId: 'test-user',
          region: 'US',
          plan,
        };

        const result = validator.validate(context);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(EvaluationError.UNSUPPORTED_PLAN);
      });
    });
  });
});
