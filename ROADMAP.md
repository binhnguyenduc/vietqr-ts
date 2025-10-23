# VietQR-TS Roadmap

This document outlines the planned features and improvements for the VietQR TypeScript library.

## Current Status (v1.0.0)

✅ **Implemented**
- Complete NAPAS IBFT v1.5.2 specification support
- QR code generation (PNG/SVG formats)
- QR code parsing and validation
- Image decoding (PNG/JPEG)
- Full TypeScript support with type safety
- Comprehensive test coverage (>98%)
- Node.js and browser compatibility

## Short-term Goals (v1.1.x - v1.2.x)

### 🌍 Internationalization (i18n)
**Target: v1.1.0**

- [ ] Multi-language support for error messages
  - Vietnamese (vi)
  - English (en) - default
- [ ] Localized validation messages
- [ ] Language-specific documentation
  - Vietnamese README (README.vi.md)
  - Vietnamese API documentation
- [ ] Locale-aware formatting utilities
- [ ] Translation infrastructure setup

**Example API:**
```typescript
import { generateVietQR, setLocale } from 'vietqr-ts';

setLocale('vi'); // Switch to Vietnamese
const result = generateVietQR(config);
// Error messages now in Vietnamese
```

### 📱 Additional QR Format Support
**Target: v1.2.0**

Research and evaluate support for:
- [ ] **VNPay QR**: VNPay's proprietary QR format
- [ ] **MoMo QR**: MoMo e-wallet QR codes
- [ ] **ZaloPay QR**: ZaloPay payment QR format
- [ ] **ShopeePay QR**: ShopeePay QR codes
- [ ] **Bank-specific QR formats**: Individual bank QR implementations

**Priority Order:**
1. VNPay QR (most widely used)
2. MoMo QR (e-wallet dominance)
3. ZaloPay QR (user base size)
4. Bank-specific formats (on-demand)

### 🔧 Developer Experience Improvements
**Target: v1.1.x - v1.2.x**

- [ ] Interactive CLI tool for QR generation
- [ ] Online playground/demo website
- [ ] More code examples and recipes
- [ ] Video tutorials and guides
- [ ] VS Code extension for QR preview

## Medium-term Goals (v1.3.x - v2.0.0)

### 🏦 Banking Integration Features
**Target: v1.3.0**

- [ ] Bank API integration helpers
- [ ] Transaction verification utilities
- [ ] Webhook signature validation
- [ ] Real-time payment status checking
- [ ] Bank-specific configurations

### 🔐 Enhanced Security Features
**Target: v1.4.0**

- [ ] QR code encryption support
- [ ] Digital signature verification
- [ ] Anti-fraud validation rules
- [ ] PCI DSS compliance helpers
- [ ] Secure key management utilities

### ⚡ Performance Optimizations
**Target: v1.5.0**

- [ ] WebAssembly (WASM) acceleration for image processing
- [ ] Lazy loading for optional features
- [ ] Tree-shaking optimization improvements
- [ ] Caching strategies for repeated operations
- [ ] Batch processing API for multiple QR codes

### 📊 Analytics and Monitoring
**Target: v1.6.0**

- [ ] QR code usage metrics
- [ ] Performance monitoring hooks
- [ ] Error tracking integration
- [ ] Audit logging capabilities
- [ ] Business intelligence helpers

## Long-term Goals (v2.0.0+)

### 🌏 Regional Expansion
**Target: v2.0.0**

- [ ] **Thailand**: PromptPay QR code support
- [ ] **Singapore**: PayNow QR format
- [ ] **Malaysia**: DuitNow QR codes
- [ ] **Indonesia**: QRIS (Quick Response Code Indonesian Standard)
- [ ] **Philippines**: InstaPay/PESONet QR formats

**Unified API across all formats:**
```typescript
import { generateQR } from 'vietqr-ts';

// Vietnam
generateQR({ country: 'VN', format: 'NAPAS', ... });

// Thailand
generateQR({ country: 'TH', format: 'PromptPay', ... });

// Singapore
generateQR({ country: 'SG', format: 'PayNow', ... });
```

### 🔄 Dynamic QR Features
**Target: v2.1.0**

- [ ] QR code expiration management
- [ ] Dynamic amount updates
- [ ] Multi-use vs single-use QR codes
- [ ] QR code versioning and updates
- [ ] Time-limited payment windows

### 🎨 Advanced Customization
**Target: v2.2.0**

- [ ] Custom QR code styling
- [ ] Logo embedding in QR codes
- [ ] Color customization while maintaining scannability
- [ ] Custom error correction levels
- [ ] Brand-specific QR templates

### 🔌 Framework Integrations
**Target: v2.3.0**

- [ ] React component library
- [ ] Vue.js plugin
- [ ] Angular module
- [ ] Svelte components
- [ ] React Native support
- [ ] Flutter/Dart bindings

### 🤖 AI/ML Features
**Target: v3.0.0**

- [ ] QR code quality assessment
- [ ] Automatic image enhancement before decoding
- [ ] Fraud detection using pattern recognition
- [ ] Smart QR code generation recommendations
- [ ] OCR integration for receipt data

## Feature Requests and Community Feedback

We welcome community input on the roadmap! Please:
- 🐛 Report bugs via [GitHub Issues](https://github.com/binhnguyenduc/vietqr-ts/issues)
- 💡 Suggest features via [Discussions](https://github.com/binhnguyenduc/vietqr-ts/discussions)
- 🗳️ Vote on feature requests to help prioritize
- 🤝 Contribute via [Pull Requests](https://github.com/binhnguyenduc/vietqr-ts/pulls)

## Maintenance Commitments

### Regular Updates
- **Security patches**: Within 48 hours of disclosure
- **Bug fixes**: Monthly patch releases as needed
- **Dependency updates**: Quarterly review and updates
- **Documentation**: Continuous improvements

### Version Support
- **Current major version (v1.x)**: Full support
- **Previous major version**: Security patches for 12 months
- **Older versions**: Community support only

## Breaking Changes Policy

We follow semantic versioning strictly:
- **Major versions (v2.0.0)**: May include breaking changes
- **Minor versions (v1.1.0)**: New features, backward compatible
- **Patch versions (v1.0.1)**: Bug fixes only, backward compatible

Breaking changes will be:
1. Announced at least 3 months in advance
2. Documented in migration guides
3. Supported with codemods when possible
4. Accompanied by deprecation warnings in previous versions

## Contributing to the Roadmap

Want to help implement these features?

1. Check the [CONTRIBUTING.md](./CONTRIBUTING.md) guide
2. Look for issues tagged with `roadmap` or `help-wanted`
3. Discuss implementation approach before starting major features
4. Submit PRs with tests and documentation

## Disclaimer

This roadmap is subject to change based on:
- Community feedback and priorities
- Technical constraints and discoveries
- Resource availability
- Industry changes and standards updates

Timeline estimates are approximate and may shift based on complexity and community contributions.

---

**Last Updated**: 2025-10-23
**Current Version**: v1.0.0
**Next Planned Release**: v1.1.0 (Q1 2025)
