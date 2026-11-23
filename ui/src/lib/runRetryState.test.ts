import { describe, expect, it } from "vitest";
import { describeRunRetryState, formatRetryReason } from "./runRetryState";
import { t } from "@/i18n";

describe("runRetryState", () => {
  it("formats internal retry reasons for operators", () => {
    expect(formatRetryReason("transient_failure")).toBe(t("runRetry.reason.transientFailure"));
    expect(formatRetryReason("native_provider_overloaded")).toBe(t("runRetry.reason.nativeProviderOverloaded"));
    expect(formatRetryReason("issue_continuation_needed")).toBe(t("runRetry.reason.continuationNeeded"));
    expect(formatRetryReason("max_turns_continuation")).toBe(t("runRetry.reason.maxTurnsContinuation"));
    expect(formatRetryReason("custom_reason")).toBe("custom reason");
  });

  it("describes scheduled retries", () => {
    expect(
      describeRunRetryState({
        status: "scheduled_retry",
        retryOfRunId: "run-1",
        scheduledRetryAttempt: 2,
        scheduledRetryReason: "transient_failure",
        scheduledRetryAt: "2026-04-18T20:15:00.000Z",
      }),
    ).toMatchObject({
      kind: "scheduled",
      badgeLabel: t("runRetry.retryScheduled"),
      detail: `${t("runRetry.attempt", { count: 2 })} · ${t("runRetry.reason.transientFailure")}`,
    });
  });

  it("describes max-turn continuation retries distinctly", () => {
    expect(
      describeRunRetryState({
        status: "scheduled_retry",
        retryOfRunId: "run-max-turns",
        scheduledRetryAttempt: 1,
        scheduledRetryReason: "max_turns_continuation",
        scheduledRetryAt: "2026-04-18T20:15:00.000Z",
      }),
    ).toMatchObject({
      kind: "scheduled",
      badgeLabel: t("runRetry.continuationScheduled"),
      detail: `${t("runRetry.attempt", { count: 1 })} · ${t("runRetry.reason.maxTurnsContinuation")}`,
    });
  });

  it("describes exhausted retries", () => {
    expect(
      describeRunRetryState({
        status: "failed",
        retryOfRunId: "run-1",
        scheduledRetryAttempt: 4,
        scheduledRetryReason: "transient_failure",
        retryExhaustedReason: "Bounded retry exhausted after 4 scheduled attempts; no further automatic retry will be queued",
      }),
    ).toMatchObject({
      kind: "exhausted",
      badgeLabel: t("runRetry.retryExhausted"),
      detail: `${t("runRetry.attempt", { count: 4 })} · ${t("runRetry.reason.transientFailure")} · ${t("runRetry.automaticRetriesExhausted")}`,
      secondary: `${t("runRetry.exhaustion", { count: 4 })} ${t("runRetry.manualIntervention")}`,
    });
  });
});
