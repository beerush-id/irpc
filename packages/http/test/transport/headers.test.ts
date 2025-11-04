import type { IRPCFactory } from '@irpclib/irpc';
import { describe, expect, it, vi } from 'vitest';
import { HTTPTransport } from '../../src/index';

describe('HTTP Package', () => {
  describe('Transport Module', () => {
    describe('Headers Configuration', () => {
      it('should set default headers', () => {
        const mockFactory = {
          use: vi.fn(),
        } as unknown as IRPCFactory;

        const config = {
          endpoint: '/api/rpc',
        };

        const transport = new HTTPTransport(config, mockFactory);
        
        expect(transport.headers).toEqual({
          'Content-Type': 'application/json',
        });
      });

      it('should merge custom headers with defaults', () => {
        const mockFactory = {
          use: vi.fn(),
        } as unknown as IRPCFactory;

        const config = {
          endpoint: '/api/rpc',
          headers: {
            'Authorization': 'Bearer token',
            'X-Custom-Header': 'custom-value'
          }
        };

        const transport = new HTTPTransport(config, mockFactory);
        
        expect(transport.headers).toEqual({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token',
          'X-Custom-Header': 'custom-value'
        });
      });

      it('should override default headers with custom ones', () => {
        const mockFactory = {
          use: vi.fn(),
        } as unknown as IRPCFactory;

        const config = {
          endpoint: '/api/rpc',
          headers: {
            'Content-Type': 'application/custom-type',
          }
        };

        const transport = new HTTPTransport(config, mockFactory);
        
        expect(transport.headers).toEqual({
          'Content-Type': 'application/custom-type',
        });
      });
    });
  });
});