# Contributing to VietQR

Thank you for your interest in contributing to VietQR! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/vietqr-ts.git
   cd vietqr-ts
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/binhnguyenduc/vietqr-ts.git
   ```

## Development Setup

### Prerequisites

- Node.js 18.x or later
- npm 9.x or later

### Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linter
npm run lint

# Run type checking
npm run type-check
```

## Development Workflow

1. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes** following the coding standards

3. **Test your changes**:
   ```bash
   npm run build
   npm run type-check
   npm run lint
   npm test
   ```

4. **Commit your changes** following the commit guidelines

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** from your fork to the main repository

## Coding Standards

### TypeScript

- Use strict TypeScript typing - no `any` types unless absolutely necessary
- Enable all strict compiler options (already configured in `tsconfig.json`)
- Prefer interfaces over types for object shapes
- Use meaningful variable and function names
- Document complex logic with comments

### Code Style

- Follow the ESLint configuration (`.eslintrc`)
- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in multi-line objects/arrays
- Maximum line length: 100 characters (soft limit)

### File Organization

- Place new features in appropriate directories:
  - `src/generators/` - QR generation logic
  - `src/parsers/` - QR parsing logic
  - `src/validators/` - Validation rules
  - `src/decoders/` - Image decoding logic
  - `src/utils/` - Utility functions
  - `src/types/` - TypeScript type definitions

## Testing Guidelines

### Test Requirements

- All new features **must** include tests
- Bug fixes **must** include regression tests
- Maintain minimum 95% code coverage
- Tests must pass before submitting PR

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest';
import { yourFunction } from '../path/to/module';

describe('YourFeature', () => {
  it('should handle valid input correctly', () => {
    const result = yourFunction(validInput);
    expect(result).toEqual(expectedOutput);
  });

  it('should throw error for invalid input', () => {
    expect(() => yourFunction(invalidInput)).toThrow('Expected error message');
  });
});
```

### Test Organization

- Place tests in `tests/` directory, mirroring `src/` structure
- Use descriptive test names that explain the scenario
- Group related tests using `describe` blocks
- Test edge cases and error conditions

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring without changing functionality
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates

### Examples

```bash
feat(parser): add support for additional data field 62

fix(validator): correct CRC checksum validation logic

docs(readme): update API examples with error handling

test(generator): add tests for edge cases in amount formatting
```

## Pull Request Process

### Before Submitting

1. **Update documentation** if you've changed APIs
2. **Add/update tests** for your changes
3. **Run the full test suite** and ensure it passes
4. **Update CHANGELOG.md** if applicable
5. **Ensure your code is formatted** and linted

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update

## Testing
- [ ] All tests pass locally
- [ ] Added new tests for changes
- [ ] Updated existing tests if needed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-reviewed my own code
- [ ] Commented complex code sections
- [ ] Updated documentation
- [ ] No new warnings generated
- [ ] Added tests that prove fix/feature works
- [ ] New and existing tests pass locally
```

### Review Process

- Maintainers will review your PR within 3-5 business days
- Address review feedback promptly
- Once approved, maintainers will merge your PR

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. **Clear title** describing the issue
2. **VietQR version** you're using
3. **Node.js version** (`node --version`)
4. **Steps to reproduce** the issue
5. **Expected behavior** vs **actual behavior**
6. **Code sample** demonstrating the issue
7. **Error messages** or stack traces if applicable

### Feature Requests

When suggesting features:

1. **Describe the problem** you're trying to solve
2. **Proposed solution** with examples
3. **Alternatives considered**
4. **Impact assessment** (breaking change? performance impact?)

### Security Vulnerabilities

**Do not** open public issues for security vulnerabilities. Please refer to [SECURITY.md](SECURITY.md) for the responsible disclosure process.

## Questions?

If you have questions about contributing:

- Check existing [issues](https://github.com/binhnguyenduc/vietqr-ts/issues)
- Review [documentation](./docs/)
- Open a [discussion](https://github.com/binhnguyenduc/vietqr-ts/discussions) for general questions

## License

By contributing to VietQR, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to VietQR! 🎉
