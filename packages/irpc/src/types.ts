import type {
  ZodArray,
  ZodBoolean,
  ZodNull,
  ZodNumber,
  ZodObject,
  ZodSafeParseResult,
  ZodString,
  ZodUndefined,
} from 'zod/v4';
import type { IRPCCall } from './call.js';

/**
 * A registry that maps IRPCHandlers to their corresponding IRPCHosts.
 * Uses WeakMap to avoid memory leaks by not preventing garbage collection of handlers.
 */
export type IRPCRegistry = WeakMap<IRPCHandler, IRPCHost<IRPCInputs, IRPCOutput>>;

/**
 * A store that maps string identifiers to IRPCHosts.
 * Used to keep track of available RPC hosts by their names.
 */
export type IRPCStore = Map<string, IRPCHost<IRPCInputs, IRPCOutput>>;

/**
 * A function that authorizes RPC requests.
 * Takes a Request object and returns a boolean (sync or async) indicating authorization status.
 */
export type IRPCAuthorizer = (req: Request) => Promise<boolean> | boolean;

/**
 * Represents primitive data types that can be used in IRPC communications.
 * Includes string, number, boolean, null, and undefined.
 */
export type IRPCPrimitive = string | number | boolean | null | undefined;

/**
 * Represents an object structure where keys are strings and values are IRPCData.
 * Used for structured data in RPC communications.
 */
export type IRPCObject = { [key: string]: IRPCData };

/**
 * Represents all possible data types in IRPC, including primitives, objects, and arrays.
 * This is a recursive type that allows nested structures.
 */
export type IRPCData = IRPCPrimitive | IRPCObject | IRPCData[];

/**
 * Union type of all primitive Zod schema types used for validation.
 */
export type IRPCPrimitiveSchema = ZodString | ZodNumber | ZodBoolean | ZodNull | ZodUndefined;

/**
 * Zod object schema type used for validating structured data.
 */
export type IRPCObjectSchema = ZodObject;

/**
 * Zod array schema that can contain primitive schemas or object schemas.
 */
export type IRPCArraySchema = ZodArray<IRPCPrimitiveSchema | IRPCObjectSchema>;

/**
 * Union type of all possible Zod schema types used in IRPC for input/output validation.
 */
export type IRPCDataSchema = IRPCPrimitiveSchema | IRPCObjectSchema | IRPCArraySchema;

/**
 * Type representing the result of a Zod schema validation operation.
 */
export type IRPCParseResult = ZodSafeParseResult<IRPCDataSchema>;

/**
 * Represents an array of input schemas for an RPC function.
 */
export type IRPCInputs = IRPCDataSchema[];

/**
 * Represents the output schema for an RPC function.
 */
export type IRPCOutput = IRPCDataSchema;

/**
 * Defines the basic information about an RPC namespace.
 */
export type IRPCNamespace = {
  /** The name of the namespace */
  name: string;
  /** The version of the namespace */
  version: string;
  /** Optional description of the namespace */
  description?: string;
};

/**
 * Defines an RPC module which extends a namespace with execution capabilities.
 */
export type IRPCModule = IRPCNamespace & {
  /** Optional function to submit RPC calls */
  submit?: (calls: IRPCCall[]) => Promise<IRPCResponse[]>;
  /** Optional timeout for RPC calls */
  timeout?: number;
  /** Optional transport mechanism for RPC communications */
  transport?: IRPCTransport;
};

/**
 * Represents the payload of an RPC call with its name and arguments.
 */
export type IRPCPayload = {
  /** The name of the RPC function to call */
  name: string;
  /** The arguments to pass to the RPC function */
  args: IRPCData[];
};

/**
 * Defines the schema for input and output validation of an RPC function.
 */
export type IRPCSchema<I extends IRPCInputs, O extends IRPCOutput> = {
  /** Optional input validation schemas */
  input?: I;
  /** Optional output validation schema */
  output?: O;
};

