// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TaskChatRunnerActivityGroup, foldReadRuns, formatToolDuration } from "./TaskChatRunnerActivityGroup";
import type { TaskChatActivityPhaseItem, TaskChatToolItem } from "./task-chat-model";
import { i18n } from "@/i18n";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const tool = (id: string, fields: Partial<TaskChatToolItem>): TaskChatToolItem => ({
  id, kind: "tool", name: "Bash", rawName: "Bash", status: "completed", ...fields,
});
const read = (id: string, path: string) => tool(id, { name: "Read", rawName: "Read", operation: "read", target: path, exitCode: 0 });
const phase = (items: TaskChatActivityPhaseItem["items"]): TaskChatActivityPhaseItem => ({ id: "phase", kind: "activity_phase", items, active: false, summary: "" });

describe("tool row grammar", () => {
  let container: HTMLDivElement;
  let root: Root;
  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    void i18n.changeLanguage("en");
  });

  it("formats durations compactly", () => {
    expect([120, 1_840, 14_200, 123_000].map(formatToolDuration)).toEqual(["120ms", "1.8s", "14s", "2m 03s"]);
  });

  it("folds three or more consecutive reads and leaves shorter runs alone", () => {
    const rows = foldReadRuns([read("a", "a.ts"), read("b", "b.ts"), read("c", "c.ts"), tool("x", { target: "ls" }), read("d", "d.ts")]);
    expect(rows.map((row) => row.kind)).toEqual(["reads", "single", "single"]);
  });

  it("keeps failure and stop markers and folds only file reads", () => {
    expect(foldReadRuns([
      tool("s1", { name: "Skill", rawName: "Skill", target: "pdf" }),
      tool("s2", { name: "Skill", rawName: "Skill", target: "xlsx" }),
      tool("s3", { name: "Skill", rawName: "Skill", target: "docx" }),
    ]).map((row) => row.kind)).toEqual(["single", "single", "single"]);
    act(() => root.render(
      <TaskChatRunnerActivityGroup
        defaultExpanded
        item={phase([
          tool("f1", { name: "Read", rawName: "Read", target: "src/missing.ts", status: "failed" }),
          tool("f2", { operation: "execute", target: "sleep 100", status: "interrupted" }),
        ])}
      />,
    ));
    expect(container.querySelector('[data-activity-row="f1"]')?.textContent).toContain("Read · failed");
    expect(container.querySelector('[data-activity-row="f2"]')?.textContent).toContain("· stopped");
  });

  it("shows the command with its exit code and duration, hides exit 0 on reads, and explains a refusal", () => {
    act(() => root.render(
      <TaskChatRunnerActivityGroup
        defaultExpanded
        item={phase([
          read("r1", "src/a.ts"), read("r2", "src/b.ts"), read("r3", "src/c.ts"), read("r4", "src/d.ts"),
          tool("t1", { operation: "execute", target: "node --test", status: "failed", exitCode: 1, durationMs: 1_840 }),
          tool("t2", { operation: "execute", target: "rm -rf build", status: "failed", blockedReason: "Denied by rule" }),
        ])}
      />,
    ));
    const readRun = container.querySelector("[data-activity-read-run]");
    expect(readRun?.textContent).toContain("Read 4 files");
    expect(readRun?.textContent).toContain("a.ts, b.ts, c.ts +1");
    expect(readRun?.querySelector("[data-tool-exit-code]")).toBeNull();
    const command = container.querySelector('[data-activity-row="t1"]');
    expect(command?.textContent).toContain("$ node --test");
    expect(command?.querySelector("[data-tool-exit-code]")?.textContent).toBe("exit 1");
    expect(command?.querySelector("[data-tool-duration]")?.textContent).toBe("1.8s");
    const blocked = container.querySelector('[data-activity-row="t2"]');
    expect(blocked?.textContent).toContain("Blocked");
    expect(blocked?.querySelector("[data-tool-blocked-reason]")?.textContent).toBe("Denied by rule");
  });

  it("localizes grouped file reads and their accessible history label", async () => {
    await act(async () => { await i18n.changeLanguage("pt-BR"); });
    act(() => root.render(<TaskChatRunnerActivityGroup defaultExpanded item={phase([
      read("pt-1", "src/a.ts"), read("pt-2", "src/b.ts"), read("pt-3", "src/c.ts"),
    ])} />));
    expect(container.querySelector("[data-activity-read-run]")?.textContent).toContain("Leu 3 arquivos");
    act(() => container.querySelector<HTMLButtonElement>('[data-activity-read-run] button')!.click());
    expect(container.querySelector('[aria-label="Arquivos lidos"]')).not.toBeNull();
  });

  it("localizes fixed labels for blocked, thinking, and token usage rows", async () => {
    await act(async () => { await i18n.changeLanguage("pt-BR"); });
    act(() => root.render(<TaskChatRunnerActivityGroup defaultExpanded item={{ ...phase([
      tool("blocked-pt", { blockedReason: "Policy denied" }),
      { id: "usage-pt", kind: "usage", usage: { used: 12, size: 100 } },
      { id: "thinking-pt", kind: "thinking", lines: ["Raciocínio do agente"], streaming: true },
    ]), active: true }} />));
    expect(container.textContent).toContain("Bloqueado");
    expect(container.textContent).toContain("Pensando");
    expect(container.textContent).toContain("Uso de tokens");
    expect(container.textContent).toContain("Policy denied");
  });
});
