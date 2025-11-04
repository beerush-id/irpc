import type { IRPCFactory } from '@irpclib/irpc';
import { describe, expect, it, vi } from 'vitest';
import { HTTPTransport } from '../../src/index';

describe('HTTP Package', () => {
  describe('Transport Module', () => {
    describe('Edge Cases', () => {
      it('should handle JSON parsing errors in response', async () => {
        const mockFactory = {
          get: vi.fn().mockReturnValue({}),
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
          baseURL: 'https://example.com',
        };

        const transport = new HTTPTransport(config, mockFactory);

        // Mock fetch to return response with invalid JSON
        const originalFetch = global.fetch;
        let readCallCount = 0;
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          body: {
            getReader: () => ({
              read: () => {
                readCallCount++;
                if (readCallCount === 1) {
                  return Promise.resolve({
                    done: false,
                    value: new TextEncoder().encode('invalid json content'),
                  });
                } else {
                  // Signal end of stream on second call
                  return Promise.resolve({
                    done: true,
                    value: undefined,
                  });
                }
              },
              releaseLock: vi.fn(),
            }),
          },
        }) as any;

        const calls = [
          {
            id: '1',
            payload: {
              name: 'test',
              args: [],
            },
            resolve: vi.fn(),
            reject: vi.fn(),
          },
        ];

        await transport.send(calls as any);

        // Should not throw error, just skip invalid JSON
        expect(calls[0].resolve).not.toHaveBeenCalled();
        expect(calls[0].reject).not.toHaveBeenCalled();

        // Restore fetch
        global.fetch = originalFetch;
      });

      it('should handle response with error field', async () => {
        const mockFactory = {
          get: vi.fn().mockReturnValue({}),
          info: vi.fn().mockReturnValue({}),
          use: vi.fn(),
        } as unknown as IRPCFactory;

        const config = {
          endpoint: '/api/rpc',
          baseURL: 'https://example.com',
        };

        const transport = new HTTPTransport(config, mockFactory);

        // Mock fetch to return response with error
        const originalFetch = global.fetch;
        let readCallCount = 0;
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          body: {
            getReader: () => ({
              read: () => {
                readCallCount++;
                if (readCallCount === 1) {
                  return Promise.resolve({
                    done: false,
                    value: new TextEncoder().encode(
                      JSON.stringify({
                        id: '1',
                        error: 'Test error',
                      })
                    ),
                  });
                } else {
                  // Signal end of stream on second call
                  return Promise.resolve({
                    done: true,
                    value: undefined,
                  });
                }
              },
              releaseLock: vi.fn(),
            }),
          },
        }) as any;

        const rejectMock = vi.fn();
        const calls = [
          {
            id: '1',
            payload: {
              name: 'test',
              args: [],
            },
            resolve: vi.fn(),
            reject: rejectMock,
          },
        ];

        await transport.send(calls as any);

        expect(rejectMock).toHaveBeenCalledWith(new Error('Test error'));

        // Restore fetch
        global.fetch = originalFetch;
      });
    });
  });
});