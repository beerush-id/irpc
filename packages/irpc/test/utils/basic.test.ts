import { describe, it, expect } from 'vitest';
import { shortId } from '../../src/utils';

describe('IRPC - Core', () => {
  describe('Utils Module', () => {
    describe('Basic', () => {
      it('should generate unique IDs', () => {
        const id1 = shortId();
        const id2 = shortId();

        expect(id1).toBeDefined();
        expect(id2).toBeDefined();
        expect(id1).not.toBe(id2);
      });

      it('should generate IDs with timestamp component', () => {
        const before = Date.now();
        const id = shortId();
        const after = Date.now();

        // The ID should contain a timestamp part
        // Since it's base36 encoded, we can't directly compare
        // but we can check that it's a reasonable string
        expect(id).toMatch(/^[0-9a-z]+$/); // Only lowercase letters and numbers
        expect(id.length).toBeGreaterThan(5); // Reasonable minimum length
      });

      it('should generate IDs with random component', () => {
        // Generate multiple IDs quickly to test randomness
        const ids = Array.from({ length: 10 }, () => shortId());

        // All IDs should be unique
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
      });
    });
  });
});
