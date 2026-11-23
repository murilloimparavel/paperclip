import { t } from "@/i18n";

export function runCancellationLabel(input: { grokWork?: boolean; isFailed: boolean; isPending: boolean }): string {
  if (input.grokWork) return input.isPending ? t("agentRuns.cancelWorkPending") : t("agentRuns.cancelWork");
  if (input.isFailed) return input.isPending ? t("agentRuns.stopPending") : t("agentRuns.stop");
  return input.isPending ? t("agentRuns.cancelPending") : t("agentRuns.cancel");
}
