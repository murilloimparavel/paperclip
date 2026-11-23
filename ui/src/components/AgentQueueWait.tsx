import type { ExecutionAgentQueue } from "@paperclipai/shared";
import { Hourglass } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "@/lib/router";
import { agentQueueConfigureHref, agentQueueWaitParts } from "@/lib/agent-queue-wait";
import { cn } from "@/lib/utils";

/**
 * A run that waits for one of its agent's concurrency slots:
 * "Waiting for Codie · 20 slots max · 41 of 295 in line · Configure".
 * It is a quiet system wait, not work in progress: no spinner, no elapsed timer.
 */
export function AgentQueueWait({
  queue,
  showConfigure = true,
  className,
}: {
  queue: ExecutionAgentQueue;
  showConfigure?: boolean;
  className?: string;
}) {
  const { t } = useTranslation();
  const [waiting, limit, line] = agentQueueWaitParts(queue, (key, options) => t(key, options));
  return (
    <span
      className={cn("flex min-w-0 flex-wrap items-center gap-x-1.5 text-sm text-muted-foreground", className)}
      data-testid="agent-queue-wait"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="flex size-5 shrink-0 items-center justify-center">
        <Hourglass className="size-3.5" aria-hidden="true" />
      </span>
      <span className="font-medium text-foreground/80">{waiting}</span>
      <span aria-hidden="true">·</span>
      <span>{limit}</span>
      <span aria-hidden="true">·</span>
      <span>{line}</span>
      {showConfigure ? (
        <>
          <span aria-hidden="true">·</span>
          <Link
            to={agentQueueConfigureHref(queue)}
            className="text-foreground/80 underline-offset-2 hover:text-foreground hover:underline"
            aria-label={t("agentQueueWait.configureAria", { name: queue.agentName })}
          >
            {t("agentQueueWait.configure")}
          </Link>
        </>
      ) : null}
    </span>
  );
}

/** List-row form: one muted word, the full sentence on hover. */
export function AgentQueueWaitChip({ queue }: { queue: ExecutionAgentQueue | null }) {
  const { t } = useTranslation();
  const title = queue
    ? agentQueueWaitParts(queue, (key, options) => t(key, options)).join(" · ")
    : t("agentQueueWait.waitingToStart");
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground"
      title={title}
      aria-label={title}
      data-testid="agent-queue-wait-chip"
    >
      <Hourglass className="size-3" aria-hidden="true" />
      {t("agentQueueWait.waiting")}
    </span>
  );
}
