import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { batch } from '../../src/batch';
import type { IRPCCall } from '../../src/call';

describe('IRPC - Core', () => {
  describe('Batch Module', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.clearAllTimers();
    });

    describe('Basic', () => {
      it('should batch calls with zero delay', async () => {
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

        batch(mockCall, mockHandler, 0);

        // Advance timers to execute the batch
        vi.advanceTimersByTime(0);

        expect(mockHandler).toHaveBeenCalledWith([mockCall]);
      });

      it('should batch multiple calls together', async () => {
        const mockHandler = vi.fn();
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

        batch(mockCall1, mockHandler, 0);
        batch(mockCall2, mockHandler, 0);

        // Advance timers to execute the batch
        vi.advanceTimersByTime(0);

        expect(mockHandler).toHaveBeenCalledWith([mockCall1, mockCall2]);
      });
    });
  });
});
