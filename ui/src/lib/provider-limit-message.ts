function relativeTimeFormatter(locale: string): Intl.RelativeTimeFormat {
  return new Intl.RelativeTimeFormat(locale, { numeric: "always" });
}
const relativeUnits = [
  [86_400_000, "day"], [3_600_000, "hour"], [60_000, "minute"], [1000, "second"],
] as const;
const resetTimestampPattern = /\b(resets?|starts|recheck(?: availability| the (?:agent's )?provider usage limit)?) (?:at|after) (\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z)\b/g;

export function providerLimitMessageResetAt(message: string): number | null {
  if (!message.includes("provider usage limit")) return null;
  let latest: number | null = null;
  for (const match of message.matchAll(resetTimestampPattern)) {
    const resetAt = Date.parse(match[2]);
    if (Number.isFinite(resetAt)) latest = Math.max(latest ?? resetAt, resetAt);
  }
  return latest;
}

export function formatProviderLimitTime(timestamp: string, now = Date.now(), locale = "en-US"): string {
  const at = new Date(timestamp);
  const remainingMs = at.getTime() - now;
  if (!Number.isFinite(remainingMs)) return timestamp;
  const [unitMs, unit] = relativeUnits.find(([size]) => Math.abs(remainingMs) >= size) ?? relativeUnits[3];
  const amount = Math.round(remainingMs / unitMs);
  const relative = amount === 0
    ? (locale.toLowerCase().startsWith("en") ? "now" : "agora")
    : relativeTimeFormatter(locale).format(amount, unit);
  const date = at.toLocaleString(locale, {
    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short",
  });
  return `${relative} (${date})`;
}

function localizeKnownProviderCopy(
  message: string,
  translate: (key: string) => string,
): string {
  const replacements: Array<[string, string]> = [
    ["The provider usage limit for this agent is expected to reset", "expectedReset"],
    ["(no reset time was reported, so Paperclip waits one hour)", "unknownResetWait"],
    ["Paperclip will start this work then.", "startWorkThen"],
    ["Waiting for the provider usage limit to reset", "waitingForReset"],
    ["before starting work", "beforeStartingWork"],
    ["The provider usage limit resets", "limitResets"],
    ["; this wake could not schedule its retry and released the task", "retryCouldNotBeScheduled"],
    ["Waiting for the agent's provider usage limit to reset; the work starts", "waitingForAgentReset"],
    ["This agent's provider usage limit has no reported reset time. Work is held; a retry can recheck availability", "noResetTimeReported"],
    ["; the limit may still apply then.", "limitMayStillApply"],
    ["Waiting to recheck the provider usage limit", "waitingToRecheck"],
    ["Paperclip will recheck the agent's provider usage limit", "paperclipWillRecheck"],
  ];
  let localized = message;
  for (const [source, key] of replacements) localized = localized.replaceAll(source, translate(`providerLimitMessage.${key}`));
  if (localized === "Waiting for usage limit reset") return translate("providerLimitMessage.waitingForResetLabel");
  return localized;
}

export function formatProviderLimitMessage(
  message: string,
  now = Date.now(),
  locale = "en-US",
  translate: (key: string) => string = (key) => ({
    "providerLimitMessage.expectedReset": "The provider usage limit for this agent is expected to reset",
    "providerLimitMessage.unknownResetWait": "(no reset time was reported, so Paperclip waits one hour)",
    "providerLimitMessage.startWorkThen": "Paperclip will start this work then.",
    "providerLimitMessage.waitingForReset": "Waiting for the provider usage limit to reset",
    "providerLimitMessage.beforeStartingWork": "before starting work",
    "providerLimitMessage.limitResets": "The provider usage limit resets",
    "providerLimitMessage.retryCouldNotBeScheduled": "; this wake could not schedule its retry and released the task",
    "providerLimitMessage.waitingForAgentReset": "Waiting for the agent's provider usage limit to reset; the work starts at",
    "providerLimitMessage.noResetTimeReported": "This agent's provider usage limit has no reported reset time. Work is held; a retry can recheck availability after",
    "providerLimitMessage.limitMayStillApply": "; the limit may still apply then.",
    "providerLimitMessage.waitingToRecheck": "Waiting to recheck the provider usage limit after",
    "providerLimitMessage.paperclipWillRecheck": "Paperclip will recheck the agent's provider usage limit at",
    "providerLimitMessage.waitingForResetLabel": "Waiting for usage limit reset",
  }[key] ?? key),
): string {
  if (!message.includes("provider usage limit")) return message;
  const formatted = message.replace(
    resetTimestampPattern,
    (match: string, verb: string, timestamp: string) => {
      if (!Number.isFinite(Date.parse(timestamp))) return match;
      return `${verb} ${formatProviderLimitTime(timestamp, now, locale)}`;
    },
  );
  return localizeKnownProviderCopy(formatted, translate);
}
