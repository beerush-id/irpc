import type { IRPCFactory } from '@irpclib/irpc';
import { describe, expect, it, vi } from 'vitest';
import { HTTPTransport } from '../../src/index';

describe('HTTP Package', () => {
  describe('Transport Module', () => {
    describe('Basic', () => {
      it('should create HTTP transport with endpoint configuration', () => {
        const mockUse = vi.fn();
        const mockFactory = { use: mockUse } as unknown as IRPCFactory;
        const config = {
          baseURL: 'https://example.com',
          endpoint: '/api/rpc',
        };

        const transport = new HTTPTransport(config, mockFactory);

        expect(transport.endpoint).toBe('/api/rpc');
      });

      it('should create HTTP transport with base URL configuration', () => {
        const mockUse = vi.fn();
        const mockFactory = { use: mockUse } as unknown as IRPCFactory;
        const config = {
          endpoint: '/api/rpc',
          baseURL: 'https://example.com',
        };

        const transport = new HTTPTransport(config, mockFactory);

        expect(transport.url).toBe('https://example.com/api/rpc');
      });

      it('should attach to factory on creation', () => {
        const mockUse = vi.fn();
        const mockFactory = { use: mockUse } as unknown as IRPCFactory;
        const config = {
          endpoint: '/api/rpc',
        };

        new HTTPTransport(config, mockFactory);

        expect(mockUse).toHaveBeenCalled();
      });

      it('should allow adding middleware', () => {
        const mockUse = vi.fn();
        const mockFactory = { use: mockUse } as unknown as IRPCFactory;
        const config = {
          endpoint: '/api/rpc',
        };

        const transport = new HTTPTransport(config, mockFactory);
        const middleware = vi.fn();

        transport.use(middleware);

        expect(transport.middlewares).toContain(middleware);
      });

      it('should return self when adding middleware for chaining', () => {
        const mockFactory = {
          use: vi.fn(),
        } as unknown as IRPCFactory;

        const config = {
          endpoint: '/api/rpc',
        };

        const transport = new HTTPTransport(config, mockFactory);
        const result = transport.use(vi.fn());

        expect(result).toBe(transport);
      });
    });
  });
});
