import type { IRPCCall } from './call.js';

const IRPC_QUEUE = new Set<IRPCCall>();

/**
 * Batches multiple IRPC calls together and executes them with a specified delay.
 *
 * This function collects IRPC calls in a queue and executes them all at once after
 * a specified delay has passed. If multiple calls are made within the delay period,
 * they will be grouped together in a single batch execution.
 *
 * @param call - The IRPC call to be added to the current batch
 * @param handler - A function that will be called with all queued calls when the batch executes
 * @param delay - The delay in milliseconds before executing the batch (default: 0)
 */
export function batch(call: IRPCCall, handler: (calls: IRPCCall[]) => void, delay = 0) {
  if (!IRPC_QUEUE.size) {
    setTimeout(() => {
      handler([...IRPC_QUEUE.values()]);
      IRPC_QUEUE.clear();
    }, delay);
  }

  IRPC_QUEUE.add(call);
}
