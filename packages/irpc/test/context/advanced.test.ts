import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createContext, getContext, setContext, setContextProvider, withContext } from '../../src/context';
import type { IRPCContextProvider } from '../../src/types';

describe('IRPC - Core', () => {
  beforeEach(() => {
    setContextProvider(undefined);
  });

  describe('Context Module', () => {
    describe('Advanced', () => {
      it('should set and get context values with provider', () => {
        const mockStore = new Map();
        const mockProvider: IRPCContextProvider = {
          run: vi.fn((ctx, fn) => {
            mockProvider.getStore = vi.fn(() => ctx);
            return fn();
          }),
          getStore: vi.fn(() => mockStore),
        };

        setContextProvider(mockProvider);

        // Set a context value
        setContext('test-key', 'test-value');

        // Get the context value
        const value = getContext('test-key');
        expect(value).toBe('test-value');

        // Get with fallback (should return actual value, not fallback)
        const valueWithFallback = getContext('test-key', 'fallback');
        expect(valueWithFallback).toBe('test-value');
      });

      it('should handle undefined values in context', () => {
        const mockStore = new Map();
        const mockProvider: IRPCContextProvider = {
          run: vi.fn((ctx, fn) => {
            mockProvider.getStore = vi.fn(() => ctx);
            return fn();
          }),
          getStore: vi.fn(() => mockStore),
        };

        setContextProvider(mockProvider);

        // Set an undefined value
        setContext('undefined-key', undefined);

        // Get the undefined value
        const value = getContext('undefined-key');
        expect(value).toBeUndefined();

        // Get with fallback
        const valueWithFallback = getContext('undefined-key', 'fallback');
        expect(valueWithFallback).toBe('fallback');
      });

      it('should handle falsy values in context', () => {
        const mockStore = new Map();
        const mockProvider: IRPCContextProvider = {
          run: vi.fn((ctx, fn) => {
            return fn();
          }),
          getStore: vi.fn(() => mockStore),
        };

        setContextProvider(mockProvider);

        // Set falsy values
        setContext('null-key', null);
        setContext('zero-key', 0);
        setContext('empty-string-key', '');
        setContext('false-key', false);

        // Get the falsy values
        expect(getContext('null-key')).toBeNull();
        expect(getContext('zero-key')).toBe(0);
        expect(getContext('empty-string-key')).toBe('');
        expect(getContext('false-key')).toBe(false);
      });

      it('should execute function within context provider', () => {
        const mockRun = vi.fn((ctx, fn) => {
          mockProvider.getStore = vi.fn(() => ctx);
          return fn();
        });

        const mockProvider: IRPCContextProvider = {
          run: mockRun,
          getStore: vi.fn(() => new Map()),
        };

        setContextProvider(mockProvider);

        const context = createContext([['key', 'value']]);
        const testFn = vi.fn(() => 'test-result');

        const result = withContext(context, testFn);

        expect(result).toBe('test-result');
        expect(mockRun).toHaveBeenCalledWith(context, testFn);
      });
    });
  });
});
