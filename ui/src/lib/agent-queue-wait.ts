import type { ExecutionAgentQueue, ExecutionProjection } from "@paperclipai/shared";
import { agentDetailHref } from "../pages/agent-detail-navigation";
import { agentRouteRef } from "./utils";

/** The server's explanation that a run waits for a free slot of its agent. */
export function agentQueueWaitOf(
  execution: Pick<ExecutionProjection, "cause" | "agentQueue"> | null | undefined,
): ExecutionAgentQueue | null {
  return execution?.cause === "agent_at_capacity" && execution.agentQueue ? execution.agentQueue : null;
}

/** A run the server accepted but never started: it waits, it is not working. */
export function isWaitingToStart(run: { status: string; startedAt?: string | Date | null }): boolean {
  return run.status === "queued" && !run.startedAt;
}

/** The localized explanation that an agent run is waiting for capacity. */
export function agentQueueWaitParts(
  queue: ExecutionAgentQueue,
  translate: (key: string, options: Record<string, string | number>) => string = (key, options) => {
    if (key === "agentQueueWait.waitingFor") return `Waiting for ${options.name}`;
    if (key === "agentQueueWait.slotsMax") return `${options.count} ${options.count === 1 ? "slot" : "slots"} max`;
    return `${options.position} of ${options.total} in line`;
  },
): [string, string, string] {
  return [
    translate("agentQueueWait.waitingFor", { name: queue.agentName }),
    translate("agentQueueWait.slotsMax", { count: queue.maxConcurrentRuns }),
    translate("agentQueueWait.queuePosition", { position: queue.position, total: queue.queuedCount }),
  ];
}

/** Where the agent's concurrency limit is edited (its run policy, in the Advanced view). */
export function agentQueueConfigureHref(queue: Pick<ExecutionAgentQueue, "agentId" | "agentName">): string {
  return agentDetailHref(agentRouteRef({ id: queue.agentId, name: queue.agentName }), "advanced");
}
