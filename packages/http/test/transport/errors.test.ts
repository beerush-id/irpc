import type { IRPCFactory } from '@irpclib/irpc';
import { describe, expect, it, vi } from 'vitest';
import { HTTPTransport } from '../../src/index';

describe('HTTP Package', () => {
  describe('Transport Module', () => {
    describe('Error Handling', () => {
      it('should handle fetch errors gracefully', async () => {
        const mockFactory = {
          get: vi.fn().mockReturnValue({}),
          use: vi.fn(),
        } as unknown as IRPCFactory;

        const config = {
          endpoint: '/api/rpc',
          baseURL: 'https://example.com',
        };

        const transport = new HTTPTransport(config, mockFactory);

        // Create mock calls
        const rejectMock = vi.fn();
        const calls = [
          {
            id: '1',
            payload: {
              name: 'testMethod',
              args: [],
            },
            resolve: vi.fn(),
            reject: rejectMock,
          },
        ];

        // Mock fetch to reject with an error
        const originalFetch = global.fetch;
        global.fetch = vi.fn().mockRejectedValue(new Error('Network error')) as any;

        // Since the implementation doesn't catch fetch errors, the send method will throw
        await expect(transport.send(calls as any)).rejects.toThrow('Network error');

        // Restore fetch
        global.fetch = originalFetch;
      });

      it('should handle non-ok responses', async () => {
        const mockFactory = {
          get: vi.fn().mockReturnValue({}),
          use: vi.fn(),
        } as unknown as IRPCFactory;

        const config = {
          endpoint: '/api/rpc',
          baseURL: 'https://example.com',
        };

        const transport = new HTTPTransport(config, mockFactory);

        // Create mock calls
        const rejectMock = vi.fn();
        const calls = [
          {
            id: '1',
            payload: {
              name: 'testMethod',
              args: [],
            },
            resolve: vi.fn(),
            reject: rejectMock,
          },
        ];

        // Mock fetch to return non-ok response
        const originalFetch = global.fetch;
        global.fetch = vi.fn().mockResolvedValue({
          ok: false,
          statusText: 'Internal Server Error',
        }) as any;

        await transport.send(calls as any);

        expect(rejectMock).toHaveBeenCalledWith(new Error('Internal Server Error'));

        // Restore fetch
        global.fetch = originalFetch;
      });

      it('should handle unreadable response bodies', async () => {
        const mockFactory = {
          get: vi.fn().mockReturnValue({}),
          use: vi.fn(),
        } as unknown as IRPCFactory;

        const config = {
          endpoint: '/api/rpc',
          baseURL: 'https://example.com',
        };

        const transport = new HTTPTransport(config, mockFactory);

        // Create mock calls
        const rejectMock = vi.fn();
        const calls = [
          {
            id: '1',
            payload: {
              name: 'testMethod',
              args: [],
            },
            resolve: vi.fn(),
            reject: rejectMock,
          },
        ];

        // Mock fetch to return response without readable body
        const originalFetch = global.fetch;
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          body: null,
          statusText: 'OK',
        }) as any;

        await transport.send(calls as any);

        expect(rejectMock).toHaveBeenCalledWith(new Error('Response body is not readable'));

        // Restore fetch
        global.fetch = originalFetch;
      });
    });
  });
});