/**
 * Type definition for an RPC handler function.
 * Takes IRPCData arguments and returns a Promise resolving to IRPCData.
 */
export type IRPCHandler = (...args: IRPCData[]) => Promise<IRPCData>;

/**
 * Specification for an RPC function including its name, schema, and description.
 */
export type IRPCSpec<I extends IRPCInputs, O extends IRPCOutput> = {
  /** The name of the RPC function */
  name: string;
  /** Optional schema for input/output validation */
  schema?: IRPCSchema<I, O>;
  /** Optional description of the RPC function */
  description?: string;
};

/**
 * Host definition for an RPC function that combines the specification with execution details.
 */
export type IRPCHost<I extends IRPCInputs, O extends IRPCOutput> = IRPCSpec<I, O> & {
  /** The actual handler function that implements the RPC */
  handler: IRPCHandler;
};

/**
 * Factory interface for creating and managing RPC functions.
 */
export interface IRPCFactory {
  /**
   * Creates a new RPC function with the given specification.
   * @param spec The specification for the RPC function
   */
  <F, I extends IRPCInputs = IRPCInputs, O extends IRPCOutput = IRPCOutput>(spec: IRPCSpec<I, O>): F;

  /** The namespace associated with this factory */
  get namespace(): IRPCNamespace;

  /**
   * Gets the endpoint URL for this factory.
   * @param prefix Optional prefix to prepend to the endpoint, default to '/irpc'
   */
  endpoint(prefix?: string): string;

  /**
   * Sets the transport mechanism for this factory.
   * @param transport The transport to use
   */
  use(transport: IRPCTransport): IRPCFactory;

  /**
   * Gets the specification for an RPC function by name.
   * @param name The name of the RPC function
   */
  get<I extends IRPCInputs, O extends IRPCOutput>(name: string): IRPCSpec<I, O>;

  /**
   * Configures the module settings for this factory.
   * @param config Partial configuration for the module
   */
  configure(config: Partial<IRPCModule>): IRPCFactory;

  /**
   * Constructs an RPC function with its handler.
   * @param irpc The RPC function
   * @param handler The handler that implements the RPC function
   */
  construct<F>(irpc: F, handler: F): IRPCFactory;

  /**
   * Gets information about an RPC request.
   * @param req The RPC request
   */
  info<I extends IRPCInputs, O extends IRPCOutput>(req: IRPCRequest): IRPCSpec<I, O>;

  /**
   * Resolves an RPC request.
   * @param req The RPC request to resolve
   */
  resolve<R>(req: IRPCRequest): Promise<R>;
}

/**
 * Represents an incoming RPC request.
 */
export type IRPCRequest = {
  /** Unique identifier for the request */
  id: string;
  /** Name of the RPC function being called */
  name: string;
  /** Arguments for the RPC function */
  args: unknown[];
};

/**
 * Represents an RPC response.
 */
export type IRPCResponse = {
  /** Unique identifier matching the request */
  id: string;
  /** Name of the RPC function that was called */
  name: string;
  /** Error message if the call failed */
  error?: string;
  /** Result of the RPC call if successful */
  result?: unknown;
};

/**
 * Abstract base class for RPC transport mechanisms.
 */
export abstract class IRPCTransport {
  /**
   * Sends RPC calls and returns the responses.
   * @param calls Array of RPC calls to send
   */
  abstract send(calls: IRPCCall[]): Promise<IRPCResponse[]>;
}

/**
 * Context storage mechanism for RPC operations.
 */
export type IRPCContext<K, V> = Map<K, V>;

/**
 * Interface for managing RPC context stores.
 */
export type IRPCContextProvider = {
  /**
   * Runs a function within a specific context.
   * @param ctx The context to run within
   * @param fn The function to execute
   */
  run<R, K, V>(ctx: IRPCContext<K, V>, fn: () => R): R;

  /** Gets the current context store */
  getStore<K, V>(): IRPCContext<K, V>;
};
