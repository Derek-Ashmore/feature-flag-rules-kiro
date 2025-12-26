# Developer Guide

This guide contains detailed information for developers working on the Feature Flag Evaluator project.

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
└── README.md              # Project overview
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
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking
- `npm run ci:check` - Run all quality checks (lint, format, type-check, test)
- `npm run clean` - Remove compiled output

## Code Quality

The project enforces code quality through multiple automated checks:

### Linting
- **ESLint** with TypeScript support
- **Prettier** for consistent code formatting
- Strict rules for type safety and code consistency

### Testing
- **Unit tests** for specific examples and edge cases
- **Property-based tests** for comprehensive input coverage
- **Coverage thresholds**: 80% minimum for statements, branches, functions, and lines

### Continuous Integration
- **GitHub Actions** workflows for automated quality checks
- **Pull request validation** with linting, formatting, type checking, and testing
- **Coverage reporting** with Codecov integration
- **Automated formatting checks** to ensure consistent code style

### Quality Commands
```bash
# Run all quality checks
npm run ci:check

# Individual checks
npm run lint          # Check code style and potential issues
npm run format:check  # Verify code formatting
npm run type-check    # Validate TypeScript types
npm run test:coverage # Run tests with coverage report
```

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

### Testing Strategy
- **Unit tests** validate specific examples and edge cases
- **Property-based tests** verify universal properties across many inputs
- Both approaches ensure comprehensive coverage

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Organization
- Tests are located in `src/__tests__/` directory
- Property-based tests use the `.property.test.ts` suffix
- Unit tests use the `.test.ts` suffix
- Integration tests combine multiple components

### Coverage Requirements
The project maintains high test coverage standards:
- **Statements**: 80% minimum
- **Branches**: 80% minimum  
- **Functions**: 80% minimum
- **Lines**: 80% minimum

### Property-Based Testing
Property-based tests validate universal properties using the fast-check library:
- Each property test runs 100+ iterations with random inputs
- Tests validate correctness properties defined in the design specification
- Properties ensure the system behaves correctly across all valid input combinations

## Development Workflow

### Spec-Driven Development
This project follows a spec-driven development approach:

1. **Requirements**: Define clear, testable requirements using EARS patterns
2. **Design**: Create comprehensive design with correctness properties
3. **Implementation**: Build features incrementally based on the design
4. **Testing**: Validate implementation against requirements through property-based and unit testing

### Code Style
- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Write descriptive variable and function names
- Add JSDoc comments for public interfaces
- Keep functions small and focused

### Git Workflow
- Create feature branches for new development
- Write clear commit messages
- Ensure all tests pass before committing
- Use pull requests for code review

### Quality Gates
Before merging code:
1. All tests must pass
2. Code coverage must meet thresholds
3. Linting must pass without errors
4. Code must be properly formatted
5. TypeScript compilation must succeed

## Architecture

### Component Overview
- **FeatureFlagEvaluator**: Main interface and orchestration
- **InputValidator**: Validates user context inputs
- **RuleEngine**: Evaluates static rules against user context
- **Configuration**: Static rules and supported values

### Data Flow
1. User context enters through main evaluation interface
2. Input validator checks for required fields and valid values
3. Rule engine evaluates applicable rules based on user attributes
4. Results are combined, deduplicated, and sorted
5. Final feature list is returned to caller

### Error Handling
- Fail fast with clear error messages
- Consistent error response format
- No partial results - either complete success or clear failure
- Comprehensive input validation before processing