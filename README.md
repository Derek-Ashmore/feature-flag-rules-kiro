# Feature Flag Evaluator

A minimal feature flag evaluator that determines which features should be enabled for users based on their context (userId, region, plan). The system uses static rules to make feature flag decisions, providing a foundation for controlled feature rollouts and user-specific feature access.

## Overview

This project demonstrates spec-driven development using the [Kiro](https://kiro.dev/) IDE. All features are specified before implementation, ensuring clear requirements and testable behavior.

## What it is
A minimal feature flag evaluator.

> Initial implementation

* Input: {userId, region, plan}
* Return enabled features
* Rules are static (e.g., Pro users get Feature X)

## Installation

```bash
npm install feature-flag-evaluator
```

## Usage

### Basic Example

```typescript
import { FeatureFlagEvaluator } from 'feature-flag-evaluator';

const evaluator = new FeatureFlagEvaluator();

// Evaluate features for a user
const result = evaluator.evaluate({
  userId: 'user123',
  region: 'US',
  plan: 'Pro'
});

if (result.success) {
  console.log('Enabled features:', result.features);
  // Output: ['advanced-analytics', 'api-access', 'premium-support', 'us-compliance-tools', 'us-payment-gateway']
} else {
  console.error('Error:', result.error);
}
```

### Using the Default Instance

For convenience, you can use the pre-configured default instance:

```typescript
import { defaultEvaluator } from 'feature-flag-evaluator';

const result = defaultEvaluator.evaluate({
  userId: 'user456',
  region: 'EU',
  plan: 'Basic'
});
```

## API Reference

### FeatureFlagEvaluator

The main class for evaluating feature flags.

#### `evaluate(context: UserContext): EvaluationResult`

Evaluates which features should be enabled for a given user context.

**Parameters:**
- `context` - User context object containing:
  - `userId` (string) - Unique identifier for the user (required, non-empty)
  - `region` (string) - User's region, must be 'US' or 'EU'
  - `plan` (string) - User's subscription plan, must be 'Basic' or 'Pro'

**Returns:**
- `EvaluationResult` object with:
  - `success` (boolean) - Whether evaluation succeeded
  - `features` (string[]) - Array of enabled feature identifiers (when success is true)
  - `error` (string) - Error message (when success is false)

**Example:**
```typescript
const result = evaluator.evaluate({
  userId: 'user789',
  region: 'US',
  plan: 'Basic'
});

// Result: { success: true, features: ['basic-dashboard', 'standard-support', 'us-compliance-tools', 'us-payment-gateway'] }
```

#### `getAvailableFeatures(): string[]`

Returns all possible feature identifiers that can be enabled.

**Returns:**
Array of feature identifiers, sorted alphabetically.

**Example:**
```typescript
const allFeatures = evaluator.getAvailableFeatures();
// Returns: ['advanced-analytics', 'api-access', 'basic-dashboard', 'eu-payment-gateway', 'gdpr-tools', 'premium-support', 'standard-support', 'us-compliance-tools', 'us-payment-gateway']
```

#### `getSupportedPlans(): string[]`

Returns all supported subscription plans.

**Returns:**
Array of supported plan identifiers: `['Basic', 'Pro']`

#### `getSupportedRegions(): string[]`

Returns all supported regions.

**Returns:**
Array of supported region identifiers: `['US', 'EU']`

## Feature Rules

The evaluator uses static rules to determine feature availability:

### Plan-Based Features

| Plan | Features |
|------|----------|
| **Basic** | `basic-dashboard`, `standard-support` |
| **Pro** | `advanced-analytics`, `premium-support`, `api-access` |

### Region-Based Features

| Region | Features |
|--------|----------|
| **US** | `us-payment-gateway`, `us-compliance-tools` |
| **EU** | `gdpr-tools`, `eu-payment-gateway` |

### Feature Combination

Users receive the **union** of all applicable features based on their plan and region. For example:

- **Pro + US**: Gets Pro features + US features
- **Basic + EU**: Gets Basic features + EU features

## Complete Feature List

| Feature | Description |
|---------|-------------|
| `advanced-analytics` | Advanced analytics dashboard (Pro only) |
| `api-access` | API access capabilities (Pro only) |
| `basic-dashboard` | Basic dashboard interface (Basic plan) |
| `eu-payment-gateway` | European payment processing (EU region) |
| `gdpr-tools` | GDPR compliance tools (EU region) |
| `premium-support` | Premium customer support (Pro only) |
| `standard-support` | Standard customer support (Basic plan) |
| `us-compliance-tools` | US compliance features (US region) |
| `us-payment-gateway` | US payment processing (US region) |

## Error Handling

The evaluator provides clear error messages for invalid inputs:

```typescript
// Missing userId
const result1 = evaluator.evaluate({
  userId: '',
  region: 'US',
  plan: 'Pro'
});
// Result: { success: false, error: 'Invalid or empty userId' }

// Invalid region
const result2 = evaluator.evaluate({
  userId: 'user123',
  region: 'INVALID',
  plan: 'Pro'
});
// Result: { success: false, error: 'Unsupported region' }

// Invalid plan
const result3 = evaluator.evaluate({
  userId: 'user123',
  region: 'US',
  plan: 'INVALID'
});
// Result: { success: false, error: 'Unsupported plan' }
```

## TypeScript Support

The library is written in TypeScript and provides full type definitions:

```typescript
import { 
  FeatureFlagEvaluator, 
  UserContext, 
  EvaluationResult,
  SupportedPlan,
  SupportedRegion,
  FeatureIdentifier
} from 'feature-flag-evaluator';

// Type-safe user context
const context: UserContext = {
  userId: 'user123',
  region: 'US' as SupportedRegion,
  plan: 'Pro' as SupportedPlan
};

const evaluator = new FeatureFlagEvaluator();
const result: EvaluationResult = evaluator.evaluate(context);
```

## Examples

### Check if Specific Feature is Enabled

```typescript
function hasFeature(userId: string, region: string, plan: string, featureId: string): boolean {
  const result = evaluator.evaluate({ userId, region, plan });
  return result.success && result.features?.includes(featureId) || false;
}

// Usage
if (hasFeature('user123', 'US', 'Pro', 'advanced-analytics')) {
  // Show advanced analytics dashboard
}
```

### Feature Flag Middleware (Express.js)

```typescript
import { Request, Response, NextFunction } from 'express';

function featureFlagMiddleware(req: Request, res: Response, next: NextFunction) {
  const { userId, region, plan } = req.user; // Assuming user info is available
  
  const result = evaluator.evaluate({ userId, region, plan });
  
  if (result.success) {
    req.enabledFeatures = result.features;
  } else {
    req.enabledFeatures = [];
  }
  
  next();
}

// Usage in route
app.get('/dashboard', featureFlagMiddleware, (req, res) => {
  const features = req.enabledFeatures;
  
  if (features.includes('advanced-analytics')) {
    // Include advanced analytics in response
  }
  
  res.json({ features });
});
```

### Batch Evaluation

```typescript
const users = [
  { userId: 'user1', region: 'US', plan: 'Pro' },
  { userId: 'user2', region: 'EU', plan: 'Basic' },
  { userId: 'user3', region: 'US', plan: 'Basic' }
];

const results = users.map(user => ({
  userId: user.userId,
  ...evaluator.evaluate(user)
}));

console.log(results);
```

## For Developers

For detailed development information including project structure, setup instructions, code quality guidelines, and testing strategies, see the [Developer Guide](./DEVELOPER_GUIDE.md).

## License

MIT License - see LICENSE file for details.

## Development Philosophy

This project demonstrates spec-driven development using Kiro IDE:
- All features are specified before implementation
- Clear requirements ensure testable behavior
- Minimal viable implementation focuses on core functionality first

Feature flag rules engine to illustrate spec-driven development using Kiro.

