// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { i18n } from "@/i18n";
import { ComposerWorktreePicker } from "./ComposerWorktreePicker";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
globalThis.ResizeObserver = class { observe() {} disconnect() {} unobserve() {} };

describe("ComposerWorktreePicker", () => {
  let container: HTMLDivElement;
  let root: Root;

  afterEach(async () => {
    act(() => root?.unmount());
    container?.remove();
    await act(async () => { await i18n.changeLanguage("en"); });
  });

  it("renders worktree loading state in Brazilian Portuguese", async () => {
    await act(async () => { await i18n.changeLanguage("pt-BR"); });
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    act(() => root.render(<ComposerWorktreePicker mode="inherit" workspaceId="" workspaces={[]} onChange={() => {}} loading error={false} onRetry={() => {}} />));
    expect(container.querySelector('[aria-label="Árvores de trabalho"]')).not.toBeNull();
    act(() => container.querySelector<HTMLButtonElement>('button[aria-label="Árvores de trabalho"]')!.click());
    expect(document.body.textContent).toContain("Carregando árvores de trabalho existentes…");
  });
});
