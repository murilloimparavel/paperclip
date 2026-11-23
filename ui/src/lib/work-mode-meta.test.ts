import { describe, expect, it } from "vitest";

import { nextWorkMode, titleForPendingWorkMode, workModeMetaList } from "./work-mode-meta";
import { i18n } from "@/i18n";

describe("work mode metadata", () => {
  it("orders issue work modes as auto, planning, then ask", () => {
    expect(workModeMetaList().map((mode) => mode.value)).toEqual(["standard", "planning", "ask"]);
    expect(workModeMetaList().map((mode) => mode.label)).toEqual(["Auto mode", "Plan mode", "Ask mode"]);
  });

  it("cycles issue work modes as auto, planning, ask, then auto", () => {
    expect(nextWorkMode("standard")).toBe("planning");
    expect(nextWorkMode("planning")).toBe("ask");
    expect(nextWorkMode("ask")).toBe("standard");
  });

  it("uses graduated tooltip copy", () => {
    expect(titleForPendingWorkMode("standard")).toBe("Auto mode for this submission. Click to change.");
    expect(titleForPendingWorkMode("planning")).toBe("Plan mode is on for this submission. Click to change.");
  });

  it("localizes shared work mode labels and tooltips in Brazilian Portuguese", async () => {
    await i18n.changeLanguage("pt-BR");
    try {
      expect(workModeMetaList().map((mode) => mode.label)).toEqual([
        "Modo automático", "Modo de planejamento", "Modo de perguntas",
      ]);
      expect(titleForPendingWorkMode("standard")).toBe("Modo automático para este envio. Clique para alterar.");
      expect(titleForPendingWorkMode("planning")).toBe("Modo de planejamento ativado para este envio. Clique para alterar.");
      expect(titleForPendingWorkMode("ask")).toContain("sem realizar implementação");
    } finally {
      await i18n.changeLanguage("en");
    }
  });
});
