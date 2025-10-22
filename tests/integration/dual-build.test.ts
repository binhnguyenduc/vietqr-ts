import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

/**
 * Dual Build Integration Tests
 *
 * Verifies that both CommonJS and ESM builds work correctly.
 * Tests the actual built files in dist/ directory.
 */
describe('Dual Build Integration', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const projectRoot = join(__dirname, '../..');
  const distDir = join(projectRoot, 'dist');

  describe('Build Artifacts', () => {
    it('should have CommonJS build output', () => {
      const cjsPath = join(distDir, 'index.cjs');
      expect(existsSync(cjsPath)).toBe(true);
    });

    it('should have ESM build output', () => {
      const esmPath = join(distDir, 'index.mjs');
      expect(existsSync(esmPath)).toBe(true);
    });

    it('should have TypeScript declarations for CommonJS', () => {
      const dtsPath = join(distDir, 'index.d.cts');
      expect(existsSync(dtsPath)).toBe(true);
    });

    it('should have TypeScript declarations for ESM', () => {
      const dtsPath = join(distDir, 'index.d.ts');
      expect(existsSync(dtsPath)).toBe(true);
    });
  });

  describe('Build Contents', () => {
    it('should export generateVietQR in CommonJS build', () => {
      const cjsPath = join(distDir, 'index.cjs');
      const content = readFileSync(cjsPath, 'utf-8');
      expect(content).toContain('generateVietQR');
    });

    it('should export generateVietQR in ESM build', () => {
      const esmPath = join(distDir, 'index.mjs');
      const content = readFileSync(esmPath, 'utf-8');
      expect(content).toContain('generateVietQR');
    });

    it('T069: should export generateQRImage in CommonJS build', () => {
      const cjsPath = join(distDir, 'index.cjs');
      const content = readFileSync(cjsPath, 'utf-8');
      expect(content).toContain('generateQRImage');
    });

    it('T069: should export generateQRImage in ESM build', () => {
      const esmPath = join(distDir, 'index.mjs');
      const content = readFileSync(esmPath, 'utf-8');
      expect(content).toContain('generateQRImage');
    });

    it('should export validateVietQRConfig in CommonJS build', () => {
      const cjsPath = join(distDir, 'index.cjs');
      const content = readFileSync(cjsPath, 'utf-8');
      expect(content).toContain('validateVietQRConfig');
    });

    it('should export validateVietQRConfig in ESM build', () => {
      const esmPath = join(distDir, 'index.mjs');
      const content = readFileSync(esmPath, 'utf-8');
      expect(content).toContain('validateVietQRConfig');
    });

    it('should export calculateCRC in CommonJS build', () => {
      const cjsPath = join(distDir, 'index.cjs');
      const content = readFileSync(cjsPath, 'utf-8');
      expect(content).toContain('calculateCRC');
    });

    it('should export calculateCRC in ESM build', () => {
      const esmPath = join(distDir, 'index.mjs');
      const content = readFileSync(esmPath, 'utf-8');
      expect(content).toContain('calculateCRC');
    });
  });

  describe('Type Declarations', () => {
    it('should declare generateVietQR in TypeScript definitions', () => {
      const dtsPath = join(distDir, 'index.d.ts');
      const content = readFileSync(dtsPath, 'utf-8');
      expect(content).toContain('generateVietQR');
    });

    it('should declare validateVietQRConfig in TypeScript definitions', () => {
      const dtsPath = join(distDir, 'index.d.ts');
      const content = readFileSync(dtsPath, 'utf-8');
      expect(content).toContain('validateVietQRConfig');
    });

    it('should declare calculateCRC in TypeScript definitions', () => {
      const dtsPath = join(distDir, 'index.d.ts');
      const content = readFileSync(dtsPath, 'utf-8');
      expect(content).toContain('calculateCRC');
    });

    it('should export VietQRConfig type in TypeScript definitions', () => {
      const dtsPath = join(distDir, 'index.d.ts');
      const content = readFileSync(dtsPath, 'utf-8');
      expect(content).toContain('VietQRConfig');
    });

    it('should export VietQRData type in TypeScript definitions', () => {
      const dtsPath = join(distDir, 'index.d.ts');
      const content = readFileSync(dtsPath, 'utf-8');
      expect(content).toContain('VietQRData');
    });

    it('should export ValidationError in TypeScript definitions', () => {
      const dtsPath = join(distDir, 'index.d.ts');
      const content = readFileSync(dtsPath, 'utf-8');
      expect(content).toContain('ValidationError');
    });

    it('should export AggregateValidationError in TypeScript definitions', () => {
      const dtsPath = join(distDir, 'index.d.ts');
      const content = readFileSync(dtsPath, 'utf-8');
      expect(content).toContain('AggregateValidationError');
    });

    it('T069: should export QRImageConfig type in TypeScript definitions', () => {
      const dtsPath = join(distDir, 'index.d.ts');
      const content = readFileSync(dtsPath, 'utf-8');
      expect(content).toContain('QRImageConfig');
    });

    it('T069: should export QRImageResult type in TypeScript definitions', () => {
      const dtsPath = join(distDir, 'index.d.ts');
      const content = readFileSync(dtsPath, 'utf-8');
      expect(content).toContain('QRImageResult');
    });

    it('T069: should export QRGenerationError in TypeScript definitions', () => {
      const dtsPath = join(distDir, 'index.d.ts');
      const content = readFileSync(dtsPath, 'utf-8');
      expect(content).toContain('QRGenerationError');
    });

    it('T069: should export ImageEncodingError in TypeScript definitions', () => {
      const dtsPath = join(distDir, 'index.d.ts');
      const content = readFileSync(dtsPath, 'utf-8');
      expect(content).toContain('ImageEncodingError');
    });
  });

  describe('Bundle Metadata', () => {
    it('should have source maps for CommonJS build', () => {
      const mapPath = join(distDir, 'index.cjs.map');
      expect(existsSync(mapPath)).toBe(true);
    });

    it('should have source maps for ESM build', () => {
      const mapPath = join(distDir, 'index.mjs.map');
      expect(existsSync(mapPath)).toBe(true);
    });

    it('should have valid JSON in CommonJS source map', () => {
      const mapPath = join(distDir, 'index.cjs.map');
      const content = readFileSync(mapPath, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('should have valid JSON in ESM source map', () => {
      const mapPath = join(distDir, 'index.mjs.map');
      const content = readFileSync(mapPath, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });
  });

  describe('Bundle Size', () => {
    it('should have CommonJS bundle under 50KB', () => {
      const cjsPath = join(distDir, 'index.cjs');
      const stats = readFileSync(cjsPath);
      const sizeInKB = stats.length / 1024;
      expect(sizeInKB).toBeLessThan(50);
    });

    it('should have ESM bundle under 50KB', () => {
      const esmPath = join(distDir, 'index.mjs');
      const stats = readFileSync(esmPath);
      const sizeInKB = stats.length / 1024;
      expect(sizeInKB).toBeLessThan(50);
    });
  });
});
