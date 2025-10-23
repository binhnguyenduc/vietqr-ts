## Description

Please include a summary of the changes and the related issue. Explain the motivation and context.

Fixes # (issue)

## Type of Change

Please delete options that are not relevant.

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring (no functional changes)
- [ ] Test coverage improvement
- [ ] Dependency update
- [ ] CI/CD improvement

## Changes Made

Please provide a detailed list of changes:

-
-
-

## Testing

### Test Coverage

- [ ] All tests pass locally (`npm test`)
- [ ] Added new tests for changes
- [ ] Updated existing tests affected by changes
- [ ] Test coverage maintained or improved (run `npm run test:coverage`)

### Manual Testing

Describe the testing you performed to verify your changes:

1.
2.
3.

**Test configuration:**
- Node.js version:
- Operating System:
- Browser (if applicable):

## Code Quality

- [ ] Code follows project style guidelines (`npm run lint` passes)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Self-reviewed my own code
- [ ] Commented complex or unclear code sections
- [ ] No new compiler warnings or errors
- [ ] Build succeeds (`npm run build`)

## Documentation

- [ ] Updated README.md (if applicable)
- [ ] Updated API documentation in `docs/` (if applicable)
- [ ] Added/updated JSDoc comments for new/modified functions
- [ ] Updated CHANGELOG.md with changes
- [ ] Updated TypeScript type definitions (if applicable)

## Breaking Changes

**Does this PR introduce breaking changes?**

- [ ] Yes
- [ ] No

If yes, please describe the impact and migration path for existing users:

```typescript
// Before (old API)


// After (new API)

```

## Performance Impact

**Does this PR affect performance?**

- [ ] Yes - performance improvement
- [ ] Yes - performance regression (please explain necessity)
- [ ] No - no measurable performance impact
- [ ] Not applicable

If yes, provide benchmarks or measurements:

```
Before:
After:
```

## Specification Compliance

**Does this change affect NAPAS IBFT or EMVCo compliance?**

- [ ] Yes - updated to match specification
- [ ] No - unrelated to specifications
- [ ] Not applicable

If yes, provide specification references:

## Screenshots (if applicable)

If your changes include visual elements or affect output format, please add screenshots:

## Security Considerations

**Does this PR introduce security-related changes?**

- [ ] Yes - security improvement
- [ ] Yes - potential security impact (please explain)
- [ ] No - no security implications

If yes, describe security considerations:

## Dependencies

**Does this PR add, update, or remove dependencies?**

- [ ] Yes - added dependencies
- [ ] Yes - updated dependencies
- [ ] Yes - removed dependencies
- [ ] No - no dependency changes

If yes, explain the necessity and verify security:

| Dependency | Version | Purpose | License |
|------------|---------|---------|---------|
|            |         |         |         |

## Checklist

Before submitting, please ensure:

- [ ] I have read the [CONTRIBUTING](../CONTRIBUTING.md) guidelines
- [ ] My code follows the project's code style
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published
- [ ] I have updated the CHANGELOG.md
- [ ] I have checked my code runs on Node.js 18+ and 20+

## Additional Notes

Add any additional notes, context, or information for reviewers here.

---

**For Maintainers:**

- [ ] Reviewed and approved
- [ ] Tests pass in CI
- [ ] Documentation is adequate
- [ ] CHANGELOG updated
- [ ] Ready to merge
