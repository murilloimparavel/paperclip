import { describeError } from "@/api/errors";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { basicSetup } from "codemirror";
import { Compartment, EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { yaml } from "@codemirror/lang-yaml";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import type { Agent } from "@paperclipai/shared";
import { Button } from "../components/ui/button";
import { useToastActions } from "../context/ToastContext";
import { queryKeys } from "../lib/queryKeys";
import { parseAgentConfigurationYaml, serializeAgentConfigurationDocument } from "../lib/agent-configuration-yaml";
import { loadAgentConfiguration, type AgentConfigurationSnapshot } from "../lib/agent-configuration/load";
import { ConfigurationSaveInterrupted, planAgentConfiguration, saveAgentConfiguration, type ConfigurationReceipt } from "../lib/agent-configuration/save";
import { compactAgentConfiguration } from "../lib/agent-configuration/compact";
import { t } from "@/i18n";

const editableYaml = (configuration: AgentConfigurationSnapshot) => serializeAgentConfigurationDocument(compactAgentConfiguration(configuration.document));

function localizeConfigurationLabel(label: string): string {
  const exact: Record<string, string> = {
    "Instructions location (load the destination files)": "agentAdvanced.change.instructionsLocation",
    "Agent configuration": "agentAdvanced.change.agentConfiguration",
    "Skills and version pins": "agentAdvanced.change.skillsAndVersions",
    "Permissions and trust": "agentAdvanced.change.permissionsAndTrust",
    "Restore configuration revision": "agentAdvanced.change.restoreRevision",
  };
  if (exact[label]) return t(exact[label]!);
  const dynamic: Array<[string, string]> = [
    ["Instructions: ", "agentAdvanced.change.instructions"],
    ["Remove instruction file: ", "agentAdvanced.change.removeInstructionFile"],
    ["Create secret: ", "agentAdvanced.change.createSecret"],
    ["Rotate secret: ", "agentAdvanced.change.rotateSecret"],
    ["Update secret: ", "agentAdvanced.change.updateSecret"],
    ["Secret proposal: ", "agentAdvanced.change.secretProposal"],
    ["Revoke API key: ", "agentAdvanced.change.revokeApiKey"],
    ["Create API key: ", "agentAdvanced.change.createApiKey"],
  ];
  for (const [prefix, key] of dynamic) {
    if (label.startsWith(prefix)) return t(key, { value: label.slice(prefix.length) });
  }
  return label;
}

function localizeReceiptLabel(label: string): string {
  if (label.startsWith("Secret: ")) return t("agentAdvanced.receipt.secret", { name: label.slice("Secret: ".length) });
  if (label.startsWith("API key: ")) return t("agentAdvanced.receipt.apiKey", { name: label.slice("API key: ".length) });
  return label;
}

const yamlHighlightStyle = HighlightStyle.define([
  { tag: tags.propertyName, class: "text-primary" },
  { tag: tags.string, class: "text-foreground" },
  { tag: [tags.bool, tags.number, tags.null], class: "text-muted-foreground" },
  { tag: tags.keyword, class: "text-primary" },
  { tag: tags.comment, class: "text-muted-foreground" },
]);

export interface AgentAdvancedTabProps {
  agent: Agent;
  onDirtyChange: (dirty: boolean) => void;
  onSaved: (updated: Agent) => void;
  onSavingChange?: (saving: boolean) => void;
}

export function AgentAdvancedTab(props: AgentAdvancedTabProps) {
  const [initial, setInitial] = useState<AgentConfigurationSnapshot | null>(null);
  const query = useQuery({
    queryKey: ["agent-configuration-yaml", props.agent.companyId, props.agent.id],
    queryFn: () => loadAgentConfiguration(props.agent.id, props.agent.companyId),
    refetchOnWindowFocus: false,
  });
  useEffect(() => {
    if (!initial && query.data && !query.isFetching) setInitial(query.data);
  }, [initial, query.data, query.isFetching]);
  if (!initial) {
    if (query.error) return <div role="alert" className="space-y-3 text-sm">
      <p>{describeError(query.error).body}</p>
      <Button variant="outline" onClick={() => query.refetch()}>{t("agentAdvanced.retry")}</Button>
    </div>;
    return <p role="status" className="text-sm text-muted-foreground">{t("agentAdvanced.loadingConfiguration")}</p>;
  }
  return <ConfigurationEditor key={props.agent.id} {...props} initial={initial} />;
}

function ConfigurationEditor({ agent, initial, onDirtyChange, onSaved, onSavingChange }: AgentAdvancedTabProps & { initial: AgentConfigurationSnapshot }) {
  const queryClient = useQueryClient();
  const { pushToast } = useToastActions();
  const [saved, setSaved] = useState(initial);
  const [source, setSource] = useState(() => editableYaml(initial));
  const [error, setError] = useState<string | null>(null);
  const [reloadRequired, setReloadRequired] = useState(false);
  const [progress, setProgress] = useState("");
  const [receipts, setReceipts] = useState<ConfigurationReceipt[]>([]);
  const operationPending = useRef(false);
  const active = useRef(true);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  const original = useMemo(() => editableYaml(saved), [saved]);
  const dirty = source !== original;
  const validation = useMemo(() => {
    try {
      const document = parseAgentConfigurationYaml(source);
      return { document, changes: planAgentConfiguration(saved, document).map(step => step.label), error: null };
    } catch (cause) { return { document: null, changes: [], error: cause instanceof Error ? cause.message : t("agentAdvanced.invalidYaml") }; }
  }, [source, saved]);
  useEffect(() => { onDirtyChange(dirty || reloadRequired); }, [dirty, reloadRequired, onDirtyChange]);
  useEffect(() => () => onDirtyChange(false), [onDirtyChange]);

  const save = useMutation({
    mutationFn: async () => {
      if (!validation.document) throw new Error(validation.error ?? t("agentAdvanced.invalidYaml"));
      if (reloadRequired) throw new Error(t("agentAdvanced.reloadBeforeSaving"));
      return saveAgentConfiguration(saved, validation.document,
        receipt => { if (active.current) setReceipts(current => [...current, receipt]); },
        label => { if (active.current) setProgress(label); });
    },
    onSuccess: configuration => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agents.detail(agent.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.agents.detail(agent.urlKey) });
      queryClient.invalidateQueries({ queryKey: queryKeys.agents.list(agent.companyId) });
      queryClient.setQueryData(["agent-configuration-yaml", agent.companyId, agent.id], configuration);
      if (!active.current) return;
      setSaved(configuration);
      setSource(editableYaml(configuration));
      setError(null);
      onDirtyChange(false);
      setReloadRequired(false);
      onSaved(configuration.agent);
      const warnings = configuration.agent.configurationWarnings;
      pushToast({ title: t("agentAdvanced.agentSaved"), tone: warnings?.length ? "warn" : "success", body: warnings?.map(warning => warning.message).join("\n") });
    },
    onSettled: () => {
      operationPending.current = false;
      queryClient.invalidateQueries({ predicate: query => query.queryKey.some(part => part === agent.id || part === agent.companyId), refetchType: "none" });
    },
    onError: cause => {
      if (!active.current) return;
      setError(cause.message);
      if (cause instanceof ConfigurationSaveInterrupted) setReloadRequired(true);
    },
  });
  const reload = useMutation({
    mutationFn: () => loadAgentConfiguration(agent.id, agent.companyId),
    onSuccess: updated => {
      queryClient.setQueryData(["agent-configuration-yaml", agent.companyId, agent.id], updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.agents.detail(agent.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.agents.detail(agent.urlKey) });
      queryClient.invalidateQueries({ queryKey: queryKeys.agents.list(agent.companyId) });
      if (active.current) { setSaved(updated); setSource(editableYaml(updated)); setError(null); setReloadRequired(false); onSaved(updated.agent); }
    },
    onSettled: () => { operationPending.current = false; },
    onError: cause => setError(cause.message),
  });
  const busy = save.isPending || reload.isPending;
  useEffect(() => { onSavingChange?.(busy); }, [busy, onSavingChange]);
  useEffect(() => () => onSavingChange?.(false), [onSavingChange]);
  return <div className="space-y-4">
    <p className="text-sm text-muted-foreground">{t("agentAdvanced.omittedSettingsHelp")}</p>
    {receipts.length > 0 && <div className="space-y-3 rounded-md border border-border p-4" aria-label={t("agentAdvanced.createdCredentials")}>
      {receipts.map((receipt, index) => <div key={`${receipt.id}-${index}`} className="space-y-2 text-sm">
        <p className="font-medium">{localizeReceiptLabel(receipt.label)}</p>
        {receipt.token ? <>
          <p className="text-muted-foreground">{t("agentAdvanced.copyKeyNow")}</p>
          <input readOnly aria-label={t("agentAdvanced.namedToken", { name: receipt.label })} value={receipt.token} className="w-full rounded-md border border-border bg-muted p-2 font-mono text-sm" />
        </> : <p className="font-mono text-muted-foreground">{receipt.id}</p>}
      </div>)}
    </div>}
    <AgentYamlEditor value={source} onChange={value => { setSource(value); if (!reloadRequired) setError(null); }} readOnly={busy} />
    {dirty && validation.changes.length > 0 && <details className="rounded-md border border-border p-3 text-sm">
      <summary className="cursor-pointer font-medium">{t(validation.changes.length === 1 ? "agentAdvanced.changeCount_one" : "agentAdvanced.changeCount_other", { count: validation.changes.length })}</summary>
      <ul className="mt-2 list-inside list-disc space-y-1">{validation.changes.map((label, index) => <li key={index}>{localizeConfigurationLabel(label)}</li>)}</ul>
      <p className="mt-2 text-muted-foreground">{t("agentAdvanced.saveOrderHelp")}</p>
    </details>}
    {(validation.error || error) && <p role="alert" className="whitespace-pre-wrap text-sm text-destructive">{validation.error || error}</p>}
    <footer className="sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t border-border bg-background py-4">
      <Button variant="ghost" disabled={busy} onClick={() => { if (!operationPending.current) { operationPending.current = true; reload.mutate(); } }}>{t("agentAdvanced.reloadSaved")}</Button>
      <div className="flex items-center gap-3">
        <span role="status" className="flex items-center gap-2 text-xs text-muted-foreground">
          {!save.isPending && !reload.isPending && dirty ? <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-(--agent-detail-dot-unsaved)" /> : null}
          {save.isPending ? t("agentAdvanced.savingProgress", { progress: localizeConfigurationLabel(progress || t("agentAdvanced.configuration")) }) : reload.isPending ? t("agentAdvanced.loadingConfiguration") : dirty ? validation.document && !validation.changes.length ? t("agentAdvanced.noConfigurationChanges") : t("agentAdvanced.unsavedChanges") : t("agentAdvanced.noUnsavedChanges")}
        </span>
        <Button disabled={!dirty || busy || reloadRequired || !validation.document || !validation.changes.length} onClick={() => { if (!operationPending.current) { operationPending.current = true; save.mutate(); } }}>{save.isPending ? t("agentAdvanced.saving") : t("agentAdvanced.saveChanges")}</Button>
      </div>
    </footer>
  </div>;
}

