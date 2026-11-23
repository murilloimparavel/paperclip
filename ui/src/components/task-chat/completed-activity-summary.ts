import { Brain, CirclePause, Gauge, Layers3 } from "lucide-react";
import type { TaskChatActivityPhaseItem } from "./task-chat-model";
import {
  toolActivityPresentation,
  type ToolFamily,
  type ToolIcon,
} from "./tool-taxonomy";
import { protocolActivityPresentation, providerNoticeSeverity } from "./task-chat-activity-presentation";
import { t } from "@/i18n";

type Activity = TaskChatActivityPhaseItem["items"][number];
const labelKeys: Record<ToolFamily, string> = {
  terminal: "ranCommands", grep: "searchedFiles", search: "searchedFiles", read: "readFiles",
  edit: "editedFiles", web: "searchedWeb", plan: "workedOnPlan", question: "requestedInput",
  agent: "workedWithAgents", safety: "reviewedSafety", image: "workedWithImages", wait: "waited",
  mcp: "usedConnectedTools", other: "usedTools",
};

const summaryText = (key: string) => t(`taskChatCompletedSummary.${key}`);

function localizeKnownProtocolLabel(value: string) {
  const known: Record<string, string> = {
    "PreToolUse hook ran": "preToolUseRan",
    "PreToolUse hook blocked a tool call": "preToolUseBlocked",
  };
  return known[value] ? summaryText(known[value]!) : value;
}

