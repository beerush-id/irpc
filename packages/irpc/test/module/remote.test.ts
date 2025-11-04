import { describe, expect, it, vi } from 'vitest';
import { createModule } from '../../src/module';
import type { IRPCTransport } from '../../src/types';

describe('IRPC - Core', () => {
  describe('Module Module', () => {
    describe('Remote Calls', () => {
      it('should make remote calls through transport', async () => {
        const mockSend = vi.fn().mockImplementation((calls) => {
          calls.forEach((call) => {
            call.resolve('remote result');
          });

          return Promise.resolve();
        });

        const mockTransport = {
          send: mockSend,
        } as unknown as IRPCTransport;

        const factory = createModule();
        factory.use(mockTransport);

        const spec = {
          name: 'remoteFunc',
          description: 'A remote function',
        };

        const remoteFunction = factory<(input: string) => Promise<string>>(spec);

        // Call the remote function
        const promise = remoteFunction('test input');

        vi.runAllTimers();

        const result = await promise;

        expect(result).toBe('remote result');
        expect(mockSend).toHaveBeenCalled();
      });

      it('should handle remote call errors', async () => {
        const mockSend = vi.fn().mockImplementation((calls) => {
          calls.forEach((call) => {
            call.reject(new Error('Remote error occurred'));
          });

          return Promise.resolve();
        });

        const mockTransport = {
          send: mockSend,
        } as unknown as IRPCTransport;

        const factory = createModule();
        factory.use(mockTransport);

        const spec = {
          name: 'remoteFunc',
          description: 'A remote function',
        };

        const remoteFunction = factory<(input: string) => Promise<string>>(spec);

        // Call the remote function
        await expect(async () => {
          const promise = remoteFunction('test input');
          vi.runAllTimers();
          await promise;
        }).rejects.toThrow('Remote error occurred');
        expect(mockSend).toHaveBeenCalled();
      });

      it('should handle transport send errors', async () => {
        const mockSend = vi.fn().mockImplementation(() => {
          throw new Error('IRPC failed.');
        });

        const mockTransport = {
          send: mockSend,
        } as unknown as IRPCTransport;

        const factory = createModule({ timeout: 0 });
        factory.use(mockTransport);

        const spec = {
          name: 'remoteFunc',
          description: 'A remote function',
        };

        const remoteFunction = factory<(input: string) => Promise<string>>(spec);

        const promise = remoteFunction('test input');
        vi.runAllTimers();

        // Call the remote function
        await expect(promise).rejects.toThrow('IRPC failed.');
        expect(mockSend).toHaveBeenCalled();
      });
    });
  });
});