function AgentYamlEditor({ value, onChange, readOnly }: { value: string; onChange: (value: string) => void; readOnly: boolean }) {
  const container = useRef<HTMLDivElement>(null);
  const editor = useRef<EditorView | null>(null);
  const editability = useRef(new Compartment());
  const change = useRef(onChange);
  change.current = onChange;
  const current = useRef(value);
  current.current = value;
  useEffect(() => {
    if (!container.current) return;
    const view = new EditorView({
      parent: container.current,
      state: EditorState.create({ doc: current.current, extensions: [
        basicSetup, yaml(),
        syntaxHighlighting(yamlHighlightStyle),
        EditorView.contentAttributes.of({ "aria-label": t("agentAdvanced.yamlConfiguration"), spellcheck: "false" }),
        editability.current.of([EditorState.readOnly.of(readOnly), EditorView.editable.of(!readOnly)]),
        EditorView.updateListener.of(update => { if (update.docChanged) change.current(update.state.doc.toString()); }),
      ] }),
    });
    editor.current = view;
    return () => { view.destroy(); editor.current = null; };
  }, []);
  useEffect(() => {
    editor.current?.dispatch({ effects: editability.current.reconfigure([
      EditorState.readOnly.of(readOnly), EditorView.editable.of(!readOnly),
    ]) });
  }, [readOnly]);
  useEffect(() => {
    const view = editor.current;
    if (view && view.state.doc.toString() !== value) view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } });
  }, [value]);
  return <div ref={container} className="agent-yaml-editor overflow-hidden rounded-lg" />;
}
