import type { IRPCFactory } from '@irpclib/irpc';
import { describe, expect, it, vi } from 'vitest';
import { HTTPTransport } from '../../src/index';

describe('HTTP Package', () => {
  describe('Transport Module', () => {
    describe('URL Creation', () => {
      it('should create correct URL with base URL', () => {
        const mockFactory = {
          use: vi.fn(),
        } as unknown as IRPCFactory;

        const config = {
          endpoint: '/api/rpc',
          baseURL: 'https://example.com',
        };

        const transport = new HTTPTransport(config, mockFactory);
        
        expect(transport.url).toBe('https://example.com/api/rpc');
      });

      it('should create correct URL without base URL', () => {
        const mockFactory = {
          use: vi.fn(),
        } as unknown as IRPCFactory;

        const config = {
          endpoint: '/api/rpc',
        };

        const transport = new HTTPTransport(config, mockFactory);
        
        expect(transport.url).toBe('/api/rpc');
      });

      it('should handle trailing slashes in base URL', () => {
        const mockFactory = {
          use: vi.fn(),
        } as unknown as IRPCFactory;

        const config = {
          endpoint: '/api/rpc',
          baseURL: 'https://example.com/',
        };

        const transport = new HTTPTransport(config, mockFactory);
        
        expect(transport.url).toBe('https://example.com/api/rpc');
      });

      it('should handle leading slashes in endpoint', () => {
        const mockFactory = {
          use: vi.fn(),
        } as unknown as IRPCFactory;

        const config = {
          endpoint: '//api/rpc',
          baseURL: 'https://example.com',
        };

        const transport = new HTTPTransport(config, mockFactory);
        
        expect(transport.url).toBe('https://example.com/api/rpc');
      });
    });
  });
});