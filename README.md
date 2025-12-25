# Feature Flag Evaluator

A minimal feature flag evaluator that determines which features should be enabled for users based on their context (userId, region, plan). The system uses static rules to make feature flag decisions, providing a foundation for controlled feature rollouts and user-specific feature access.

## Project Structure

```
feature-flag-rules-kiro/
├── .git/                    # Git version control
├── .kiro/                   # Kiro IDE configuration
│   ├── specs/              # Feature specifications
│   └── steering/           # AI assistant guidance documents
├── .vscode/                # VS Code settings
├── src/                    # TypeScript source code
│   ├── types/              # Core interfaces and types
│   ├── config/             # Configuration constants
│   └── __tests__/          # Test files
├── dist/                   # Compiled JavaScript output
├── coverage/               # Test coverage reports
├── package.json            # Node.js dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── jest.config.js          # Jest testing configuration
├── .eslintrc.js           # ESLint configuration
├── LICENSE                 # MIT License
└── README.md              # This file
```

## Development Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
```bash
npm install
```

### Available Scripts
- `npm run build` - Compile TypeScript to JavaScript
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run clean` - Remove compiled output

### Core Interfaces

The project defines several key interfaces:

- **UserContext**: Input data containing userId, region, and plan
- **EvaluationResult**: Output containing success status and enabled features
- **FeatureRule**: Static rules that map user attributes to features
- **FeatureFlagEvaluator**: Main interface for feature flag evaluation

### Static Configuration

The system supports:
- **Plans**: Basic, Pro
- **Regions**: US, EU
- **Features**: 9 predefined features including analytics, support, and payment gateways

## Testing

The project uses Jest for unit testing and fast-check for property-based testing:

- Unit tests validate specific examples and edge cases
- Property-based tests verify universal properties across many inputs
- Both approaches ensure comprehensive coverage

## License

MIT License - see LICENSE file for details.

## Development Philosophy

This project demonstrates spec-driven development using Kiro IDE:
- All features are specified before implementation
- Clear requirements ensure testable behavior
- Minimal viable implementation focuses on core functionality first
Feature flag rules engine to illustrate spec-driven development using Kiro.

## Overview

This project demonstrates spec-driven development using the [Kiro](https://kiro.dev/) IDE. All features are specified before implementation, ensuring clear requirements and testable behavior.

## What it is
A minimal feature flag evaluator.

> Initial implementation

* Input: {userId, region, plan}
* Return enabled features
* Rules are static (e.g., Pro users get Feature X)
