import { describe, expect, it, vi } from 'vitest';
import { IRPCCall } from '../../src/call';

describe('IRPC - Core', () => {
  describe('Call Module', () => {
    describe('Advanced', () => {
      it('should handle resolve with undefined value', () => {
        const mockPayload = { name: 'test', args: [] };
        const mockResolver = vi.fn();
        const mockRejector = vi.fn();
        const call = new IRPCCall(mockPayload, mockResolver, mockRejector);

        call.resolve(undefined);

        expect(call.resolved).toBe(true);
        expect(mockResolver).toHaveBeenCalledWith(undefined);
      });

      it('should handle reject with no reason', () => {
        const mockPayload = { name: 'test', args: [] };
        const mockResolver = vi.fn();
        const mockRejector = vi.fn();
        const call = new IRPCCall(mockPayload, mockResolver, mockRejector);

        call.reject();

        expect(call.resolved).toBe(true);
        expect(mockRejector).toHaveBeenCalledWith(undefined);
      });

      it('should handle reject with error reason', () => {
        const mockPayload = { name: 'test', args: [] };
        const mockResolver = vi.fn();
        const mockRejector = vi.fn();
        const call = new IRPCCall(mockPayload, mockResolver, mockRejector);

        const error = new Error('Test error');
        call.reject(error);

        expect(call.resolved).toBe(true);
        expect(mockRejector).toHaveBeenCalledWith(error);
      });
    });
  });
});
