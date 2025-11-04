import type { IRPCFactory } from '@irpclib/irpc';
import { describe, expect, it, vi } from 'vitest';
import { HTTPTransport } from '../../src/index';

describe('HTTP Package', () => {
  describe('Transport Module', () => {
    describe('Serve Method', () => {
      it('should return server object with info and handle methods', () => {
        const mockFactory = {
          use: vi.fn(),
          namespace: {
            name: 'test-package',
            version: '1.0.0'
          }
        } as unknown as IRPCFactory;

        const config = {
          endpoint: '/api/rpc',
        };

        const transport = new HTTPTransport(config, mockFactory);
        const server = transport.serve();
        
        expect(server).toHaveProperty('info');
        expect(server).toHaveProperty('handle');
        expect(typeof server.info).toBe('function');
        expect(typeof server.handle).toBe('function');
      });

      it('should return correct info response', () => {
        const mockFactory = {
          use: vi.fn(),
          namespace: {
            name: 'test-package',
            version: '1.0.0'
          }
        } as unknown as IRPCFactory;

        const config = {
          endpoint: '/api/rpc',
        };

        const transport = new HTTPTransport(config, mockFactory);
        const server = transport.serve();
        const response = server.info();
        
        expect(response).toBeInstanceOf(Response);
        expect(response.status).toBe(200);
      });
    });
  });
});