import { useMemo } from "react";
import { usePageVisibility } from "@/lib/page-visibility";
import { formatProviderLimitMessage, providerLimitMessageResetAt } from "@/lib/provider-limit-message";
import { useSecondTick } from "./useSecondTick";
import { useTranslation } from "react-i18next";

export function useProviderLimitClock(resetAt: number | null, fixedNow?: number, active = true): number {
  const now = fixedNow ?? Date.now();
  const { visible } = usePageVisibility();
  useSecondTick(active && visible && fixedNow === undefined && resetAt !== null && resetAt > now);
  return now;
}

export function useProviderLimitMessage(message: string, active = true): string {
  const { t, i18n } = useTranslation();
  const resetAt = useMemo(() => providerLimitMessageResetAt(message), [message]);
  const now = useProviderLimitClock(resetAt, undefined, active);
  return formatProviderLimitMessage(message, now, i18n.language, (key) => t(key));
}
