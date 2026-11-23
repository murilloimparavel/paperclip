import { ShieldX, UserX } from "lucide-react";
import {
  type ResponsibleUserDenialCode,
} from "@paperclipai/shared";
import { cn } from "../lib/utils";
import { t } from "@/i18n";

/**
 * Renders actionable copy for a responsible-user ("on behalf of") authorization
 * denial. Distinct from a plain agent-lacks-permission failure: here the agent
 * may be allowed, but the human the run acts for is not (or is unavailable).
 *
 * Callers should only render this for responsible-user denial codes. The copy
 * is localized here so the shared code contract stays language independent.
 */
export function ResponsibleUserDenialNotice({
  code,
  userName,
  className,
}: {
  code: ResponsibleUserDenialCode;
  userName?: string | null;
  className?: string;
}) {
  const isUnavailable = code === "RESPONSIBLE_USER_UNAVAILABLE";
  const toneName = isUnavailable ? "unavailable" : "unauthorized";
  const user = userName?.trim() || t("responsibleUserDenial.genericUser");
  const title = t(isUnavailable ? "responsibleUserDenial.unavailableTitle" : "responsibleUserDenial.unauthorizedTitle");
  const description = t(isUnavailable ? "responsibleUserDenial.unavailableDescription" : "responsibleUserDenial.unauthorizedDescription", { user });
  const recommendedAction = t(isUnavailable ? "responsibleUserDenial.unavailableAction" : "responsibleUserDenial.unauthorizedAction", { user });
  const Icon = isUnavailable ? UserX : ShieldX;

  const tone = isUnavailable
    ? "border-amber-300/70 bg-amber-50/90 text-amber-950 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100"
    : "border-red-300/70 bg-red-50/90 text-red-950 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-100";
  const iconTone = isUnavailable
    ? "text-amber-600 dark:text-amber-300"
    : "text-red-600 dark:text-red-300";
  const actionTone = isUnavailable
    ? "text-amber-800 dark:text-amber-200"
    : "text-red-800 dark:text-red-200";

  return (
    <div
      role="status"
      data-testid="responsible-user-denial-notice"
      data-denial-code={code}
      data-denial-tone={toneName}
      className={cn("rounded-md border px-3 py-2.5 text-sm shadow-sm", tone, className)}
    >
      <div className="flex items-start gap-2">
        <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", iconTone)} aria-hidden="true" />
        <div className="min-w-0 space-y-1">
          <p className="font-medium leading-5">{title}</p>
          <p className="leading-5">{description}</p>
          <p className={cn("text-xs leading-5", actionTone)}>{recommendedAction}</p>
        </div>
      </div>
    </div>
  );
}
