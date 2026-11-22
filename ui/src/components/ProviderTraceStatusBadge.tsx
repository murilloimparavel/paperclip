import type { ProviderTraceMetadata } from "@paperclipai/shared";
import { Bug, CircleOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { t } from "@/i18n";

export function runRequestedProviderTrace(
  contextSnapshot: Record<string, unknown> | null | undefined,
) {
  if (!contextSnapshot) return false;
  const debug = contextSnapshot.debug;
  return (
    typeof debug === "object" &&
    debug !== null &&
    !Array.isArray(debug) &&
    (debug as Record<string, unknown>).providerTrace === "raw"
  );
}

export function ProviderTraceStatusBadge({
  trace,
  requested = false,
  showOff = false,
  className,
}: {
  trace?: ProviderTraceMetadata | null;
  requested?: boolean;
  showOff?: boolean;
  className?: string;
}) {
  const status = trace?.status;
  const expired = trace
    ? new Date(trace.expiresAt).getTime() <= Date.now()
    : false;
  const label = expired
    ? t("providerTrace.expired")
    : status === "capturing"
      ? t("providerTrace.rawEnabled")
      : status === "complete"
        ? t("providerTrace.captured")
        : status === "incomplete"
          ? t("providerTrace.incomplete")
          : status === "truncated"
            ? t("providerTrace.truncated")
            : status === "expired"
              ? t("providerTrace.expired")
              : status === "deleted"
                ? t("providerTrace.deleted")
                : requested
                  ? t("providerTrace.requested")
                  : showOff
                    ? t("providerTrace.off")
                    : null;
  if (!label) return null;
  const warning =
    status === "incomplete" ||
    status === "truncated" ||
    status === "expired" ||
    status === "deleted" ||
    expired;
  const neutral = status === "deleted" || status === "expired" || expired || (!trace && !requested && showOff);
  const Icon = !trace && !requested && showOff ? CircleOff : Bug;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-(length:--text-micro) font-medium",
        neutral
          ? "border-border bg-background text-muted-foreground"
          : warning
            ? "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
            : "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200",
        className,
      )}
      title={
        trace
          ? t("providerTrace.tooltip", { frames: trace.frameCount, bytes: trace.byteCount, date: new Date(trace.expiresAt).toLocaleString() })
          : requested
            ? t("providerTrace.requestedHelp")
            : t("providerTrace.disabledHelp")
      }
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
