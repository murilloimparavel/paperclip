import type { AgentConfigurationWarning } from "@paperclipai/shared";
import { configurationWarningText } from "./adapter-test-copy";

export function configurationWarningMessages(
  result: { configurationWarnings?: AgentConfigurationWarning[] } | null | undefined,
): string | null {
  const warnings = result?.configurationWarnings ?? [];
  return warnings.length > 0 ? warnings.map(configurationWarningText).join("\n") : null;
}
