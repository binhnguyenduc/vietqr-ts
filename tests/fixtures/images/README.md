# Test QR Code Images

This directory contains test QR code images for VietQR decoding tests.

## Required Test Images

1. **valid-qr.png** - Valid VietQR code in PNG format
2. **valid-qr.jpeg** - Valid VietQR code in JPEG format
3. **corrupted-qr.png** - Partially damaged QR code
4. **large-image.png** - Image exceeding 2MB size limit
5. **no-qr.png** - Image without any QR code
6. **multiple-qr.png** - Image containing multiple QR codes

## Generation

Test images will be generated during test implementation phase using the `qr` package encoder.
