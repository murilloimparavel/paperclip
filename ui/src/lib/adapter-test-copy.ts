import type { AdapterEnvironmentCheck, AgentConfigurationWarning } from "@paperclipai/shared";
import { i18n, t } from "@/i18n";

/** Translate known, stable adapter check codes. Provider diagnostics remain intact when their code is unknown. */
export function adapterEnvironmentCheckMessage(check: AdapterEnvironmentCheck): string {
  if (!i18n.language.startsWith("pt")) return check.message;
  if (check.code === "adapter_auth_missing") return t("agentConfig.testCheckMessages.authMissing");

  const providerPrefix = /^(openclaw_gateway|cursor_cloud|claude|codex|cursor|gemini|grok|hermes|kimi|opencode|pi)_/.exec(check.code)?.[1];
  const provider = providerPrefix
    ? t(`agentConfig.providerNames.${providerPrefix}`, { defaultValue: providerPrefix.replaceAll("_", " ") })
    : "";
  const code = check.code;
  if (code.endsWith("_hello_probe_auth_required")) return t("agentConfig.testCheckMessages.loginRequired", { provider });
  if (code.endsWith("_hello_probe_failed") || code.endsWith("_hello_probe_error")) return t("agentConfig.testCheckMessages.probeFailed", { provider });
  if (code.endsWith("_hello_probe_timed_out")) return t("agentConfig.testCheckMessages.probeTimedOut", { provider });
  if (code.endsWith("_hello_probe_passed") || code.endsWith("_hello_probe_ok")) return t("agentConfig.testCheckMessages.probePassed", { provider });
  if (code.endsWith("_hello_probe_skipped_custom_command")) return t("agentConfig.testCheckMessages.probeSkippedCustomCommand", { provider });
  if (code.endsWith("_command_resolvable")) return t("agentConfig.testCheckMessages.commandResolvable", { provider });
  if (code.endsWith("_command_unresolvable")) return t("agentConfig.testCheckMessages.commandUnresolvable", { provider });
  if (code.endsWith("_cwd_valid")) return t("agentConfig.testCheckMessages.cwdValid");
  if (code.endsWith("_cwd_invalid")) return t("agentConfig.testCheckMessages.cwdInvalid");
  if (code.endsWith("_environment_target")) return t("agentConfig.testCheckMessages.environmentTarget");
  if (code.endsWith("_api_key_missing") || code.endsWith("_auth_missing")) return t("agentConfig.testCheckMessages.apiKeyMissing", { provider });
  if (code.endsWith("_api_key_present") || code.endsWith("_auth_present")) return t("agentConfig.testCheckMessages.apiKeyPresent", { provider });
  if (code.endsWith("_models_discovered")) return t("agentConfig.testCheckMessages.modelsDiscovered", { provider });
  if (code.endsWith("_models_empty")) return t("agentConfig.testCheckMessages.modelsEmpty", { provider });
  if (code.endsWith("_models_discovery_failed")) return t("agentConfig.testCheckMessages.modelsDiscoveryFailed", { provider });
  if (code.endsWith("_model_required")) return t("agentConfig.testCheckMessages.modelRequired", { provider });
  if (code.endsWith("_model_configured")) return t("agentConfig.testCheckMessages.modelConfigured", { provider });
  if (code.endsWith("_model_invalid")) return t("agentConfig.testCheckMessages.modelInvalid", { provider });
  if (code.endsWith("_version_probe_passed") || code.endsWith("_version_detected")) return t("agentConfig.testCheckMessages.versionDetected", { provider });
  if (code.endsWith("_version_probe_failed")) return t("agentConfig.testCheckMessages.versionProbeFailed", { provider });
  if (code.endsWith("_version_probe_timed_out")) return t("agentConfig.testCheckMessages.versionProbeTimedOut", { provider });
  if (code.endsWith("_git_repo_check_skipped")) return t("agentConfig.testCheckMessages.gitCheckSkipped");
  return check.message;
}

export function configurationWarningText(warning: AgentConfigurationWarning): string {
  if (!i18n.language.startsWith("pt")) return warning.message;
  if (warning.code === "runner_option_ignored") {
    const field = t(`agentConfig.warningFields.${warning.field}`, { defaultValue: warning.field });
    return t("agentConfig.runnerOptionIgnored", { field, fieldId: warning.field });
  }
  return warning.message;
}
