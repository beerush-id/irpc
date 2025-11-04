import type { IRPCFactory } from '@irpclib/irpc';
import { describe, expect, it, vi } from 'vitest';
import { HTTPTransport } from '../../src/index';

describe('HTTP Package', () => {
  describe('Transport Module', () => {
    describe('Parsing Logic', () => {
      it('should handle invalid argument counts', async () => {
        const mockFactory = {
          get: vi.fn().mockReturnValue({
            schema: {
              input: [{}, {}], // Expecting 2 inputs
            },
          }),
          use: vi.fn(),
        } as unknown as IRPCFactory;

        const config = {
          endpoint: '/api/rpc',
        };

        const transport = new HTTPTransport(config, mockFactory);

        const rejectMock = vi.fn();
        const calls = [
          {
            id: '1',
            payload: {
              name: 'testMethod',
              args: [{}], // Only providing 1 argument
            },
            resolve: vi.fn(),
            reject: rejectMock,
          },
        ];

        await transport.send(calls as any);

        expect(rejectMock).toHaveBeenCalledWith(new Error('Invalid arguments.'));
      });

      it('should handle successful argument parsing', async () => {
        const mockFactory = {
          get: vi.fn().mockReturnValue({
            schema: {
              input: [
                {
                  safeParse: vi.fn().mockReturnValue({ success: true, data: {} }),
                },
              ],
            },
          }),
          info: vi.fn().mockReturnValue({
            schema: {
              output: {
                safeParse: vi.fn().mockReturnValue({ success: true, data: {} }),
              },
            },
          }),
          use: vi.fn(),
        } as unknown as IRPCFactory;

        const config = {
          endpoint: '/api/rpc',
        };

        const transport = new HTTPTransport(config, mockFactory);

        const resolveMock = vi.fn();
        const calls = [
          {
            id: '1',
            payload: {
              name: 'testMethod',
              args: [{}],
            },
            resolve: resolveMock,
            reject: vi.fn(),
          },
        ];

        // Mock fetch to return successful response
        const originalFetch = global.fetch;
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          body: {
            getReader: () => ({
              read: () => Promise.resolve({ done: true }),
              releaseLock: vi.fn(),
            }),
          },
        }) as any;

        await transport.send(calls as any);

        // Restore fetch
        global.fetch = originalFetch;
      });
    });
  });
});
