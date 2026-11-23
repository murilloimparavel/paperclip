// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { i18n } from "@/i18n";
import { TaskChatSubagentTree, type TaskChatSubagent } from "./TaskChatSubagentCard";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const subagent = (id: string, status: TaskChatSubagent["status"]): TaskChatSubagent => ({
  id, agentType: "Explore", description: `Investigar ${id}`, status, activity: [],
});

describe("TaskChatSubagentTree", () => {
  let container: HTMLDivElement;
  let root: Root;
  afterEach(async () => {
    act(() => root?.unmount());
    container?.remove();
    await act(async () => { await i18n.changeLanguage("en"); });
  });

  it("localizes subagent status, group summary, and accessible labels", async () => {
    await act(async () => { await i18n.changeLanguage("pt-BR"); });
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    act(() => root.render(<TaskChatSubagentTree subagents={[subagent("one", "failed"), subagent("two", "completed")]} />));
    expect(container.textContent).toContain("2 subagentes executados · 1 falharam");
    expect(container.querySelector('[aria-label="Subagentes"]')).not.toBeNull();
    expect(container.querySelector('[data-subagent-status="failed"] .sr-only')?.textContent).toBe("Falhou");
  });
});
