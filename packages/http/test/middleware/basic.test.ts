import type { IRPCFactory } from '@irpclib/irpc';
import { describe, expect, it, vi } from 'vitest';
import { HTTPTransport } from '../../src/index';

describe('HTTP Package', () => {
  describe('Middleware Module', () => {
    describe('Basic', () => {
      it('should allow registering middleware functions', () => {
        const mockFactory = {
          use: vi.fn(),
        } as unknown as IRPCFactory;

        const config = {
          endpoint: '/api/rpc',
        };

        const transport = new HTTPTransport(config, mockFactory);
        const middleware = vi.fn();

        transport.use(middleware);

        expect(transport.middlewares).toHaveLength(1);
        expect(transport.middlewares[0]).toBe(middleware);
      });

      it('should support method chaining when adding middleware', () => {
        const mockFactory = {
          use: vi.fn(),
        } as unknown as IRPCFactory;

        const config = {
          endpoint: '/api/rpc',
        };

        const transport = new HTTPTransport(config, mockFactory);
        const middleware1 = vi.fn();
        const middleware2 = vi.fn();

        const result = transport.use(middleware1).use(middleware2);

        expect(result).toBe(transport);
        expect(transport.middlewares).toHaveLength(2);
      });

      it('should execute middleware during respond', async () => {
        const mockFactory = {
          use: vi.fn(),
        } as unknown as IRPCFactory;

        const config = {
          endpoint: '/api/rpc',
        };

        const transport = new HTTPTransport(config, mockFactory);
        const middleware = vi.fn();
        transport.use(middleware);

        const mockRequest = {
          json: vi.fn().mockResolvedValue([{ id: '1', name: 'test', args: [] }]),
          headers: new Map(),
        };

        await transport.respond(mockRequest as any);

        // Middleware should be called during respond
        expect(middleware).toHaveBeenCalled();
      });
    });
  });
});
