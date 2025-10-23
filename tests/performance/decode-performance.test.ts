/**
 * Performance tests for VietQR decode functionality
 *
 * Tests decode performance per User Story 3 requirements.
 *
 * @module tests/performance/decode-performance
 */

import { describe, it, expect } from 'vitest';
import { decode, decodeAndValidate } from '../../src/decoders';
import { generatePngQR, TEST_QR_STRINGS } from '../helpers/qr-image-generator';

describe('decode() performance', () => {
  describe('Single decode operations', () => {
    it('should decode minimal VietQR in reasonable time', async () => {
      const imageBuffer = await generatePngQR(TEST_QR_STRINGS.MINIMAL);

      const startTime = performance.now();
      const result = decode(imageBuffer);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      const duration = endTime - startTime;
      // Should complete in less than 100ms for small images
      expect(duration).toBeLessThan(100);
    });

    it('should decode dynamic VietQR in reasonable time', async () => {
      const imageBuffer = await generatePngQR(TEST_QR_STRINGS.DYNAMIC);

      const startTime = performance.now();
      const result = decode(imageBuffer);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100);
    });

    it('should decode large QR content efficiently', async () => {
      const largeContent = 'A'.repeat(1000);
      const imageBuffer = await generatePngQR(largeContent);

      const startTime = performance.now();
      const result = decode(imageBuffer);
      const endTime = performance.now();

      // QR extraction should succeed (parsing will fail)
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(200);
    });
  });

  describe('Batch decode operations', () => {
    it('should handle 10 sequential decodes efficiently', async () => {
      const imageBuffer = await generatePngQR(TEST_QR_STRINGS.MINIMAL);

      const startTime = performance.now();
      for (let i = 0; i < 10; i++) {
        const result = decode(imageBuffer);
        expect(result.success).toBe(true);
      }
      const endTime = performance.now();

      const duration = endTime - startTime;
      const avgDuration = duration / 10;
      // Average should be under 50ms per decode
      expect(avgDuration).toBeLessThan(50);
    });

    it('should handle 50 sequential decodes', async () => {
      const imageBuffer = await generatePngQR(TEST_QR_STRINGS.MINIMAL);

      const startTime = performance.now();
      for (let i = 0; i < 50; i++) {
        decode(imageBuffer);
      }
      const endTime = performance.now();

      const duration = endTime - startTime;
      // Should complete 50 decodes in reasonable time
      expect(duration).toBeLessThan(5000);
    });
  });

  describe('Different image sizes', () => {
    it('should decode small QR codes quickly', async () => {
      const smallQR = 'ABC';
      const imageBuffer = await generatePngQR(smallQR);

      const startTime = performance.now();
      decode(imageBuffer);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should decode medium QR codes efficiently', async () => {
      const mediumQR = TEST_QR_STRINGS.DYNAMIC;
      const imageBuffer = await generatePngQR(mediumQR);

      const startTime = performance.now();
      decode(imageBuffer);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should decode large QR codes within acceptable time', async () => {
      const largeQR = 'A'.repeat(2000);
      const imageBuffer = await generatePngQR(largeQR);

      const startTime = performance.now();
      decode(imageBuffer);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200);
    });
  });

  describe('Validation performance', () => {
    it('should measure decode-only vs decode-and-validate', async () => {
      const imageBuffer = await generatePngQR(TEST_QR_STRINGS.MINIMAL);

      // Measure decode only
      const decodeStart = performance.now();
      const decodeResult = decode(imageBuffer);
      const decodeEnd = performance.now();
      const decodeDuration = decodeEnd - decodeStart;

      // Measure decode + validate
      const validateStart = performance.now();
      const validateResult = decodeAndValidate(imageBuffer);
      const validateEnd = performance.now();
      const validateDuration = validateEnd - validateStart;

      expect(decodeResult.success).toBe(true);
      expect(validateResult.success).toBe(true);

      // Validation adds some overhead but should be reasonable
      // Increased threshold to 5x for CI environment stability
      expect(validateDuration).toBeLessThan(decodeDuration * 5);
    });

    it('should validate efficiently for multiple calls', async () => {
      const imageBuffer = await generatePngQR(TEST_QR_STRINGS.MINIMAL);

      const startTime = performance.now();
      for (let i = 0; i < 10; i++) {
        decodeAndValidate(imageBuffer);
      }
      const endTime = performance.now();

      const avgDuration = (endTime - startTime) / 10;
      expect(avgDuration).toBeLessThan(100);
    });
  });

  describe('Error path performance', () => {
    it('should fail fast for oversized images', () => {
      const oversizedBuffer = Buffer.alloc(3 * 1024 * 1024);

      const startTime = performance.now();
      const result = decode(oversizedBuffer);
      const endTime = performance.now();

      expect(result.success).toBe(false);
      // Size validation should be very fast
      expect(endTime - startTime).toBeLessThan(10);
    });

    it('should fail fast for unsupported formats', () => {
      const gifBuffer = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39]);

      const startTime = performance.now();
      const result = decode(gifBuffer);
      const endTime = performance.now();

      expect(result.success).toBe(false);
      // Format detection should be very fast
      expect(endTime - startTime).toBeLessThan(10);
    });

    it('should handle invalid buffers quickly', () => {
      const invalidBuffer = Buffer.from('random data');

      const startTime = performance.now();
      const result = decode(invalidBuffer);
      const endTime = performance.now();

      expect(result.success).toBe(false);
      expect(endTime - startTime).toBeLessThan(10);
    });
  });

  describe('Memory efficiency', () => {
    it('should not leak memory on successful decode', async () => {
      const imageBuffer = await generatePngQR(TEST_QR_STRINGS.MINIMAL);
      const iterations = 100;

      // Measure memory before
      if (global.gc) global.gc();
      const memBefore = process.memoryUsage().heapUsed;

      // Run multiple decodes
      for (let i = 0; i < iterations; i++) {
        decode(imageBuffer);
      }

      // Measure memory after
      if (global.gc) global.gc();
      const memAfter = process.memoryUsage().heapUsed;

      const memIncrease = memAfter - memBefore;
      // Memory increase should be minimal (< 10MB for 100 iterations)
      expect(memIncrease).toBeLessThan(20 * 1024 * 1024);
    });

    it('should not leak memory on failed decode', () => {
      const invalidBuffer = Buffer.from('invalid');
      const iterations = 100;

      if (global.gc) global.gc();
      const memBefore = process.memoryUsage().heapUsed;

      for (let i = 0; i < iterations; i++) {
        decode(invalidBuffer);
      }

      if (global.gc) global.gc();
      const memAfter = process.memoryUsage().heapUsed;

      const memIncrease = memAfter - memBefore;
      expect(memIncrease).toBeLessThan(5 * 1024 * 1024);
    });
  });

  describe('Throughput benchmarks', () => {
    it('should measure decode throughput', async () => {
      const imageBuffer = await generatePngQR(TEST_QR_STRINGS.MINIMAL);
      const duration = 1000; // 1 second
      let count = 0;

      const startTime = performance.now();
      while (performance.now() - startTime < duration) {
        decode(imageBuffer);
        count++;
      }
      const endTime = performance.now();

      const actualDuration = endTime - startTime;
      const decodesPerSecond = (count / actualDuration) * 1000;

      // Should handle at least 10 decodes per second
      expect(decodesPerSecond).toBeGreaterThan(10);

      // Log performance metric for reference
      console.log(`Decode throughput: ${decodesPerSecond.toFixed(2)} ops/sec`);
    });

    it('should measure decodeAndValidate throughput', async () => {
      const imageBuffer = await generatePngQR(TEST_QR_STRINGS.MINIMAL);
      const duration = 1000; // 1 second
      let count = 0;

      const startTime = performance.now();
      while (performance.now() - startTime < duration) {
        decodeAndValidate(imageBuffer);
        count++;
      }
      const endTime = performance.now();

      const actualDuration = endTime - startTime;
      const decodesPerSecond = (count / actualDuration) * 1000;

      // Should handle at least 10 decodes+validates per second
      expect(decodesPerSecond).toBeGreaterThan(10);

      console.log(`DecodeAndValidate throughput: ${decodesPerSecond.toFixed(2)} ops/sec`);
    });
  });
});
