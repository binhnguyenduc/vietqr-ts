# Context7-Style LLM-Friendly Documentation

## Overview

This directory contains LLM-optimized documentation for the VietQR-TS library, formatted for easy retrieval and understanding by AI assistants and language models.

## Documentation Structure

### 📚 [API Reference](./api-reference.md)
**Purpose**: Complete API documentation with signatures, parameters, and examples

**Contains**:
- Core function signatures and type definitions
- Detailed parameter descriptions
- Return value specifications
- Code examples for every function
- Utility functions and type guards
- Constants and error codes
- Platform support information

**Use this when**:
- Looking up function signatures
- Understanding parameter requirements
- Finding return types
- Checking supported platforms

---

### 🎯 [Common Patterns](./common-patterns.md)
**Purpose**: Real-world usage patterns and best practices

**Contains**:
- Basic payment QR generation pattern
- Invoice payment QR pattern
- QR validation workflow
- Multi-format QR generation
- Branded QR codes
- Batch processing
- Caching strategies
- QR scanner integration
- Error handling patterns
- Performance best practices
- Security guidelines

**Use this when**:
- Building specific features
- Optimizing performance
- Implementing security measures
- Following best practices
- Solving common use cases

---

### 🔧 [Troubleshooting](./troubleshooting.md)
**Purpose**: Error resolution and debugging guide

**Contains**:
- Quick diagnostic procedures
- Common error messages and solutions
- Module import issues
- Performance optimization
- Browser-specific problems
- Memory management
- Debugging strategies
- Bug reporting guidelines

**Use this when**:
- Encountering errors
- Debugging issues
- Performance problems
- Integration challenges
- Seeking help

---

## Documentation Features

### ✅ LLM-Optimized Structure

1. **Clear Metadata**: Each file has library name, version, category
2. **Hierarchical Sections**: Logical organization with descriptive headings
3. **Code Examples**: Every concept has working code samples
4. **Type Information**: Full TypeScript types and signatures
5. **Searchable Content**: Keywords and tags for easy retrieval
6. **Self-Contained**: Each section can be understood independently

### ✅ Context7 Compatibility

This documentation is optimized for Context7 MCP server retrieval:

- **Structured Headings**: Clear hierarchy for navigation
- **Code Snippets**: Annotated with usage context
- **Type Signatures**: Explicit parameter and return types
- **Examples**: Multiple real-world scenarios
- **Cross-References**: Links to related concepts
- **Error Handling**: Comprehensive error scenarios

### ✅ Use Cases by Role

**For Developers**:
- Quick API lookups
- Copy-paste code examples
- Understanding error messages
- Performance optimization tips

**For AI Assistants**:
- Accurate code generation
- Context-aware suggestions
- Error diagnosis
- Best practice recommendations

**For Documentation Tools**:
- Easy parsing and indexing
- Semantic search optimization
- Auto-completion support
- IDE integration

---

## How to Use

### For Human Developers

Browse the documentation files directly:

```bash
# Read API reference
cat docs/context7/api-reference.md

# Search for specific topic
grep -r "generateVietQR" docs/context7/

# View in browser
open docs/context7/api-reference.md
```

### For LLM Tools (Context7 MCP)

Query using Context7 server:

```typescript
// Example: Query for QR generation patterns
const docs = await context7.query({
  library: '/binhnguyenduc/vietqr-ts',
  topic: 'QR generation',
  depth: 'detailed'
});
```

### For IDE Integration

Import as documentation provider:

```json
// VS Code settings.json
{
  "typescript.suggest.paths": true,
  "docs.sources": [
    "docs/context7/**/*.md"
  ]
}
```

---

## Documentation Conventions

### Code Blocks

All code examples are executable and follow this pattern:

```typescript
// ❌ Wrong - shows incorrect usage
const badExample = incorrectCode();

// ✅ Correct - shows proper usage
const goodExample = correctCode();

// Usage context and explanation
// Expected output or behavior
```

### Type Definitions

Types are shown inline with usage:

```typescript
function generateVietQR(config: VietQRConfig): VietQRResult

interface VietQRConfig {
  bankBin: string;      // Required: 6-digit bank code
  accountNumber: string; // Required: Account or card number
  // ... more fields
}
```

### Error Handling

Errors include type, message, and solution:

```typescript
// Error type
DecodingErrorType.NO_QR_CODE_FOUND

// Error message
"No QR code found in image"

// Solution
// 1. Check image quality
// 2. Ensure QR code is visible
// 3. Verify image format (PNG/JPEG)
```

---

## Quick Reference

### Finding Information

| Need | Document | Section |
|------|----------|---------|
| Function signature | API Reference | Core Functions |
| Usage example | Common Patterns | Pattern: [Name] |
| Error solution | Troubleshooting | Error: [Message] |
| Type definition | API Reference | Type definitions inline |
| Best practices | Common Patterns | Best Practices sections |
| Performance tips | Common Patterns | Performance Optimization |

### Common Queries

**"How do I generate a QR code?"**
→ [API Reference: generateVietQR](./api-reference.md#generatevietqr)
→ [Pattern: Basic Payment QR](./common-patterns.md#pattern-basic-payment-qr-generation)

**"Error: Bank BIN must be 6 digits"**
→ [Troubleshooting: Bank BIN Error](./troubleshooting.md#error-bank-bin-must-be-exactly-6-digits)

**"How to validate QR before processing?"**
→ [Pattern: QR Validation](./common-patterns.md#pattern-qr-code-validation-before-processing)

**"How to handle large batches?"**
→ [Pattern: Batch Generation](./common-patterns.md#pattern-batch-qr-generation)
→ [Troubleshooting: Performance](./troubleshooting.md#performance-issues)

---

## Contributing to Documentation

### Adding New Patterns

```markdown
## Pattern: [Descriptive Name]

**Use Case**: [When to use this pattern]

**Code:**
\`\`\`typescript
// Implementation
\`\`\`

**When to Use:**
- Scenario 1
- Scenario 2

**Best Practices:**
- Tip 1
- Tip 2
```

### Adding Troubleshooting Entries

```markdown
### Error: "[Error Message]"

**Cause**: [Why this error occurs]

**Solutions:**

\`\`\`typescript
// ❌ Wrong
incorrectCode();

// ✅ Correct
correctCode();
\`\`\`

**Prevention:**
- How to avoid this error
```

---

## Feedback

Help us improve this documentation:

- **Issues**: [GitHub Issues](https://github.com/binhnguyenduc/vietqr-ts/issues)
- **Suggestions**: [Discussions](https://github.com/binhnguyenduc/vietqr-ts/discussions)
- **Corrections**: Submit PR with documentation updates

---

## Version History

- **v1.0.0** (2025-10-23): Initial Context7-style documentation
  - Complete API reference
  - Common patterns and recipes
  - Comprehensive troubleshooting guide

---

## Related Resources

- [Main README](../../README.md) - Project overview
- [API Examples](../../examples/) - Runnable code samples
- [Architecture Docs](../architecture.md) - System design
- [Roadmap](../../ROADMAP.md) - Future plans
- [NAPAS Specification](https://napas.com.vn) - Official spec

---

**Optimized for**: Claude, GPT-4, Context7 MCP, GitHub Copilot, and other AI coding assistants
