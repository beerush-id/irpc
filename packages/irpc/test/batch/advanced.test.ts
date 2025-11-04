import { describe, expect, it, vi } from 'vitest';
import type { IRPCCall } from '../../src/index.js';
import { batch } from '../../src/index.js';

describe('IRPC - Core', () => {
  describe('Batch Module', () => {
    describe('Advanced', () => {
      it('should batch calls with custom delay', async () => {
        vi.useFakeTimers();

        const mockHandler = vi.fn();
        const mockCall = {
          id: 'test-id',
          payload: { name: 'test', args: [] },
          resolved: false,
          resolver: vi.fn(),
          rejector: vi.fn(),
          resolve: vi.fn(),
          reject: vi.fn(),
        } as unknown as IRPCCall;

        batch(mockCall, mockHandler, 100);

        // Advance time by 50ms - handler should not be called yet
        vi.advanceTimersByTime(50);
        expect(mockHandler).not.toHaveBeenCalled();

        // Advance time by another 50ms - handler should be called now
        vi.advanceTimersByTime(50);
        expect(mockHandler).toHaveBeenCalledWith([mockCall]);

        vi.useRealTimers();
      });

      it('should handle multiple batches correctly', async () => {
        vi.useFakeTimers();

        const mockHandler1 = vi.fn();
        const mockHandler2 = vi.fn();

        const mockCall1 = {
          id: 'test-id-1',
          payload: { name: 'test1', args: [] },
          resolved: false,
          resolver: vi.fn(),
          rejector: vi.fn(),
          resolve: vi.fn(),
          reject: vi.fn(),
        } as unknown as IRPCCall;

        const mockCall2 = {
          id: 'test-id-2',
          payload: { name: 'test2', args: [] },
          resolved: false,
          resolver: vi.fn(),
          rejector: vi.fn(),
          resolve: vi.fn(),
          reject: vi.fn(),
        } as unknown as IRPCCall;

        // First batch
        batch(mockCall1, mockHandler1, 100);

        // Advance time by 50ms and add another call to first batch
        vi.advanceTimersByTime(50);
        batch(mockCall2, mockHandler1, 100);

        // Advance time by another 75ms - first batch should execute
        vi.advanceTimersByTime(75);
        expect(mockHandler1).toHaveBeenCalledWith([mockCall1, mockCall2]);

        const mockCall3 = {
          id: 'test-id-3',
          payload: { name: 'test3', args: [] },
          resolved: false,
          resolver: vi.fn(),
          rejector: vi.fn(),
          resolve: vi.fn(),
          reject: vi.fn(),
        } as unknown as IRPCCall;

        // Start a new batch
        batch(mockCall3, mockHandler2, 100);

        // Advance time by 100ms - second batch should execute
        vi.advanceTimersByTime(100);
        expect(mockHandler2).toHaveBeenCalledWith([mockCall3]);

        vi.useRealTimers();
      });
    });
  });
});
