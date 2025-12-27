# YAML Configuration Format Documentation

## Overview

The Feature Flag Evaluator uses YAML configuration files to define feature flag rules, supported plans, regions, and available features. This document describes the expected YAML structure, validation rules, and provides examples of valid and invalid configurations.

## Configuration Structure

The YAML configuration file must contain four main sections:

```yaml
supportedPlans:     # Array of valid subscription plans
supportedRegions:   # Array of valid geographical regions
features:           # Array of feature definitions with metadata
rules:              # Array of rules that determine feature availability
```

### Complete Structure Example

```yaml
supportedPlans:
  - Basic
  - Pro
  - Enterprise

supportedRegions:
  - US
  - EU
  - APAC

features:
  - id: feature-id
    name: Feature Name
    description: Optional feature description

rules:
  - id: rule-id
    conditions:
      - attribute: plan
        operator: equals
        value: Pro
    features:
      - feature-id
```

## Section Definitions

### 1. supportedPlans

**Purpose**: Defines all valid subscription plan values that can be used in user context and rule conditions.

**Structure**:
```yaml
supportedPlans:
  - Basic      # Entry-level plan
  - Pro        # Professional plan
  - Enterprise # Enterprise plan
```

**Requirements**:
- Must be an array
- Cannot be empty
- All values must be non-empty strings
- Values are case-sensitive
- No duplicate values allowed

### 2. supportedRegions

**Purpose**: Defines all valid geographical region values that can be used in user context and rule conditions.

**Structure**:
```yaml
supportedRegions:
  - US    # United States
  - EU    # European Union
  - APAC  # Asia-Pacific
```

**Requirements**:
- Must be an array
- Cannot be empty
- All values must be non-empty strings
- Values are case-sensitive
- No duplicate values allowed

### 3. features

**Purpose**: Defines all available features with their metadata. Each feature represents a capability that can be enabled or disabled for users.

**Structure**:
```yaml
features:
  - id: advanced-analytics           # Required: Unique identifier
    name: Advanced Analytics         # Required: Human-readable name
    description: Advanced reporting  # Optional: Detailed description
  
  - id: basic-dashboard
    name: Basic Dashboard
    # description is optional
```

**Requirements**:
- Must be an array
- Cannot be empty
- Each feature must be an object with required fields:
  - `id`: Unique string identifier (non-empty, used in rules)
  - `name`: Human-readable display name (non-empty string)
  - `description`: Optional detailed description (non-empty string if provided)
- Feature IDs must be unique across all features
- Feature IDs are used to reference features in rules

### 4. rules

**Purpose**: Defines the logic that determines which features are enabled based on user attributes.

**Structure**:
```yaml
rules:
  - id: rule-identifier              # Required: Unique rule ID
    conditions:                      # Required: Array of conditions
      - attribute: plan              # Required: 'plan', 'region', or 'userId'
        operator: equals             # Required: 'equals' or 'in'
        value: Pro                   # Required: Value to match
    features:                        # Required: Array of feature IDs
      - advanced-analytics
      - premium-support
```

**Requirements**:
- Must be an array
- Cannot be empty
- Each rule must be an object with required fields:
  - `id`: Unique string identifier for the rule
  - `conditions`: Array of condition objects (cannot be empty)
  - `features`: Array of feature ID strings (cannot be empty)

#### Rule Conditions

Each condition object must have:
- `attribute`: Must be one of `'plan'`, `'region'`, or `'userId'`
- `operator`: Must be one of `'equals'` or `'in'`
- `value`: The value(s) to match against

**Operator Behavior**:
- `equals`: Exact string match (case-sensitive)
- `in`: Match against array of values

**Examples**:
```yaml
# Single value condition
- attribute: plan
  operator: equals
  value: Pro

# Multiple value condition
- attribute: plan
  operator: in
  value: [Pro, Enterprise]

# Region condition
- attribute: region
  operator: equals
  value: US
```

## Validation Rules

The system performs comprehensive validation on configuration load:

