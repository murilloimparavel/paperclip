import type { ReactNode, Ref } from "react";
import { List, Network, Plus } from "lucide-react";
import { ToolbarSearch } from "./ToolbarSearch";
import { Button } from "./ui/button";
import { OrgChartControls, type OrgChartActions } from "./OrgChartControls";
import { useTranslation } from "@/i18n";

export interface AgentsToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  view: "list" | "org";
  onViewChange: (value: "list" | "org") => void;
  hideViewToggle?: boolean;
  onNewAgent: () => void;
  filters?: ReactNode;
  orgControlsRef?: Ref<HTMLDivElement>;
  orgActions?: OrgChartActions;
}

/** Shared roster search, view controls and actions for the page and stories. */
export function AgentsToolbar({ query, onQueryChange, view, onViewChange, hideViewToggle, onNewAgent, filters, orgControlsRef, orgActions }: AgentsToolbarProps) {
  const { t } = useTranslation();
  return <div data-canonical-toolbar="agents" role="toolbar" aria-label={t("agentRoster.controls")} className="flex flex-wrap items-center gap-3">
    <div className="design-toolbar-controls flex w-full flex-wrap items-center gap-4">
      <ToolbarSearch query={query} onQueryChange={onQueryChange} label={t("agentRoster.search")} placeholder={t("agentRoster.searchPlaceholder")} />
      {!hideViewToggle && <div className="design-view-toggle" role="group" aria-label={t("agentRoster.view")}>
          <Button type="button" size="icon-sm" variant={view === "list" ? "secondary" : "ghost"} className="design-toolbar-icon" onClick={() => onViewChange("list")} title={t("agentRoster.listView")} aria-label={t("agentRoster.listView")} aria-pressed={view === "list"}><List aria-hidden /></Button>
          <Button type="button" size="icon-sm" variant={view === "org" ? "secondary" : "ghost"} className="design-toolbar-icon" onClick={() => onViewChange("org")} title={t("agentRoster.orgChartView")} aria-label={t("agentRoster.orgChartView")} aria-pressed={view === "org"}><Network aria-hidden /></Button>
      </div>}
      {filters}
      <div className="design-toolbar-actions">
        {orgActions && (
          <div ref={orgControlsRef} data-org-toolbar-controls className="agents-org-controls-reveal"
            data-visible={view === "org"} aria-hidden={view !== "org"} inert={view !== "org"}>
            <div className="min-w-0 overflow-hidden"><OrgChartControls {...orgActions} /></div>
          </div>
        )}
        <Button size="sm" variant="outline" data-toolbar-primary onClick={onNewAgent}><Plus aria-hidden />{t("agentRoster.newAgent")}</Button>
      </div>
    </div>
  </div>;
}
