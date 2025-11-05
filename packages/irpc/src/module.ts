import { batch } from './batch.js';
import { IRPCCall } from './call.js';
import type {
  IRPCData,
  IRPCFactory,
  IRPCHandler,
  IRPCHost,
  IRPCInputs,
  IRPCModule,
  IRPCOutput,
  IRPCPayload,
  IRPCRegistry,
  IRPCSpec,
  IRPCStore,
  IRPCTransport,
} from './types.js';

const DEFAULT_TIMEOUT = 20000;

/**
 * Creates an IRPC module with the given configuration.
 *
 * This function initializes a new IRPC module with a store for tracking RPC calls,
 * a registry for mapping functions to their specifications, and various methods
 * for managing and executing remote procedure calls.
 *
 * @param config - Optional partial configuration for the IRPC module, excluding 'submit' and 'transport'
 * @returns An IRPC factory function with attached utility methods
 */
export function createModule(config?: Partial<Omit<IRPCModule, 'submit' | 'transport'>>) {
  const store: IRPCStore = new Map();

  const registry: IRPCRegistry = new WeakMap();
  const module: IRPCModule = { name: 'global', version: '1.0.0', timeout: DEFAULT_TIMEOUT, ...config };

  /**
   * Factory function that creates IRPC handlers based on specifications.
   * Each handler can either execute a local function or make a remote call.
   */
  const factory = ((spec) => {
    const host: IRPCHost<IRPCInputs, IRPCOutput> = { ...spec } as IRPCHost<IRPCInputs, IRPCOutput>;

    store.set(host.name, host);

    const fn = ((...args: IRPCData[]) => {
      if (typeof host.handler === 'function') {
        return host.handler(...args);
      } else {
        return remoteCall(module, host, ...args);
      }
    }) as IRPCHandler;

    registry.set(fn, host);

    return fn;
  }) as IRPCFactory;

  /**
   * Returns the namespace information of the module (name and version).
   */
  Object.defineProperty(factory, 'namespace', {
    get: () => ({ name: module.name, version: module.version }),
  });

  /**
   * Returns the endpoint URL for the module.
   * @type {(prefix?: string) => string}
   */
  factory.endpoint = ((prefix = 'irpc') => {
    return ['/', prefix, module.name, module.version].join('/').replace(/\/+/g, '/');
  }) as IRPCFactory['endpoint'];

  /**
   * Associates a handler function with an IRPC specification.
   * @param irpc - The IRPC function to construct
   * @param handler - The actual implementation of the IRPC function
   */
  factory.construct = (<F extends IRPCHandler>(irpc: F, handler: F) => {
    if (typeof irpc !== 'function') {
      throw new Error('Invalid IRPC.');
    }

    const host = registry.get(irpc) as IRPCHost<IRPCInputs, IRPCOutput>;

    if (!host) {
      throw new Error('IRPC can not be found.');
    }

    host.handler = handler;
  }) as IRPCFactory['construct'];

  /**
   * Sets the transport mechanism for the module.
   * @param transport - The transport layer to use for remote calls
   */
  factory.use = ((transport) => {
    if (typeof transport?.send !== 'function') {
      throw new Error('Invalid transport.');
    }

    module.transport = transport;
  }) as IRPCFactory['use'];

  /**
   * Retrieves an IRPC specification by name.
   * @param name - The name of the IRPC to retrieve
   * @returns The IRPC specification or undefined if not found
   */
  factory.get = ((name) => {
    return store.get(name);
  }) as IRPCFactory['get'];

  /**
   * Updates the module configuration.
   * @param config - Configuration properties to update
   */
  factory.configure = ((config) => {
    Object.assign(module, { ...config });
  }) as IRPCFactory['configure'];

  /**
   * Retrieves information about an IRPC by its request details.
   * @param req - Request containing the name of the IRPC to look up
   * @returns The IRPC specification or undefined if not found
   */
  factory.info = ((req) => {
    return store.get(req.name);
  }) as IRPCFactory['info'];

  /**
   * Resolves and executes an IRPC call with the provided arguments.
   * @param req - Request containing the name and arguments for the IRPC call
   * @returns The result of executing the IRPC handler
   */
  factory.resolve = ((req) => {
    const host = store.get(req.name);

    if (!host) {
      throw new Error('IRPC can not be found.');
    }

    if (!host.handler) {
      throw new Error('IRPC handler can not be found.');
    }

    return host.handler(...(req.args as IRPCData[]));
  }) as IRPCFactory['resolve'];

  /**
   * Submits a batch of IRPC calls for execution via the transport layer.
   * @param calls - Array of IRPC calls to submit
   */
  module.submit = ((calls: IRPCCall[]) => {
    try {
      const promise = (module.transport as IRPCTransport).send(calls);

      if (promise instanceof Promise) {
        promise.catch((reason) => {
          calls.forEach((call) => {
            call.reject(reason);
          });
        });
      }
    } catch (error) {
      calls.forEach((call) => {
        call.reject(error as Error);
      });
    }
  }) as IRPCModule['submit'];

  return factory;
}

/**
 * Executes a remote procedure call through the configured transport layer.
 *
 * This function creates an IRPC call payload and sends it through the module's transport mechanism.
 * It handles timeouts and promise resolution/rejection based on the response.
 *
 * @param module - The IRPC module containing transport and configuration
 * @param spec - The IRPC specification defining the remote procedure
 * @param args - Arguments to pass to the remote procedure
 * @returns A promise that resolves with the remote call result or rejects with an error
 * @throws Error if no transport is configured or if the call times out
 */
function remoteCall(module: IRPCModule, spec: IRPCSpec<IRPCInputs, IRPCOutput>, ...args: IRPCData[]) {
  const payload = { name: spec.name, args } as IRPCPayload;

  return new Promise((resolve, reject) => {
    if (!module.transport) {
      reject(new Error('IRPC transport can not be found.'));
      return;
    }

    const timeout = module.timeout
      ? setTimeout(() => {
          call.reject(new Error('IRPC timeout.'));
        }, module.timeout)
      : undefined;

    const call = new IRPCCall(
      payload,
      (value) => {
        resolve(value);
        clearTimeout(timeout);
      },
      (reason) => {
        reject(reason);
        clearTimeout(timeout);
      }
    );

    batch(call, module.submit!);
  });
}
