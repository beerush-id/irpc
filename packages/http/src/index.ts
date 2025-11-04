import {
  createContext,
  type IRPCCall,
  type IRPCContext,
  type IRPCData,
  type IRPCFactory,
  type IRPCInputs,
  type IRPCOutput,
  type IRPCParseResult,
  type IRPCRequest,
  type IRPCResponse,
  type IRPCTransport,
  withContext,
} from '@irpclib/irpc';

export type HTTPTransportConfig = {
  endpoint: string;
  baseURL?: string;
  headers?: Record<string, string>;
};

export type HTTPMiddleware = <K, V>(req: Request, ctx: IRPCContext<K, V>) => Promise<void> | void;

export class HTTPTransport implements IRPCTransport {
  #middleware: HTTPMiddleware[] = [];

  public headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  public get url() {
    return new URL(this.config.endpoint, this.config.baseURL ?? '');
  }

  public get endpoint() {
    return this.url.pathname;
  }

  constructor(
    public config: HTTPTransportConfig,
    public factory: IRPCFactory
  ) {
    if (typeof config.headers === 'object' && config.headers !== null) {
      Object.assign(this.headers, config.headers);
    }

    factory.use(this);
  }

  public use(middleware: HTTPMiddleware) {
    this.#middleware.push(middleware);
    return this;
  }

  public async send(calls: IRPCCall[]) {
    const requests = calls.map((call) => {
      const spec = this.factory.get(call.payload.name);
      const args = parseInput(call.payload.args, spec.schema?.input);

      if (!args.success) {
        call.reject(new Error(args.error));
        return null;
      }

      return {
        id: call.id,
        name: call.payload.name,
        args: args.data,
      };
    });

    const transportable = requests.filter(Boolean);
    if (!transportable.length) {
      return [];
    }

    const response = await fetch(this.url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(transportable),
    });

    if (!response.ok) {
      calls.forEach((call) => {
        call.reject(new Error(response.statusText ?? 'Request failed.'));
      });

      return [];
    }

    const reader = response.body?.getReader();
    if (!reader) {
      calls.forEach((call) => {
        call.reject(new Error('Response body is not readable'));
      });
      return [];
    }

    const results: IRPCResponse[] = [];
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.trim() !== '');

        for (const line of lines) {
          try {
            const result = JSON.parse(line);
            results.push(result);

            const call = calls.find((c) => c.id === result.id);
            if (call) {
              if (result.error) {
                call.reject(new Error(result.error));
              } else {
                const spec = this.factory.info(result.name);
                const output = parseOutput(result.result, spec.schema?.output);

                if (output.success) {
                  call.resolve(output.data);
                } else {
                  call.reject(new Error(output.error?.message));
                }
              }
            }
          } catch (_e) {
            // Skip invalid JSON lines
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return results;
  }

  public async respond(src: Request) {
    const requests = new Set(((await src.json()) ?? []) as IRPCRequest[]);

    if (!requests.size) {
      return new Response(JSON.stringify([]), { status: 204 });
    }

    const ctx = createContext<string, unknown>([
      ['req', src],
      ['headers', src.headers],
    ]);

    await Promise.allSettled(this.#middleware.map((middleware) => middleware(src, ctx)));

    return withContext(ctx, () => {
      const readable = new ReadableStream({
        start: async (controller) => {
          const finalize = (req: IRPCRequest) => {
            requests.delete(req);

            if (!requests.size) {
              controller.close();
              ctx.clear();
            }
          };

          requests.forEach((req) => {
            const spec = this.factory.info(req);

            if (!spec) {
              controller.enqueue(
                JSON.stringify({
                  id: req.id,
                  name: req.name,
                  error: 'IRPC can not be found.',
                })
              );

              finalize(req);
              return;
            }

            if (spec.schema?.input && req.args.length !== spec.schema?.input?.length) {
              controller.enqueue(
                JSON.stringify({
                  id: req.id,
                  name: req.name,
                  error: 'Invalid arguments.',
                })
              );

              finalize(req);
              return;
            }

            const args = parseInput(req.args, spec.schema?.input);

            if (!args.success) {
              controller.enqueue(
                JSON.stringify({
                  id: req.id,
                  name: req.name,
                  error: args.error,
                })
              );

              finalize(req);
              return;
            }

            this.factory
              .resolve(req)
              .then((result) => {
                const output = parseOutput(result, spec.schema?.output);
                if (output.success) {
                  controller.enqueue(
                    JSON.stringify({
                      id: req.id,
                      name: req.name,
                      result: output.data,
                    })
                  );
                } else {
                  controller.enqueue(
                    JSON.stringify({
                      id: req.id,
                      name: req.name,
                      error: output.error?.message,
                    })
                  );
                }
                finalize(req);
              })
              .catch((error) => {
                controller.enqueue(
                  JSON.stringify({
                    id: req.id,
                    name: req.name,
                    error: error?.message ?? 'Unknown error.',
                  })
                );
                finalize(req);
              });
          });
        },
      });

      return new Response(readable, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  }

  public serve() {
    return {
      info: () => {
        const { name, version } = this.factory.namespace;
        return new Response(`${name}@${version} is healthy.`);
      },
      handle: (req: Request) => {
        return this.respond(req);
      },
    };
  }
}

function parseInput(args: unknown[], schema?: IRPCInputs) {
  if (schema && args.length !== schema.length) {
    return {
      data: [],
      success: false,
      error: 'Invalid arguments.',
    };
  }

  const parsed = args.map((arg, i) => {
    const input = schema?.[i];
    return input ? input.safeParse(arg) : { success: true, data: arg };
  }) as IRPCParseResult[];

  return {
    data: parsed.map((arg) => arg.data) as IRPCData[],
    success: parsed.every((arg) => arg.success),
    error: parsed
      .filter((arg) => !arg.success)
      .map((arg) => arg.error?.message)
      .join('\n'),
  };
}

function parseOutput(result: unknown, schema?: IRPCOutput) {
  if (schema) {
    return schema.safeParse(result);
  }

  return {
    success: true,
    data: result,
  } as IRPCParseResult;
}
