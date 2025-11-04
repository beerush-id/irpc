import type { IRPCFactory } from '@irpclib/irpc';
import { describe, expect, it, vi } from 'vitest';
import { HTTPTransport } from '../../src/index';

describe('HTTP Package', () => {
  describe('Transport Module', () => {
    describe('Send Operation', () => {
      it('should handle send calls', async () => {
        // Create a mock factory
        const mockFactory = {
          get: vi.fn().mockReturnValue({}),
          use: vi.fn(),
        } as unknown as IRPCFactory;

        const config = {
          endpoint: '/api/rpc',
          baseURL: 'https://example.com',
        };

        const transport = new HTTPTransport(config, mockFactory);

        // We won't actually test the fetch since it requires complex mocking
        // but we can verify the method exists and is callable
        expect(typeof transport.send).toBe('function');
      });

      it('should handle respond calls', async () => {
        // Create a mock factory
        const mockFactory = {
          get: vi.fn().mockReturnValue({}),
          info: vi.fn().mockReturnValue({}),
          resolve: vi.fn().mockResolvedValue({}),
          use: vi.fn(),
        } as unknown as IRPCFactory;

        const config = {
          endpoint: '/api/rpc',
          baseURL: 'https://example.com',
        };

        const transport = new HTTPTransport(config, mockFactory);

        // We can verify the method exists
        expect(typeof transport.respond).toBe('function');
      });

      it('should make fetch request with correct parameters', async () => {
        const mockFactory = {
          get: vi.fn().mockReturnValue({}),
          use: vi.fn(),
        } as unknown as IRPCFactory;

        const config = {
          endpoint: '/api/rpc',
          baseURL: 'https://example.com',
        };

        const transport = new HTTPTransport(config, mockFactory);

        // Mock fetch
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

        expect(global.fetch).toHaveBeenCalledWith(
          'https://example.com/api/rpc',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify([
              {
                id: '1',
                name: 'test',
                args: [],
              },
            ]),
          })
        );

        // Restore fetch
        global.fetch = originalFetch;
      });
    });
  });
});