/** Describe observed activities, never infer success from a finished group. */
export function completedActivitySummary(items: Activity[]) {
  const categories = new Map<
    string,
    { label: string; icon: ToolIcon; order: number }
  >();
  const add = (label: string, icon: ToolIcon, order = 0) => {
    const existing = categories.get(label);
    if (!existing || order < existing.order)
      categories.set(label, { label, icon, order });
  };
  const tools: Array<{
    family: ToolFamily;
    icon: ToolIcon;
    completed: boolean;
    order: number;
  }> = [];
  const quietGovernance: Array<{ label: string; single: string; icon: ToolIcon; order: number }> = [];
  const notices: Array<{
    summary: string | undefined;
    severity: "info" | "warning" | "error";
    icon: ToolIcon;
    order: number;
  }> = [];
  for (const [order, item] of items.entries()) {
    if (item.kind === "tool") {
      const p = toolActivityPresentation({
        name: item.rawName ?? item.name,
        target: item.target,
      });
      tools.push({ ...p, order, completed: item.status === "completed" });
    } else if (item.kind === "protocol") {
      if (
        item.surface === "provider_activity" &&
        item.family === "tool_execution"
      ) {
        const value = (label: string) =>
          item.details.find((d) => d.label === label)?.value;
        const p = toolActivityPresentation({
          name: value("Name"),
          operation: value("Operation"),
          transport: value("Transport"),
          namespace: value("Namespace"),
          target: value("Target"),
        });
        tools.push({ ...p, order, completed: item.status === "completed" });
      } else {
        const p = protocolActivityPresentation(item);
        if (!p) continue;
        if (item.surface === "provider_activity" && item.family === "provider_notice") {
          // Reuse only the normalized notice text already available in the row.
          const summary = item.summary?.trim()
            || item.details.find((entry) => entry.label === "Summary")?.value.trim();
          notices.push({ summary, severity: providerNoticeSeverity(item), icon: p.icon, order });
          continue;
        }
        if (item.surface === "provider_activity" && (item.family === "hook" || item.family === "safety")) {
          // A hook or reviewer that stopped an action is the headline of the
          // group; routine passes only describe a group with nothing else.
          if (p.tone === "blocked" || p.tone === "failed") add(localizeKnownProtocolLabel(p.completedLabel), p.icon, -1);
          else quietGovernance.push({ label: summaryText(item.family === "hook" ? "ranHooks" : "autoReviewedActions"), single: localizeKnownProtocolLabel(p.completedLabel), icon: p.icon, order });
          continue;
        }
        if (item.surface === "provider_activity" && item.family === "verification") {
          // A failed check stays visible even when the compact label truncates.
          if (item.status === "failed") add(summaryText("checkFailed"), p.icon, -1);
          else if (item.details.find((entry) => entry.label === "Status")?.value === "not_run") add(summaryText("skippedChecks"), p.icon, order);
          else add(summaryText("ranChecks"), p.icon, order);
          continue;
        }
        if (item.surface === "provider_activity" && item.eventType === "model.route.changed") {
          add(summaryText("switchedModels"), p.icon, order);
          continue;
        }
        const family =
          item.surface === "provider_activity" ? item.family : item.surface;
        const label =
          (
            {
              research: summaryText("searchedWeb"), plan: summaryText("workedOnPlan"), delegation: summaryText("workedWithAgents"),
              artifact: summaryText("workedWithArtifacts"), context: summaryText("managedContext"), memory: summaryText("checkedMemory"),
              model_identity: summaryText("checkedModelSettings"), review: summaryText("workedInReviewMode"), hook: summaryText("ranHooks"),
              safety: summaryText("reviewedSafety"), terminal: summaryText("ranCommands"), wait: summaryText("waited"),
              verification: summaryText("ranChecks"), workspace_change: summaryText("workedOnFiles"),
              workspace_file: summaryText("referencedFiles"), resource: summaryText("addedResources"),
            } as Record<string, string>
          )[family] ?? summaryText("usedTools");
        add(label, p.icon, order);
      }
    }
  }
  if (notices.length) {
    const strongest = notices.find((notice) => notice.severity === "error")
      ?? notices.find((notice) => notice.severity === "warning")
      ?? notices[0]!;
    const label = notices.length === 1
      ? strongest.summary || summaryText("receivedProviderUpdate")
      : strongest.severity === "error"
        ? summaryText("providerErrorReported")
        : strongest.severity === "warning"
          ? summaryText("providerWarningReported")
          : summaryText("receivedProviderUpdates");
    // One notice category leaves room for actual work. Keep warnings and errors
    // visible when the compact label truncates other activity categories.
    add(label, strongest.icon, strongest.severity === "info" ? notices[0]!.order : -1);
  }
  const completedFamilies = new Set(
    tools.filter((tool) => tool.completed).map((tool) => tool.family),
  );
  // Merge repeated families and retries. Terminal is an action, not an exit-status claim.
  for (const tool of tools) {
    const succeeded = completedFamilies.has(tool.family);
    const label =
      tool.family === "read" && !succeeded
        ? summaryText("checkedFiles")
        : tool.family === "edit" && !succeeded
          ? summaryText("workedOnFiles")
          : summaryText(labelKeys[tool.family]);
    add(label, tool.icon, tool.order);
  }
  if (!categories.size) {
    // One quiet hook or review names itself; several share a category label.
    if (quietGovernance.length === 1) add(quietGovernance[0]!.single, quietGovernance[0]!.icon, quietGovernance[0]!.order);
    else for (const quiet of quietGovernance) add(quiet.label, quiet.icon, quiet.order);
  }
  if (!categories.size) {
    if (items.some((item) => item.kind === "thinking"))
      add(summaryText("thoughtThroughTask"), Brain);
    else if (items.some((item) => item.kind === "marker"))
      add(summaryText("activityStopped"), CirclePause);
    else add(summaryText("recordedUsage"), Gauge);
  }
  const values = [...categories.values()].sort((a, b) => a.order - b.order);
  const join = (parts: string[]) =>
    parts
      .map((p, i) => (i ? p.charAt(0).toLowerCase() + p.slice(1) : p))
      .join(", ");
  const fullLabel = join(values.map((v) => v.label));
  return {
    label:
      values.length > 3
        ? `${join(values.slice(0, 2).map((v) => v.label))}, ${summaryText("andMore")}`
        : fullLabel,
    fullLabel,
    icon: values.length === 1 ? values[0].icon : Layers3,
  };
}
