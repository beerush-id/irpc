import { describe, expect, it } from 'vitest';
import { createModule } from '../../src/module';
import type { IRPCHandler } from '../../src/types';

describe('IRPC - Core', () => {
  describe('Module Module', () => {
    describe('Basic', () => {
      it('should create a module with default configuration', () => {
        const factory = createModule();

        expect(factory.namespace).toEqual({
          name: 'irpc',
          version: '1.0.0',
        });
      });

      it('should create a module with custom configuration', () => {
        const config = {
          name: 'test-module',
          version: '2.0.0',
          timeout: 5000,
        };

        const factory = createModule(config);

        expect(factory.namespace).toEqual({
          name: 'test-module',
          version: '2.0.0',
        });
      });

      it('should register and retrieve an IRPC function', () => {
        const factory = createModule();

        const spec = {
          name: 'testFunction',
          description: 'A test function',
        };

        const testFunction = factory(spec);

        const retrieved = factory.get('testFunction');
        expect(retrieved).toEqual(spec);
        expect(testFunction).toBeDefined();
      });

      it('should construct and call a local IRPC function', async () => {
        const factory = createModule();

        const spec = {
          name: 'add',
          description: 'Add two numbers',
        };

        const addFunction = factory<(a: number, b: number) => Promise<number>>(spec);

        // Construct the implementation
        factory.construct(addFunction, ((a: number, b: number) => {
          return Promise.resolve(a + b);
        }) as IRPCHandler);

        // Call the function
        const result = await addFunction(2, 3);
        expect(result).toBe(5);
      });

      it('should reject calls when no transport is configured for remote functions', async () => {
        const factory = createModule();

        const spec = {
          name: 'remoteFunction',
          description: 'A remote function',
        };

        const remoteFunction = factory<(a: string) => Promise<string>>(spec);

        // Try to call without constructing (making it remote) or setting transport
        await expect(remoteFunction('test')).rejects.toThrow('IRPC transport can not be found.');
      });

      it('should configure module settings', () => {
        const factory = createModule();

        expect(factory.namespace).toEqual({
          name: 'irpc',
          version: '1.0.0',
        });

        factory.configure({
          name: 'configured-module',
          version: '3.0.0',
        });

        expect(factory.namespace).toEqual({
          name: 'configured-module',
          version: '3.0.0',
        });
      });
    });
  });
});
