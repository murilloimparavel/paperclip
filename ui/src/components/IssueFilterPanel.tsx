import { useState, type ComponentProps, type CSSProperties } from "react";
import { useTranslation } from "@/i18n";
import { Bot, User } from "lucide-react";
import type { IssueFiltersPopover } from "./IssueFiltersPopover";
import { Button } from "./ui/button";
import { FlyoutHeader } from "./ui/flyout";
import { StatusIcon } from "./StatusIcon";
import { FilterGroup, FilterRow } from "./CollectionFilterOptions";
import { issueFilterLabel, issueStatusOrder, searchIssueFilterOptions, toggleIssueFilterValue } from "@/lib/issue-filters";

type PanelProps = Pick<ComponentProps<typeof IssueFiltersPopover>, "state" | "onChange" | "activeFilterCount" | "agents" | "projects" | "labels" | "creators" | "currentUserId" | "enableRoutineTasksFilter" | "enableAgentCreatedVisibilityFilter" | "enableLiveRunsFilter"> & { onClear: () => void };

/** The collection retains ownership of filter state. */
export function IssueFilterPanel({ state, onChange, activeFilterCount, agents = [], projects = [], labels = [], creators = [], currentUserId, onClear, enableRoutineTasksFilter, enableAgentCreatedVisibilityFilter, enableLiveRunsFilter = true }: PanelProps) {
  const { t } = useTranslation();
  const [queries, setQueries] = useState({ projects: "", creators: "", assignees: "", labels: "" });
  const search = (key: keyof typeof queries) => (value: string) => setQueries(current => ({ ...current, [key]: value }));
  const visibleProjects = searchIssueFilterOptions(projects, queries.projects, option => option.name);
  const visibleCreators = searchIssueFilterOptions(creators, queries.creators, option => `${option.label} ${option.searchText ?? ""}`);
  const assignees = [{ id: "__unassigned", name: t("taskFilters.noAssignee"), icon: null }, ...(currentUserId ? [{ id: "__me", name: t("taskFilters.me"), icon: <User /> }] : []), ...agents.map(agent => ({ ...agent, icon: null }))];
  const visibleAssignees = searchIssueFilterOptions(assignees, queries.assignees, option => option.name);
  const visibleLabels = searchIssueFilterOptions(labels, queries.labels, option => option.name);
  return <>
    <FlyoutHeader className="task-filters-header"><span>{t("taskFilters.filters")}</span>{activeFilterCount ? <Button variant="ghost" onClick={() => { onClear(); setQueries({ projects: "", creators: "", assignees: "", labels: "" }); }}>{t("taskFilters.clear")}</Button> : null}</FlyoutHeader>
    <div className="task-filters-grid">
      <div className="task-filter-group">
        <FilterGroup title={t("taskFilters.status")} optionsKey="statuses">
          {issueStatusOrder.map(status => <FilterRow key={status} label={t(`taskFilters.values.${status}`, { defaultValue: issueFilterLabel(status) })} checked={state.statuses.includes(status)} onToggle={() => onChange({ statuses: toggleIssueFilterValue(state.statuses, status) })} icon={<StatusIcon status={status} />} />)}
        </FilterGroup>
        {enableLiveRunsFilter || enableAgentCreatedVisibilityFilter || enableRoutineTasksFilter ? <FilterGroup title={t("taskFilters.visibility")} optionsKey="visibility">
          {enableLiveRunsFilter ? <FilterRow label={t("taskFilters.liveRunsOnly")} checked={state.liveOnly === true} onToggle={() => onChange({ liveOnly: !state.liveOnly })} /> : null}
          {enableAgentCreatedVisibilityFilter ? <FilterRow label={t("taskFilters.agentCreatedTasks")} checked={state.showAgentCreatedTasks} onToggle={() => onChange({ showAgentCreatedTasks: !state.showAgentCreatedTasks })} /> : null}
          {enableRoutineTasksFilter ? <FilterRow label={t("taskFilters.routineTasks")} checked={state.routineTasksOnly === true} onToggle={() => onChange({ routineTasksOnly: !state.routineTasksOnly })} /> : null}
        </FilterGroup> : null}
      </div>
      <FilterGroup title={t("taskFilters.project")} optionsKey="projects" searchLabel={t("taskFilters.projects")} query={queries.projects} onQueryChange={search("projects")}>
        {visibleProjects.map(project => <FilterRow key={project.id} label={project.name} checked={state.projects.includes(project.id)} onToggle={() => onChange({ projects: toggleIssueFilterValue(state.projects, project.id) })} />)}
        {!visibleProjects.length ? <p className="task-filter-empty">{queries.projects ? t("taskFilters.noProjectsMatch") : t("taskFilters.noProjectsAvailable")}</p> : null}
      </FilterGroup>
      <FilterGroup title={t("taskFilters.creator")} optionsKey="creators" searchLabel={t("taskFilters.creators")} query={queries.creators} onQueryChange={search("creators")}>
        {visibleCreators.map(creator => <FilterRow key={creator.id} label={creator.label} checked={state.creators.includes(creator.id)} onToggle={() => onChange({ creators: toggleIssueFilterValue(state.creators, creator.id) })} icon={creator.kind === "agent" ? <Bot /> : <User />} />)}
        {!visibleCreators.length ? <p className="task-filter-empty">{queries.creators ? t("taskFilters.noCreatorsMatch") : t("taskFilters.noCreatorsAvailable")}</p> : null}
      </FilterGroup>
      <FilterGroup title={t("taskFilters.responsible")} optionsKey="responsible" searchLabel={t("taskFilters.responsibles")} query={queries.assignees} onQueryChange={search("assignees")}>
        {visibleAssignees.map(assignee => <FilterRow key={assignee.id} label={assignee.name} checked={state.assignees.includes(assignee.id)} onToggle={() => onChange({ assignees: toggleIssueFilterValue(state.assignees, assignee.id) })} icon={assignee.icon} />)}
        {!visibleAssignees.length ? <p className="task-filter-empty">{t("taskFilters.noResponsiblesMatch")}</p> : null}
      </FilterGroup>
      <FilterGroup title={t("taskFilters.labels")} optionsKey="labels" searchLabel={t("taskFilters.labels")} query={queries.labels} onQueryChange={search("labels")}>
        {visibleLabels.map(label => <FilterRow key={label.id} label={label.name} checked={state.labels.includes(label.id)} onToggle={() => onChange({ labels: toggleIssueFilterValue(state.labels, label.id) })} icon={<span className="task-filter-label-dot" style={{ "--task-filter-label-color": label.color } as CSSProperties} />} />)}
        {!visibleLabels.length ? <p className="task-filter-empty">{queries.labels ? t("taskFilters.noLabelsMatch") : t("taskFilters.noLabelsAvailable")}</p> : null}
      </FilterGroup>
    </div>
  </>;
}
