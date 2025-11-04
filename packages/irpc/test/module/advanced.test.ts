import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createModule } from '../../src/module';
import type { IRPCHandler } from '../../src/types';

describe('IRPC - Core', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  describe('Module Module', () => {
    describe('Advanced', () => {
      it('should handle constructing non existence IRPC', () => {
        const factory = createModule();

        expect(() => {
          factory.construct(() => {}, vi.fn());
        }).toThrow('IRPC can not be found.');

        expect(() => {
          factory.construct({} as never, vi.fn());
        }).toThrow('Invalid IRPC.');
      });

      it('should resolve a registered IRPC call', async () => {
        const factory = createModule();

        const spec = {
          name: 'multiply',
          description: 'Multiply two numbers',
        };

        const multiplyFunction = factory<(a: number, b: number) => Promise<number>>(spec);

        // Construct the implementation
        factory.construct(multiplyFunction, ((a: number, b: number) => {
          return Promise.resolve(a * b);
        }) as IRPCHandler);

        // Use the resolve method directly
        const result = await factory.resolve({
          id: 'test-id',
          name: 'multiply',
          args: [3, 4],
        });

        expect(result).toBe(12);
      });

      it('should throw when resolving a non-existent IRPC call', async () => {
        const factory = createModule();

        expect(() =>
          factory.resolve({
            id: 'test-id',
            name: 'non-existent',
            args: [],
          })
        ).toThrow('IRPC can not be found.');
      });

      it('should throw when resolving an IRPC call without handler', async () => {
        const factory = createModule();

        const spec = {
          name: 'no-handler',
          description: 'Function without handler',
        };

        factory(spec);

        expect(() =>
          factory.resolve({
            id: 'test-id',
            name: 'no-handler',
            args: [],
          })
        ).toThrow('IRPC handler can not be found.');
      });

      it('should get information about an IRPC call', () => {
        const factory = createModule();

        const spec = {
          name: 'info-test',
          description: 'Function for info test',
        };

        factory(spec);

        const info = factory.info({
          id: 'test-id',
          name: 'info-test',
          args: [],
        });

        expect(info).toEqual(spec);
      });

      it('should handle timeout for remote calls', async () => {
        vi.useFakeTimers();

        const factory = createModule({ timeout: 1000 });

        factory.use({
          send: async () => {
            await new Promise((resolve) => setTimeout(resolve, 20000));
            return [];
          },
        });

        const spec = {
          name: 'timeout-test',
          description: 'Function for timeout test',
        };

        const timeoutFunction = factory<() => Promise<string>>(spec);

        // Try to call without transport - should timeout
        const promise = timeoutFunction();

        // Fast-forward until timer has been executed
        vi.runAllTimers();

        await expect(promise).rejects.toThrow('IRPC timeout.');

        vi.useRealTimers();
      });
    });
  });
});
