import type { ReactNode } from "react";
import type { ProviderFailure } from "@paperclipai/shared";
import { InlineBanner } from "./InlineBanner";
import { t } from "@/i18n";

export function ProviderFailureNotice({ failure, actions, children, className }: {
  failure: ProviderFailure; actions?: ReactNode; children?: ReactNode; className?: string;
}) {
  const labels: Record<ProviderFailure["category"], string> = {
    rate_limit: t("providerFailures.rateLimit"), quota_exhausted: t("providerFailures.quotaExhausted"),
    authentication: t("providerFailures.authentication"), permission: t("providerFailures.permission"),
    model_unavailable: t("providerFailures.modelUnavailable"), invalid_request: t("providerFailures.invalidRequest"),
    overloaded: t("providerFailures.overloaded"), timeout: t("providerFailures.timeout"), unknown: t("providerFailures.unknown"),
  };
  const provider = ({ anthropic: "Claude", openai: "OpenAI", sandbox: t("providerFailures.sandbox") } as Record<string, string>)[failure.provider] ?? failure.provider;
  return (
    <InlineBanner tone="danger" title={`${provider}: ${labels[failure.category]}`} actions={actions} className={className}>
      <div className="flex flex-col gap-2">
        <p className="whitespace-pre-wrap break-words">{failure.message}</p>
        <p className="text-xs text-muted-foreground">
          {failure.phase === "startup" ? t("providerFailures.failedBefore") : t("providerFailures.failedDuring")}
          {failure.httpStatus ? ` · HTTP ${failure.httpStatus}` : ""}
          {failure.providerCode ? ` · ${failure.providerCode}` : ""}
        </p>
        {failure.requestId && <p className="font-mono text-xs text-muted-foreground">{t("providerFailures.request", { id: failure.requestId })}</p>}
        {children}
      </div>
    </InlineBanner>
  );
}
