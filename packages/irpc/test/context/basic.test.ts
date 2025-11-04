import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createContext, getContext, setContext, setContextProvider, withContext } from '../../src/context';
import type { IRPCContextProvider } from '../../src/types';

describe('IRPC - Core', () => {
  describe('Context Module', () => {
    describe('Basic', () => {
      beforeEach(() => {
        // Reset context provider
        // @ts-ignore
        setContextProvider(undefined);
      });

      it('should create a new context map', () => {
        const context = createContext([
          ['key1', 'value1'],
          ['key2', 'value2'],
        ]);

        expect(context).toBeInstanceOf(Map);
        expect(context.get('key1')).toBe('value1');
        expect(context.get('key2')).toBe('value2');
      });

      it('should work with context without provider', () => {
        const context = createContext([['test', 'value']]);
        const result = withContext(context, () => 'test-result');

        expect(result).toBe('test-result');
      });

      it('should set and get context values without provider', () => {
        // Without provider, these should not throw but also not do anything meaningful
        expect(() => setContext('test-key', 'test-value')).not.toThrow();
        expect(getContext('test-key')).toBeUndefined();
        expect(getContext('test-key', 'fallback')).toBe('fallback');
      });

      it('should work with a context provider', () => {
        const mockStore = new Map();
        const mockProvider: IRPCContextProvider = {
          run: vi.fn((ctx, fn) => {
            // @ts-ignore
            mockProvider.getStore = vi.fn(() => ctx);
            return fn();
          }),
          getStore: vi.fn(() => mockStore),
        };

        setContextProvider(mockProvider);

        const context = createContext([['test', 'value']]);
        const result = withContext(context, () => 'test-result');

        expect(result).toBe('test-result');
        expect(mockProvider.run).toHaveBeenCalled();
      });
    });
  });
});
