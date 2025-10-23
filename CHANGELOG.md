# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-01-23

### Changed
- **BREAKING**: Package name changed from `vietqr` to `vietqr-ts` (npm registry conflict)
- Updated all documentation to reflect new package name
- Dropped Node.js 18 support (minimum version: Node.js 20.x)

### Added
- LICENSE file with MIT license text
- CONTRIBUTING.md with development guidelines
- SECURITY.md with vulnerability reporting process
- CODE_OF_CONDUCT.md (Contributor Covenant v2.1)
- GitHub issue templates (bug report, feature request)
- GitHub pull request template
- Dependabot configuration for automated dependency updates
- Automated release workflow with npm publishing
- Publish validation in CI workflow
- Comprehensive examples directory with runnable code samples
- Architecture documentation (docs/architecture.md)
- FAQ documentation (docs/faq.md)
- Repository badges in README

### Fixed
- Security audit now fails CI on vulnerabilities
- Updated vite to 7.1.12 to resolve security vulnerability (GHSA-93m4-6634-74q7)

### Improved
- Enhanced CI workflow with Node.js 20.x and 22.x testing
- Added package validation and dry-run publish checks in CI
- Updated GitHub Actions to latest versions (checkout@v5, setup-node@v6)

## [0.1.1] - 2024-10-23

### Added
- LICENSE file with MIT license text
- CONTRIBUTING.md with development guidelines
- SECURITY.md with vulnerability reporting process
- CHANGELOG.md for version tracking
- CODE_OF_CONDUCT.md (Contributor Covenant v2.1)
- GitHub issue templates (bug report, feature request)
- GitHub pull request template
- Dependabot configuration for automated dependency updates
- Automated release workflow (.github/workflows/release.yml)
- Comprehensive examples directory with runnable code samples
- Architecture documentation (docs/architecture.md)
- FAQ documentation (docs/faq.md)
- Repository badges in README

### Changed
- Package name changed from `vietqr` to `vietqr-ts`
- Updated package.json with author information
- Updated README.md with correct author attribution
- Repository URLs fixed for consistency
- CI security audit now fails on vulnerabilities (removed continue-on-error)

### Fixed
- Broken CONTRIBUTING.md link in README
- Repository URL mismatch in package.json

### Technical
- Added engines field requiring Node.js >=18.0.0
- Added sideEffects: false for better tree-shaking
- Improved npm package metadata

## [0.1.0] - 2024-10-23

### Added
- Initial release of VietQR TypeScript library
- **QR Generation API**
  - `generateVietQR()` - Generate EMVCo-compliant VietQR data strings
  - Support for both static and dynamic QR codes
  - Consumer account information encoding (bank BIN, account number, service codes)
  - Additional data fields (message, bill number, purpose, merchant category)
  - Automatic CRC-16-CCITT checksum calculation

- **Image Generation API**
  - `generateQRImage()` - Generate QR code images from VietQR data
  - PNG and SVG format support
  - Configurable size, error correction, colors, and margins
  - Browser and Node.js compatibility
  - Base64 data URL output for easy embedding

- **Parsing API**
  - `parse()` - Parse VietQR strings to extract payment information
  - TLV (Tag-Length-Value) format parsing
  - Graceful handling of corrupted/truncated data
  - Comprehensive error reporting with machine-readable error codes

- **Validation API**
  - `validate()` - Validate parsed VietQR data against NAPAS IBFT v1.5.2 specification
  - Field-level validation with detailed error messages
  - Business rules validation (service codes, account/card requirements)
  - CRC checksum verification
  - Data corruption detection

- **Image Decoding API**
  - Decode QR codes from PNG, JPEG, and SVG image files
  - Support for Buffer and Uint8Array inputs
  - Format auto-detection
  - Image validation and error handling

- **Type Safety**
  - Full TypeScript type definitions
  - Exported types for all public APIs
  - Type guards for result discrimination
  - Comprehensive JSDoc documentation

- **Utilities**
  - `calculateCRC()` - Calculate CRC-16-CCITT checksums
  - `verifyCRC()` - Verify QR string checksums
  - `isSuccessResult()`, `isErrorResult()` - Type guard utilities
  - `isDynamicQR()`, `isStaticQR()` - QR type checking utilities
  - Constants for NAPAS GUID, currency, country codes

### Technical Details
- **Compliance**
  - NAPAS IBFT v1.5.2 specification
  - EMVCo QR Code specification (Tag-Length-Value format)
  - ISO 4217 currency codes (VND = 704)
  - ISO 3166-1 country codes (VN = Vietnam)
  - CRC-16-CCITT checksum (polynomial 0x1021)

- **Testing**
  - >98% code coverage
  - 625+ unit tests
  - Integration test suites
  - Compliance validation tests
  - Browser and Node.js compatibility tests

- **Build & Tooling**
  - TypeScript 5.9+ with strict mode
  - Dual format output (ESM and CommonJS)
  - Tree-shakeable exports
  - Source maps and declaration maps
  - tsup for efficient bundling
  - Vitest for fast testing
  - ESLint for code quality

- **Performance**
  - QR Generation: <10ms typical
  - String Parsing: <100ms typical
  - Validation: <50ms typical
  - PNG Image Encoding: <200ms typical
  - SVG Image Encoding: <100ms typical

### Dependencies
- `crc` ^4.3.2 - CRC checksum calculation
- `qrcode` ^1.5.4 - QR code generation
- `pngjs` ^7.0.0 - PNG image handling
- `jpeg-js` ^0.4.4 - JPEG image decoding

### Browser Support
- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+

### Node.js Support
- Node.js 18.x or later
- npm 9.x or later

---

## Release Notes

### Version 0.1.0 - Initial Release

This is the first public release of VietQR, a TypeScript library for working with Vietnamese QR payment codes. The library provides a complete implementation of the NAPAS IBFT v1.5.2 specification with full TypeScript support.

**Key Features:**
- Generate EMVCo-compliant VietQR payment data
- Parse and validate VietQR strings
- Create QR code images (PNG/SVG)
- Decode QR codes from images
- Comprehensive error handling and validation
- Full TypeScript type safety

**What's Next:**
- Community feedback and issue reporting
- Performance optimizations based on real-world usage
- Additional validation rules and edge case handling
- Enhanced documentation with more examples
- Potential support for additional NAPAS features

---

## Migration Guides

### From No VietQR Library (Fresh Installation)

If you're implementing VietQR payment support for the first time:

1. Install the package:
   ```bash
   npm install vietqr-ts
   ```

2. Import and use:
   ```typescript
   import { generateVietQR, parse, validate } from 'vietqr-ts';
   ```

3. Refer to the [README](./README.md) for complete API documentation and examples.

---

## Links

- [Repository](https://github.com/binhnguyenduc/vietqr-ts)
- [npm Package](https://www.npmjs.com/package/vietqr-ts)
- [Issue Tracker](https://github.com/binhnguyenduc/vietqr-ts/issues)
- [Contributing Guide](./CONTRIBUTING.md)
- [Security Policy](./SECURITY.md)

[Unreleased]: https://github.com/binhnguyenduc/vietqr-ts/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/binhnguyenduc/vietqr-ts/releases/tag/v0.1.1
[0.1.0]: https://github.com/binhnguyenduc/vietqr-ts/releases/tag/v0.1.0
