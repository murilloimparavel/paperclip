// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { i18n } from "@/i18n";
import { TaskChatDiffView } from "./TaskChatDiffView";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("TaskChatDiffView", () => {
  let container: HTMLDivElement;
  let root: Root;

  afterEach(async () => {
    act(() => root?.unmount());
    container?.remove();
    await act(async () => { await i18n.changeLanguage("en"); });
  });

  it("localizes diff expansion and accessible change labels", async () => {
    await act(async () => { await i18n.changeLanguage("pt-BR"); });
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    const lines = Array.from({ length: 3 }, (_, index) => ({ kind: "add" as const, text: `linha ${index + 1}` }));
    act(() => root.render(<TaskChatDiffView lines={lines} previewLines={1} />));
    expect(container.querySelector(".sr-only")?.textContent).toBe("Adicionado: ");
    const button = container.querySelector<HTMLButtonElement>("button")!;
    expect(button.textContent).toBe("Mostrar mais 2 linhas");
    act(() => button.click());
    expect(container.textContent).toContain("linha 3");
  });
});
