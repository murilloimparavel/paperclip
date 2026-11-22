import { UserCheck, UserMinus, type LucideIcon } from "lucide-react";
import { ISSUE_REVIEW_POLICIES, type IssueReviewPolicy } from "@paperclipai/shared";
import { t } from "@/i18n";

/**
 * Copy for an issue's `reviewPolicy` (PAP-16506 P4).
 *
 * `in_review` means the work needs a verdict, and by default anyone with write
 * access can give it — people and agents alike, including the agent that did the
 * work. That default needs no UI at all: it is what every issue already does,
 * and there is no control for changing it. Only an agent sets the column, and
 * only the two opt-in constraints are worth showing:
 *
 * - `not_creator` — "Anyone else": the reviewer must not be the requester.
 * - `human_only` — "Human only": an agent cannot give the verdict.
 *
 * A `null` or `"anyone"` column renders nothing. Every surface that shows the
 * policy routes through {@link issueReviewPolicyBadge} so the review card, the
 * issue properties row, and the activity receipt cannot drift from each other or
 * from the server's refusal copy in `server/src/services/issue-review-policy.ts`.
 */

export interface IssueReviewPolicyBadge {
  value: IssueReviewPolicy;
  /** Badge text. */
  label: string;
  /** Tooltip — the rule the server enforces, spelled out. */
  description: string;
  Icon: LucideIcon;
}

/** Only the constrained policies are shown; `anyone` is the silent default. */
/** Mid-sentence wording for activity lines and field-change receipts. */
const BADGE_ICONS: Partial<Record<IssueReviewPolicy, LucideIcon>> = {
  not_creator: UserMinus,
  human_only: UserCheck,
};

/**
 * The badge for a policy, or `null` when there is nothing to show — which is the
 * common case, since an unset column means the default "anyone can approve".
 */
export function issueReviewPolicyBadge(
  policy: IssueReviewPolicy | null | undefined,
): IssueReviewPolicyBadge | null {
  if (typeof policy !== "string") return null;
  const Icon = BADGE_ICONS[policy as IssueReviewPolicy];
  if (!Icon) return null;
  return {
    value: policy as IssueReviewPolicy,
    label: t(`reviewPolicy.${policy}.label`),
    description: t(`reviewPolicy.${policy}.description`),
    Icon,
  };
}

/**
 * Mid-sentence wording for an activity line or a field-change receipt, where a
 * cleared column must read "anyone" rather than "none".
 */
export function formatReviewPolicyValue(value: unknown): string {
  if (value === null || value === undefined) return t("reviewPolicy.anyone");
  if (typeof value !== "string") return t("reviewPolicy.anyone");
  // Forward-compatible: a policy this build does not know reads as itself.
  if (value === "anyone") return t("reviewPolicy.anyone");
  if ((ISSUE_REVIEW_POLICIES as readonly string[]).includes(value)) {
    const label = t(`reviewPolicy.${value}.label`);
    return label.charAt(0).toLocaleLowerCase() + label.slice(1);
  }
  return value.replace(/_/g, " ");
}

/**
 * Read the policy off an untyped `AttentionSubject.metadata` bag. Absent or
 * unrecognised → `null`, which every consumer treats as the default.
 */
export function readIssueReviewPolicyMetadata(
  metadata: Record<string, unknown> | null | undefined,
): IssueReviewPolicy | null {
  const raw = metadata?.reviewPolicy;
  if (typeof raw !== "string") return null;
  return (ISSUE_REVIEW_POLICIES as readonly string[]).includes(raw)
    ? (raw as IssueReviewPolicy)
    : null;
}
