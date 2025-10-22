/**
 * Performance benchmarks for VietQR parsing
 *
 * Tests parsing performance per User Story 1 requirements.
 * Target: <100ms for parsing operations
 *
 * @module tests/benchmarks/parse-performance
 */

import { describe, it, expect } from 'vitest';
import { parse } from '../../src/parsers';
import { generateVietQR } from '../../src/generators/vietqr';

describe('parse() performance benchmarks', () => {
  describe('Single parse operations', () => {
    it('should parse minimal VietQR in <100ms', () => {
      const testData = {
        bankBin: '970422',
        accountNumber: '0123456789',
        serviceCode: 'QRIBFTTA',
      };

      const qrData = generateVietQR(testData);

      const startTime = performance.now();
      const result = parse(qrData.rawData);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100);

      console.log(`  Parse minimal: ${duration.toFixed(3)}ms`);
    });

    it('should parse dynamic VietQR with amount in <100ms', () => {
      const testData = {
        bankBin: '970422',
        accountNumber: '0123456789',
        serviceCode: 'QRIBFTTA',
        amount: '100000',
      };

      const qrData = generateVietQR(testData);

      const startTime = performance.now();
      const result = parse(qrData.rawData);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100);

      console.log(`  Parse dynamic: ${duration.toFixed(3)}ms`);
    });

    it('should parse VietQR with additional data in <100ms', () => {
      const testData = {
        bankBin: '970422',
        accountNumber: '0123456789',
        serviceCode: 'QRIBFTTA',
        amount: '50000',
        message: 'Payment for order #12345',
        billNumber: 'BILL123',
      };

      const qrData = generateVietQR(testData);

      const startTime = performance.now();
      const result = parse(qrData.rawData);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100);

      console.log(`  Parse with additional data: ${duration.toFixed(3)}ms`);
    });
  });

  describe('Batch parse operations', () => {
    it('should handle 100 sequential parses efficiently', () => {
      const testData = {
        bankBin: '970422',
        accountNumber: '0123456789',
        serviceCode: 'QRIBFTTA',
      };

      const qrData = generateVietQR(testData);

      const startTime = performance.now();
      for (let i = 0; i < 100; i++) {
        const result = parse(qrData.rawData);
        expect(result.success).toBe(true);
      }
      const endTime = performance.now();

      const duration = endTime - startTime;
      const avgDuration = duration / 100;

      // Average should be well under 100ms per parse
      expect(avgDuration).toBeLessThan(10);

      console.log(`  100 parses in ${duration.toFixed(2)}ms (avg: ${avgDuration.toFixed(3)}ms/parse)`);
    });

    it('should handle 1000 sequential parses', () => {
      const testData = {
        bankBin: '970422',
        accountNumber: '0123456789',
        serviceCode: 'QRIBFTTA',
      };

      const qrData = generateVietQR(testData);

      const startTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        parse(qrData.rawData);
      }
      const endTime = performance.now();

      const duration = endTime - startTime;
      const avgDuration = duration / 1000;

      // Should complete 1000 parses in reasonable time
      expect(duration).toBeLessThan(5000);

      console.log(`  1000 parses in ${duration.toFixed(2)}ms (avg: ${avgDuration.toFixed(3)}ms/parse)`);
    });
  });

  describe('Different data sizes', () => {
    it('should parse minimal data quickly', () => {
      const minimal = {
        bankBin: '970422',
        accountNumber: '1',
        serviceCode: 'QRIBFTTA',
      };

      const qrData = generateVietQR(minimal);

      const startTime = performance.now();
      const result = parse(qrData.rawData);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100);

      console.log(`  Parse minimal data: ${duration.toFixed(3)}ms`);
    });

    it('should parse maximum size data efficiently', () => {
      const maxData = {
        bankBin: '970422',
        accountNumber: '1234567890123456789',  // 19 chars (max)
        serviceCode: 'QRIBFTTA',
        amount: '9999999999999',  // 13 chars (max)
        message: 'A'.repeat(500),  // 500 chars (max)
        billNumber: 'B'.repeat(25),  // 25 chars (max)
      };

      const qrData = generateVietQR(maxData);

      const startTime = performance.now();
      const result = parse(qrData.rawData);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100);

      console.log(`  Parse maximum data: ${duration.toFixed(3)}ms`);
    });
  });

  describe('Throughput benchmarks', () => {
    it('should measure parse throughput', () => {
      const testData = {
        bankBin: '970422',
        accountNumber: '0123456789',
        serviceCode: 'QRIBFTTA',
      };

      const qrData = generateVietQR(testData);
      const duration = 1000; // 1 second
      let count = 0;

      const startTime = performance.now();
      while (performance.now() - startTime < duration) {
        parse(qrData.rawData);
        count++;
      }
      const endTime = performance.now();

      const actualDuration = endTime - startTime;
      const parsesPerSecond = (count / actualDuration) * 1000;

      // Should handle at least 100 parses per second
      expect(parsesPerSecond).toBeGreaterThan(100);

      console.log(`  Parse throughput: ${parsesPerSecond.toFixed(0)} ops/sec (${count} parses in ${actualDuration.toFixed(0)}ms)`);
    });
  });

  describe('Memory efficiency', () => {
    it('should not leak memory on repeated parses', () => {
      const testData = {
        bankBin: '970422',
        accountNumber: '0123456789',
        serviceCode: 'QRIBFTTA',
      };

      const qrData = generateVietQR(testData);
      const iterations = 1000;

      // Measure memory before
      if (global.gc) global.gc();
      const memBefore = process.memoryUsage().heapUsed;

      // Run multiple parses
      for (let i = 0; i < iterations; i++) {
        parse(qrData.rawData);
      }

      // Measure memory after
      if (global.gc) global.gc();
      const memAfter = process.memoryUsage().heapUsed;

      const memIncrease = memAfter - memBefore;
      const memIncreaseKB = memIncrease / 1024;

      // Memory increase should be minimal (< 10MB for 1000 iterations)
      expect(memIncrease).toBeLessThan(10 * 1024 * 1024);

      console.log(`  Memory increase: ${memIncreaseKB.toFixed(2)} KB for ${iterations} parses`);
    });
  });
});
