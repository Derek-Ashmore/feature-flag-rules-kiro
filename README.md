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

## Quick Start

### Installation
```bash
npm install
```

### Basic Usage
```bash
# Run tests
npm test

# Build the project
npm run build

# Run all quality checks
npm run ci:check
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

