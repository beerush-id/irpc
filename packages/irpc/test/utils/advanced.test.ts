import { describe, expect, it, vi } from 'vitest';
import { shortId } from '../../src/utils';

describe('IRPC - Core', () => {
  describe('Utils Module', () => {
    describe('Advanced', () => {
      it('should generate unique IDs even with same timestamp', () => {
        // Mock Date.now to return the same timestamp for all calls
        const nowSpy = vi.spyOn(global.Date, 'now').mockImplementation(() => 1000000);

        // Generate multiple IDs quickly (they would have same timestamp)
        const ids = Array.from({ length: 5 }, () => shortId());

        // All IDs should be unique due to sequence number
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);

        // Restore Date.now
        nowSpy.mockRestore();
      });

      it('should include sequence number in ID when needed', () => {
        // Mock Date.now to return the same timestamp for all calls
        const nowSpy = vi.spyOn(global.Date, 'now').mockImplementation(() => 1000000);

        const id1 = shortId();
        const id2 = shortId();
        const id3 = shortId();

        // Check that IDs are different
        expect(id1).not.toBe(id2);
        expect(id2).not.toBe(id3);

        // Restore Date.now
        nowSpy.mockRestore();
      });
    });
  });
});
