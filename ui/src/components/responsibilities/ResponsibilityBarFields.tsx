import type { ReactNode } from "react";
import type { TFunction } from "i18next";
import type { ResponsibilityMetricDirection, ResponsibilityMetricKind } from "@paperclipai/shared";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import {
  describeDraftStatusRule,
  METRIC_DIRECTION_OPTIONS,
  METRIC_KIND_OPTIONS,
  type BarDraft,
  type BarField,
} from "@/lib/responsibilities";

function localizeStatusRule(rule: string | null, t: TFunction): string | null {
  if (!rule) return null;
  if (rule === "On track when the answer is yes; behind when it is no") {
    return t("responsibilityBarFields.statusYesNo");
  }
  const range = rule.match(/^On track between (.+) and (.+); at risk up to (.+) outside it; behind further out$/);
  if (range) return t("responsibilityBarFields.statusRange", { low: range[1], high: range[2], band: range[3] });
  const atMostRisk = rule.match(/^On track at (.+) or less; at risk up to (.+)$/);
  if (atMostRisk) return t("responsibilityBarFields.statusAtMostRisk", { target: atMostRisk[1], limit: atMostRisk[2] });
  const atMost = rule.match(/^On track at (.+) or less; behind above that$/);
  if (atMost) return t("responsibilityBarFields.statusAtMost", { target: atMost[1] });
  const atLeastRisk = rule.match(/^On track at (.+) or more; at risk from (.+)$/);
  if (atLeastRisk) return t("responsibilityBarFields.statusAtLeastRisk", { target: atLeastRisk[1], limit: atLeastRisk[2] });
  const atLeast = rule.match(/^On track at (.+) or more; behind below that$/);
  if (atLeast) return t("responsibilityBarFields.statusAtLeast", { target: atLeast[1] });
  return rule;
}

function Field({
  label,
  hint,
  optional,
  error,
  children,
}: {
  label: string;
  hint?: string;
  optional?: boolean;
  error?: string | null;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-sm">
      <span className="font-medium text-foreground">
        {label}
        {optional ? <span className="font-normal text-muted-foreground"> ({t("responsibilityBarFields.optional")})</span> : null}
      </span>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      {children}
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </label>
  );
}

/**
 * The bar of a responsibility: the sentence, the kind of measure (its
 * template), what is measured and that template's own inputs (a direction and
 * target, a low and a high bound, or nothing for a yes or no), and
 * (optionally) a current reading, with one line on how status will be read.
 * Shared by adding a responsibility, adjusting a proposal and editing the bar.
 */
