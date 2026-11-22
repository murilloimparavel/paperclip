import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter } from "lucide-react";
import type { Agent } from "@paperclipai/shared";
import { aiConnectionsApi } from "@/api/ai-connections";
import { agentRosterFilterFields, buildAgentRosterIndex, emptyAgentRosterFilters, matchesAgentRosterFilters, type AgentRosterFilterField, type AgentRosterFilters as FilterState, type AgentRosterOption } from "@/lib/agent-roster-filters";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NativeSelect } from "@/components/ui/select";
import { useTranslation } from "@/i18n";

const emptyAgents: Agent[] = [];
const labelKeys: Record<AgentRosterFilterField, string> = { model: "agentRoster.model", status: "agentRoster.status", harness: "agentRoster.harness", connection: "agentRoster.connection" };
const allLabelKeys: Record<AgentRosterFilterField, string> = { model: "agentRoster.allModels", status: "agentRoster.allStatuses", harness: "agentRoster.allHarnesses", connection: "agentRoster.allConnections" };

/** Page-owned state keeps filters when switching views and isolates them by company. */
export function useAgentRosterFilters(companyId: string | null, agents: Agent[] = emptyAgents) {
  const [selection, setSelection] = useState({ companyId, filters: emptyAgentRosterFilters });
  const filters = selection.companyId === companyId ? selection.filters : emptyAgentRosterFilters;
  const accounts = useQuery({ queryKey: ["ai-connections", companyId], queryFn: () => aiConnectionsApi.list(companyId!), enabled: !!companyId });
  const index = useMemo(() => buildAgentRosterIndex(agents, accounts.data), [agents, accounts.data]);
  const activeCount = agentRosterFilterFields.filter(field => filters[field]).length;
  const matches = useCallback((agent: Agent) => matchesAgentRosterFilters(index.byAgentId.get(agent.id), filters), [index, filters]);
  return {
    filters, options: index.options, activeCount,
    onChange: (next: FilterState) => setSelection({ companyId, filters: next }),
    matches,
    connectionError: accounts.error,
    retryConnections: () => void accounts.refetch(),
  };
}

export function AgentRosterFilters({ filters, options, onChange, activeCount, count, connectionError, retryConnections, compact = false }: {
  filters: FilterState;
  options: Record<AgentRosterFilterField, AgentRosterOption[]>;
  onChange: (filters: FilterState) => void;
  activeCount: number;
  count: number;
  compact?: boolean;
  connectionError?: unknown;
  retryConnections: () => void;
}) {
  const { t } = useTranslation();
  return <div data-canonical-toolbar="agent-filters" role="toolbar" aria-label={t("agentRoster.agentFilters")} className={cn("flex flex-wrap items-center gap-3", !compact && "justify-between")}>
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={compact ? "outline" : "ghost"} size="icon" aria-label={t("agentRoster.filterAgents")} title={activeCount ? t("agentRoster.filtersCount", { count: activeCount }) : t("agentRoster.filterAgents")}
          className={cn("relative shrink-0", compact && "design-toolbar-icon", activeCount > 0 && "text-blue-600 dark:text-blue-400")}>
          <Filter className="size-3.5" aria-hidden />
          {activeCount > 0 && <span aria-hidden className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-blue-600 text-(length:--text-nano) font-bold text-white">{activeCount}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent aria-label={t("agentRoster.filterChoices")} align="start" className="max-h-96 w-72 space-y-3 overflow-y-auto p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t("agentRoster.filters")}</span>
          {activeCount > 0 && <Button variant="ghost" size="sm" onClick={() => onChange(emptyAgentRosterFilters)}>{t("agentRoster.clearFilters")}</Button>}
        </div>
        {agentRosterFilterFields.map(field => <label key={field} className="block space-y-1 text-xs font-medium text-muted-foreground">
          <span>{t(labelKeys[field])}</span>
          <NativeSelect aria-label={t(labelKeys[field])} value={filters[field]} onChange={event => onChange({ ...filters, [field]: event.target.value })}
            className="h-11 text-base md:text-sm">
            <option value="">{t(allLabelKeys[field])}</option>
            {filters[field] && !options[field].some(option => option.value === filters[field]) && <option value={filters[field]}>{t("agentRoster.previouslySelected", { field: t(labelKeys[field]).toLocaleLowerCase() })}</option>}
            {options[field].map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </NativeSelect>
        </label>)}
      </PopoverContent>
    </Popover>
    {!compact && <span className="text-xs text-muted-foreground">{t("agentRoster.agent", { count })}</span>}
    {!!connectionError && <p role="alert" className="basis-full text-xs text-destructive">{t("agentRoster.connectionNamesError")} <Button variant="link" size="sm" onClick={retryConnections}>{t("agentRoster.retry")}</Button></p>}
  </div>;
}