### 1. Structural Validation

- All four main sections must be present
- Each section must be the correct type (array for all sections)
- No section can be empty
- All required fields must be present in objects

### 2. Data Type Validation

- Plan and region values must be non-empty strings
- Feature IDs and names must be non-empty strings
- Rule IDs must be non-empty strings
- Operators must be valid values (`'equals'` or `'in'`)
- Attributes must be valid values (`'plan'`, `'region'`, or `'userId'`)

### 3. Referential Integrity

- All rule condition values must exist in `supportedPlans` or `supportedRegions`
- All rule feature references must exist in the `features` section
- Feature IDs must be unique across all feature definitions
- Rule IDs should be unique (recommended but not enforced)

### 4. Value Constraints

- No empty strings or whitespace-only values
- Case-sensitive matching for all string comparisons
- Arrays cannot be empty where required

## Rule Evaluation Logic

### Condition Matching

- **ALL conditions within a rule must be satisfied** for the rule to apply
- Multiple conditions in a rule use AND logic
- Multiple rules that apply use OR logic (union of features)

### Feature Resolution

1. Evaluate all rules against user context
2. Collect features from all matching rules
3. Remove duplicate features
4. Sort features alphabetically
5. Return final feature list

### Example Evaluation

Given user context: `{ userId: "user123", region: "US", plan: "Pro" }`

```yaml
rules:
  - id: pro-features
    conditions:
      - attribute: plan
        operator: equals
        value: Pro
    features: [advanced-analytics, premium-support]
  
  - id: us-features
    conditions:
      - attribute: region
        operator: equals
        value: US
    features: [us-payment-gateway]
  
  - id: pro-us-combo
    conditions:
      - attribute: plan
        operator: equals
        value: Pro
      - attribute: region
        operator: equals
        value: US
    features: [compliance-tools]
```

**Result**: `[advanced-analytics, compliance-tools, premium-support, us-payment-gateway]`
(Union of all matching rules, deduplicated and sorted)

## Valid Configuration Examples

### Minimal Valid Configuration

```yaml
supportedPlans:
  - Basic

supportedRegions:
  - US

features:
  - id: basic-feature
    name: Basic Feature

rules:
  - id: basic-rule
    conditions:
      - attribute: plan
        operator: equals
        value: Basic
    features:
      - basic-feature
```

### Complex Valid Configuration

```yaml
supportedPlans:
  - Trial
  - Basic
  - Pro
  - Enterprise

supportedRegions:
  - US
  - EU
  - APAC

features:
  - id: basic-dashboard
    name: Basic Dashboard
    description: Standard dashboard with essential features
  
  - id: advanced-analytics
    name: Advanced Analytics
    description: Comprehensive analytics and reporting
  
  - id: api-access
    name: API Access
    description: Full REST API access
  
  - id: premium-support
    name: Premium Support
    description: 24/7 priority customer support
  
  - id: gdpr-compliance
    name: GDPR Compliance
    description: EU data protection compliance tools

rules:
  # Plan-based rules
  - id: trial-features
    conditions:
      - attribute: plan
        operator: equals
        value: Trial
    features:
      - basic-dashboard
  
  - id: premium-features
    conditions:
      - attribute: plan
        operator: in
        value: [Pro, Enterprise]
    features:
      - advanced-analytics
      - api-access
      - premium-support
  
  # Region-based rules
  - id: eu-compliance
    conditions:
      - attribute: region
        operator: equals
        value: EU
    features:
      - gdpr-compliance
  
  # Combined conditions
  - id: enterprise-eu-features
    conditions:
      - attribute: plan
        operator: equals
        value: Enterprise
      - attribute: region
        operator: equals
        value: EU
    features:
      - advanced-analytics
      - gdpr-compliance
```

## Invalid Configuration Examples

### Missing Required Sections

```yaml
# INVALID: Missing supportedRegions, features, and rules
supportedPlans:
  - Basic
```

**Error**: Configuration validation will fail due to missing required sections.

### Empty Arrays

