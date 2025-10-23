# Security Policy

## Overview

VietQR is a library for generating and parsing Vietnamese QR payment codes. As a financial/payment-related library, we take security seriously and appreciate the security research community's efforts to help keep VietQR and its users safe.

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

**Note:** As this project is in pre-1.0 development, we currently support only the latest 0.1.x release. Once version 1.0 is released, we will maintain security patches for the current major version and the previous major version.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability in VietQR, please report it responsibly by emailing:

**📧 binh.d.nguyen165@gmail.com**

### What to Include in Your Report

Please include the following information to help us better understand and resolve the issue:

1. **Type of vulnerability** (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
2. **Full path(s)** of source file(s) related to the vulnerability
3. **Location** of the affected source code (tag/branch/commit or direct URL)
4. **Step-by-step instructions** to reproduce the issue
5. **Proof-of-concept or exploit code** (if possible)
6. **Impact** of the issue, including how an attacker might exploit it
7. **Your assessment** of severity (Critical/High/Medium/Low)

### Additional Context (Optional but Helpful)

- **Affected configurations** or environments
- **Possible mitigations** you've identified
- **Related CVEs** or previous vulnerabilities
- **Your name/handle** for acknowledgment (if you wish to be credited)

## Response Timeline

- **Initial Response:** Within 48 hours of your report
- **Status Update:** Within 5 business days with assessment and timeline
- **Resolution Timeline:**
  - Critical: Within 7 days
  - High: Within 14 days
  - Medium: Within 30 days
  - Low: Next scheduled release

## Disclosure Policy

- We ask that you give us reasonable time to investigate and mitigate the vulnerability before public disclosure
- We will work with you to understand the scope and severity of the issue
- Once a fix is available, we will:
  1. Release a security patch
  2. Publish a security advisory
  3. Credit you in the advisory (if you wish to be acknowledged)
  4. Coordinate with you on the disclosure timeline

## Security Best Practices for VietQR Users

### Input Validation

Always validate and sanitize QR code data before processing:

```typescript
import { parse, validate } from 'vietqr-ts';

const result = parse(qrString);

if (result.success) {
  const validation = validate(result.data, qrString);

  if (validation.isValid && !validation.isCorrupted) {
    // Safe to process payment
    processPayment(result.data);
  } else {
    // Handle invalid or corrupted data
    logError('Invalid QR code', validation.errors);
  }
}
```

### Amount Verification

For dynamic QR codes with embedded amounts, always verify the amount matches user expectations:

```typescript
const result = parse(qrString);

if (result.success && result.data.amount) {
  // Always verify amount with user before processing
  const confirmedAmount = await getUserConfirmation(result.data.amount);

  if (confirmedAmount !== result.data.amount) {
    throw new Error('Amount mismatch');
  }
}
```

### Data Integrity

Always verify CRC checksums to detect tampering:

```typescript
import { verifyCRC } from 'vietqr-ts';

if (!verifyCRC(qrString)) {
  throw new Error('QR code data corrupted or tampered');
}
```

### Secure Transmission

- Always transmit QR code data over HTTPS
- Never log or store sensitive payment information in plaintext
- Implement rate limiting for QR code generation/parsing endpoints
- Use appropriate authentication and authorization for payment APIs

## Known Security Considerations

### CRC Checksum Limitations

The CRC-16-CCITT checksum used in VietQR (per EMVCo specification) is designed to detect accidental data corruption, **not** to prevent malicious tampering. Always implement additional security measures:

- Verify transaction details with users before processing
- Use secure communication channels (HTTPS/TLS)
- Implement backend validation and verification
- Apply fraud detection mechanisms

### QR Code Visual Tampering

Physical QR codes can be replaced or overlaid with stickers. For payment terminals:

- Regularly inspect physical QR codes
- Use tamper-evident materials
- Implement QR code registration/verification systems
- Monitor for unusual transaction patterns

### Amount Injection

Static QR codes (without amounts) rely on users entering amounts manually. Applications should:

- Clearly display the recipient information before amount entry
- Implement maximum transaction limits
- Require confirmation for large amounts
- Log all transaction attempts

## Security Update Policy

Security updates will be released as patch versions (e.g., 0.1.0 → 0.1.1) and published to npm immediately upon fix validation.

Users will be notified through:

- GitHub Security Advisories
- npm package updates
- Release notes in CHANGELOG.md

## Acknowledgments

We appreciate the work of security researchers and will acknowledge your contribution in our security advisories (with your permission).

### Hall of Fame

Contributors who have responsibly disclosed security vulnerabilities will be listed here (with their consent):

*No vulnerabilities have been reported yet.*

## Additional Resources

- [NAPAS IBFT Specification v1.5.2](https://napas.com.vn)
- [EMVCo QR Code Specification](https://www.emvco.com/emv-technologies/qrcodes/)
- [OWASP Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)

## Contact

For security-related inquiries: **binh.d.nguyen165@gmail.com**

For general questions: [GitHub Issues](https://github.com/binhnguyenduc/vietqr-ts/issues)

---

**Thank you for helping keep VietQR and its users safe!**
