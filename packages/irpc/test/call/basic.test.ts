import { describe, expect, it, vi } from 'vitest';
import { IRPCCall } from '../../src/call';

describe('IRPC - Core', () => {
  describe('Call Module', () => {
    describe('Basic', () => {
      it('should create a new IRPCCall with unique ID', () => {
        const mockPayload = { name: 'test', args: [] };
        const mockResolver = vi.fn();
        const mockRejector = vi.fn();
        
        const call = new IRPCCall(mockPayload, mockResolver, mockRejector);
        
        expect(call.id).toBeDefined();
        expect(call.payload).toBe(mockPayload);
        expect(call.resolver).toBe(mockResolver);
        expect(call.rejector).toBe(mockRejector);
        expect(call.resolved).toBe(false);
      });

      it('should resolve the call only once', () => {
        const mockPayload = { name: 'test', args: [] };
        const mockResolver = vi.fn();
        const mockRejector = vi.fn();
        const call = new IRPCCall(mockPayload, mockResolver, mockRejector);
        
        const testValue = 'resolved value';
        call.resolve(testValue);
        
        expect(call.resolved).toBe(true);
        expect(mockResolver).toHaveBeenCalledWith(testValue);
        
        // Try to resolve again - should not call resolver again
        call.resolve('another value');
        expect(mockResolver).toHaveBeenCalledTimes(1);
      });

      it('should reject the call only once', () => {
        const mockPayload = { name: 'test', args: [] };
        const mockResolver = vi.fn();
        const mockRejector = vi.fn();
        const call = new IRPCCall(mockPayload, mockResolver, mockRejector);
        
        const testError = new Error('Test error');
        call.reject(testError);
        
        expect(call.resolved).toBe(true);
        expect(mockRejector).toHaveBeenCalledWith(testError);
        
        // Try to reject again - should not call rejector again
        call.reject(new Error('Another error'));
        expect(mockRejector).toHaveBeenCalledTimes(1);
      });
    });
  });
});