```yaml
# INVALID: Empty arrays not allowed
supportedPlans: []
supportedRegions:
  - US
features:
  - id: feature1
    name: Feature 1
rules:
  - id: rule1
    conditions:
      - attribute: plan
        operator: equals
        value: Basic
    features:
      - feature1
```

**Error**: "supportedPlans cannot be empty"

### Invalid Feature Definition

```yaml
supportedPlans:
  - Basic
supportedRegions:
  - US
features:
  - id: ""              # INVALID: Empty ID
    name: Feature Name
  - name: Feature 2      # INVALID: Missing ID
rules:
  - id: rule1
    conditions:
      - attribute: plan
        operator: equals
        value: Basic
    features:
      - feature1
```

**Errors**: 
- "Feature at index 0 must have a non-empty id"
- "Feature at index 1 must have a non-empty id"

### Referential Integrity Violations

```yaml
supportedPlans:
  - Basic
supportedRegions:
  - US
features:
  - id: valid-feature
    name: Valid Feature
rules:
  - id: invalid-rule
    conditions:
      - attribute: plan
        operator: equals
        value: Premium        # INVALID: Not in supportedPlans
    features:
      - nonexistent-feature  # INVALID: Not in features
```

**Errors**:
- "Rule invalid-rule references undefined plan: Premium"
- "Rule invalid-rule references undefined feature: nonexistent-feature"

### Invalid Rule Structure

```yaml
supportedPlans:
  - Basic
supportedRegions:
  - US
features:
  - id: feature1
    name: Feature 1
rules:
  - id: bad-rule
    conditions:
      - attribute: invalid-attr  # INVALID: Not 'plan', 'region', or 'userId'
        operator: maybe          # INVALID: Not 'equals' or 'in'
        value: Basic
    features: []                 # INVALID: Empty features array
```

**Errors**:
- "Rule bad-rule condition 0 has invalid attribute: invalid-attr"
- "Rule bad-rule condition 0 has invalid operator: maybe"
- "Rule bad-rule must have non-empty features array"

### Invalid YAML Syntax

```yaml
supportedPlans:
  - Basic
supportedRegions:
  - US
features:
  - id: feature1
    name: Feature 1
rules:
  - id: rule1
    conditions:
      - attribute: plan
        operator: equals
        value: Basic
    features
      - feature1  # INVALID: Missing colon after 'features'
```

**Error**: YAML parse error due to syntax violation.

## Best Practices

### 1. Naming Conventions

- Use kebab-case for feature IDs: `advanced-analytics`, `premium-support`
- Use descriptive rule IDs: `pro-plan-features`, `eu-compliance-rules`
- Use clear, consistent plan names: `Basic`, `Pro`, `Enterprise`
- Use standard region codes: `US`, `EU`, `APAC`

### 2. Organization

- Group related features logically in the features section
- Order rules from most specific to most general
- Add comments to explain complex rule logic
- Use consistent indentation (2 spaces recommended)

### 3. Maintainability

- Keep feature descriptions up to date
- Use meaningful rule IDs that explain their purpose
- Avoid overly complex rule conditions
- Document any special business logic in comments

### 4. Testing

- Test configuration changes in a development environment first
- Validate configuration files before deployment
- Use the provided sample configurations as templates
- Test edge cases with various user contexts

## Configuration Loading

The system loads configuration at startup using the `ConfigurationLoader.loadFromFile()` method:

```typescript
const loader = new ConfigurationLoader();
const result = await loader.loadFromFile('feature-flags.yml');

if (result.success) {
  // Configuration loaded successfully
  console.log('Loaded configuration with', result.configuration.features.length, 'features');
} else {
  // Handle configuration error
  console.error('Configuration error:', result.error);
}
```

## Error Handling

Configuration errors are categorized as:

- **File Errors**: File not found, permission issues
- **Parse Errors**: Invalid YAML syntax
- **Validation Errors**: Invalid structure or referential integrity violations

All errors include descriptive messages to help identify and fix issues quickly.