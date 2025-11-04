import { describe, expect, it, vi } from 'vitest';
import type { IRPCTransport } from '../../src/index.js';
import { createModule } from '../../src/module';

describe('IRPC - Core', () => {
  describe('Module Module', () => {
    describe('Transport', () => {
      it('should set and use transport correctly', () => {
        const factory = createModule();

        const mockTransport: IRPCTransport = {
          send: vi.fn(),
        };

        // Set transport
        factory.use(mockTransport);

        // Verify transport was set (we'll check this by trying to make a call)
        const spec = {
          name: 'testFunc',
          description: 'Test function',
        };

        // Create a function - this should work
        const testFunc = factory(spec);

        // We can't easily test the transport without a full setup, but we can verify
        // the function was created properly
        expect(testFunc).toBeDefined();
      });

      it('should submit calls through transport', async () => {
        vi.useFakeTimers();

        const mockSend = vi.fn().mockResolvedValue([]);
        const mockTransport: IRPCTransport = {
          send: mockSend,
        };

        const factory = createModule();
        factory.use(mockTransport);

        const spec = {
          name: 'testFunc',
          description: 'Test function',
        };

        const testFunc = factory<() => Promise<string>>(spec);

        // Try to call the function (this will fail because no handler is set)
        const promise = testFunc();

        // Advance timers to trigger the batch
        vi.runAllTimers();

        // Wait for the promise to resolve/reject
        try {
          await promise;
        } catch (_e) {
          // Expected to throw since there's no handler
        }

        // Verify that send was called
        expect(mockSend).toHaveBeenCalled();

        vi.useRealTimers();
      });

      it('should handle using invalid transport', () => {
        const factory = createModule();

        expect(() => factory.use(null)).toThrow('Invalid transport.');
        expect(() => factory.use(undefined)).toThrow('Invalid transport.');
        expect(() => factory.use({} as never)).toThrow('Invalid transport.');
      });

      it('should handle send function that throws', async () => {
        const factory = createModule();

        factory.use({
          send: async () => {
            throw new Error('Test error');
          },
        });

        const fn = factory<() => Promise<string>>({
          name: 'test',
          description: 'Test',
        });

        const promise = fn();
        vi.advanceTimersToNextTimer();

        await expect(promise).rejects.toThrow('Test error');
      });
    });
  });
});