export function ResponsibilityBarFields({
  draft,
  onChange,
  missing,
  invalid,
  problems,
  showCurrent = false,
}: {
  draft: BarDraft;
  onChange: (next: BarDraft) => void;
  /** Required fields left blank, shown once the person tries to save. */
  missing?: ReadonlySet<BarField>;
  /** Number fields that are not numbers, or break the template's rules. */
  invalid?: ReadonlySet<BarField>;
  /** What is wrong with an invalid field, when it is more than "Enter a number". */
  problems?: Partial<Record<BarField, string>>;
  showCurrent?: boolean;
}) {
  const { t } = useTranslation();
  const set = (patch: Partial<BarDraft>) => onChange({ ...draft, ...patch });
  const errorFor = (field: BarField, required: string) =>
    missing?.has(field) ? required : invalid?.has(field) ? problems?.[field] ?? t("responsibilityBarFields.enterNumber") : null;
  const kind = draft.metricKind;
  const template = METRIC_KIND_OPTIONS.find((option) => option.value === kind);
  const rule = localizeStatusRule(describeDraftStatusRule(draft), t);
  const numberInput = (field: "metricTarget" | "metricLow" | "metricHigh", placeholder: string) => (
    <Input
      inputMode="decimal"
      value={draft[field]}
      placeholder={placeholder}
      aria-invalid={missing?.has(field) || invalid?.has(field) || undefined}
      onChange={(event) => set({ [field]: event.target.value })}
    />
  );
  const unitField = (
    <Field label={t("responsibilityBarFields.unit")} optional>
      <Input
        value={draft.metricUnit}
        maxLength={40}
        placeholder={kind === "range" ? t("responsibilityBarFields.rangeUnitPlaceholder") : t("responsibilityBarFields.unitPlaceholder")}
        onChange={(event) => set({ metricUnit: event.target.value })}
      />
    </Field>
  );
  const directionField = (
    <Field label={t("responsibilityBarFields.betterWhen")}>
      <NativeSelect
        value={draft.metricDirection}
        aria-label={t("responsibilityBarFields.betterWhen")}
        onChange={(event) => set({ metricDirection: event.target.value as ResponsibilityMetricDirection })}
      >
        {METRIC_DIRECTION_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>{t(`responsibilityBarFields.direction.${option.value}`)}</option>
        ))}
      </NativeSelect>
    </Field>
  );
  return (
    <div className="flex flex-col gap-4">
      <Field
        label={t("responsibilityBarFields.theBar")}
        hint={t("responsibilityBarFields.barHint")}
        error={errorFor("standard", t("responsibilityBarFields.describeBar"))}
      >
        <Textarea
          rows={2}
          value={draft.standard}
          placeholder={t("responsibilityBarFields.barPlaceholder")}
          aria-invalid={missing?.has("standard") || undefined}
          onChange={(event) => set({ standard: event.target.value })}
        />
      </Field>
      <Field label={t("responsibilityBarFields.kindOfMeasure")} hint={template ? t(`responsibilityBarFields.metricSummary.${kind}`) : undefined}>
        <NativeSelect
          value={kind}
          aria-label={t("responsibilityBarFields.kindOfMeasure")}
          onChange={(event) => set({ metricKind: event.target.value as ResponsibilityMetricKind, metricCurrent: "" })}
        >
          {METRIC_KIND_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{t(`responsibilityBarFields.metricKind.${option.value}`)}</option>
          ))}
        </NativeSelect>
      </Field>
      <Field
        label={kind === "yes_no" ? t("responsibilityBarFields.whatShouldBeTrue") : t("responsibilityBarFields.whatYouMeasure")}
        error={errorFor("metricName", kind === "yes_no" ? t("responsibilityBarFields.sayWhatShouldBeTrue") : t("responsibilityBarFields.nameWhatYouMeasure"))}
      >
        <Input
          value={draft.metricName}
          maxLength={200}
          placeholder={kind === "yes_no" ? t("responsibilityBarFields.yesNoPlaceholder") : kind === "range" ? t("responsibilityBarFields.rangePlaceholder") : t("responsibilityBarFields.metricPlaceholder")}
          aria-invalid={missing?.has("metricName") || undefined}
          onChange={(event) => set({ metricName: event.target.value })}
        />
      </Field>
      {kind === "volume" ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {directionField}
          <Field label={t("responsibilityBarFields.target")} error={errorFor("metricTarget", t("responsibilityBarFields.setTarget"))}>{numberInput("metricTarget", t("responsibilityBarFields.numberPlaceholder20"))}</Field>
          {unitField}
        </div>
      ) : kind === "percentage" ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {directionField}
          <Field label={t("responsibilityBarFields.targetPercent")} error={errorFor("metricTarget", t("responsibilityBarFields.setTarget"))}>{numberInput("metricTarget", t("responsibilityBarFields.numberPlaceholder90"))}</Field>
        </div>
      ) : kind === "range" ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={t("responsibilityBarFields.low")} error={errorFor("metricLow", t("responsibilityBarFields.setLowBound"))}>{numberInput("metricLow", t("responsibilityBarFields.numberPlaceholder12"))}</Field>
          <Field label={t("responsibilityBarFields.high")} error={errorFor("metricHigh", t("responsibilityBarFields.setHighBound"))}>{numberInput("metricHigh", t("responsibilityBarFields.numberPlaceholder24"))}</Field>
          {unitField}
        </div>
      ) : null}
      {rule ? <p className="text-xs text-muted-foreground" data-testid="bar-status-rule">{rule}.</p> : null}
      {showCurrent ? (
        kind === "yes_no" ? (
          <Field label={t("responsibilityBarFields.whereNow")} optional hint={t("responsibilityBarFields.currentYesNoHint")}>
            <NativeSelect
              value={draft.metricCurrent}
              aria-label={t("responsibilityBarFields.whereNow")}
              onChange={(event) => set({ metricCurrent: event.target.value })}
            >
              <option value="">{t("responsibilityBarFields.notKnownYet")}</option>
              <option value="yes">{t("responsibilityBarFields.yes")}</option>
              <option value="no">{t("responsibilityBarFields.no")}</option>
            </NativeSelect>
          </Field>
        ) : (
          <Field
            label={t("responsibilityBarFields.whereNow")}
            optional
            hint={t("responsibilityBarFields.currentNumberHint")}
            error={errorFor("metricCurrent", "")}
          >
            <Input
              inputMode="decimal"
              value={draft.metricCurrent}
              placeholder={kind === "percentage" ? t("responsibilityBarFields.numberPlaceholder85") : t("responsibilityBarFields.numberPlaceholder9")}
              aria-invalid={invalid?.has("metricCurrent") || undefined}
              onChange={(event) => set({ metricCurrent: event.target.value })}
            />
          </Field>
        )
      ) : null}
    </div>
  );
}
