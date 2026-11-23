import { afterEach, describe, expect, it } from "vitest";
import type { AdapterEnvironmentCheck, AgentConfigurationWarning } from "@paperclipai/shared";
import { i18n } from "@/i18n";
import { adapterEnvironmentCheckMessage, configurationWarningText } from "./adapter-test-copy";

describe("adapter test copy localization", () => {
  afterEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("localizes stable check codes and retains provider names", async () => {
    await i18n.changeLanguage("pt-BR");
    const check: AdapterEnvironmentCheck = {
      code: "claude_hello_probe_auth_required",
      level: "warn",
      message: "Claude CLI is installed, but login is required.",
    };
    expect(adapterEnvironmentCheckMessage(check)).toBe("O Claude CLI precisa de autenticação. Entre na conta para continuar.");
  });

  it("preserves free-form provider diagnostics for check codes it does not know", async () => {
    await i18n.changeLanguage("pt-BR");
    const check: AdapterEnvironmentCheck = {
      code: "provider_future_diagnostic",
      level: "error",
      message: "Provider returned a diagnostic with a model-specific detail.",
    };
    expect(adapterEnvironmentCheckMessage(check)).toBe(check.message);
  });

  it("localizes configuration warnings while preserving the field identifier", async () => {
    await i18n.changeLanguage("pt-BR");
    const warning: AgentConfigurationWarning = {
      code: "runner_option_ignored",
      field: "maxTurnsPerRun",
      message: "Max turns per run (maxTurnsPerRun) is not supported by Paperclip Runner and is ignored. The agent can still run.",
    };
    expect(configurationWarningText(warning)).toBe("A opção Máximo de turnos por execução (maxTurnsPerRun) não tem suporte no Paperclip Runner e será ignorada. O agente ainda poderá executar.");
  });
});
