// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TaskChatSkillCreatedCard } from "./TaskChatSkillCreatedCard";
import { i18n } from "@/i18n";

describe("TaskChatSkillCreatedCard", () => {
  afterEach(async () => { await i18n.changeLanguage("en"); });
  it("opens the persisted skill when clicked", () => {
    const onOpen = vi.fn();
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    act(() => root.render(<TaskChatSkillCreatedCard item={{ id: "skill-created:1", kind: "skill_created", skillId: "skill-1", name: "Release helper", timestamp: "2026-09-16T12:00:00Z" }} onOpen={onOpen} />));
    act(() => (container.querySelector("button") as HTMLButtonElement).click());
    expect(onOpen).toHaveBeenCalledWith("skill-1", "Release helper");
    act(() => root.unmount());
    container.remove();
  });

  it("renders the created skill label in Brazilian Portuguese", async () => {
    await i18n.changeLanguage("pt-BR");
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    act(() => root.render(<TaskChatSkillCreatedCard item={{ id: "skill-created:1", kind: "skill_created", skillId: "skill-1", name: "Release helper", timestamp: "2026-09-16T12:00:00Z" }} />));
    expect(container.querySelector("article")?.getAttribute("aria-label")).toBe("Habilidade criada: Release helper");
    expect(container.textContent).toContain("Habilidade criada");
    expect(container.textContent).toContain("Release helper");
    act(() => root.unmount());
    container.remove();
  });
});
