import type { AdapterEnvironmentCheck, AgentConfigurationWarning } from "@paperclipai/shared";
import { i18n, t } from "@/i18n";

/** Translate known, stable adapter check codes. Provider diagnostics remain intact when their code is unknown. */
export function adapterEnvironmentCheckMessage(check: AdapterEnvironmentCheck): string {
  if (!i18n.language.startsWith("pt")) return check.message;
  if (check.code === "adapter_auth_missing") return t("agentConfig.testCheckMessages.authMissing");
  if (check.code === "adapter_engine_unavailable") return t("agentConfig.testCheckMessages.engineUnavailable");
  if (check.code === "acpx_runtime_package_missing") return t("agentConfig.testCheckMessages.runtimePackageMissing");

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
  if (code.endsWith("_hello_probe_skipped_unresolved_command") || code.endsWith("_hello_probe_skipped_cli_version")) return t("agentConfig.testCheckMessages.probeSkipped", { provider });
  if (code.endsWith("_hello_probe_transient_upstream")) return t("agentConfig.testCheckMessages.probeUpstreamUnavailable", { provider });
  if (code.endsWith("_hello_probe_usage_limited") || code.endsWith("_hello_probe_quota_exhausted")) return t("agentConfig.testCheckMessages.usageLimited", { provider });
  if (code.endsWith("_hello_probe_unexpected_output")) return t("agentConfig.testCheckMessages.unexpectedOutput", { provider });
  if (code.endsWith("_hello_probe_model_unavailable")) return t("agentConfig.testCheckMessages.modelUnavailable", { provider });
  if (code.endsWith("_models_probe_passed")) return t("agentConfig.testCheckMessages.modelsProbePassed", { provider });
  if (code.endsWith("_models_probe_timed_out")) return t("agentConfig.testCheckMessages.modelsProbeTimedOut", { provider });
  if (code.endsWith("_model_probe_failed")) return t("agentConfig.testCheckMessages.modelProbeFailed", { provider });
  if (code.endsWith("_probe_challenge_only")) return t("agentConfig.testCheckMessages.probeChallengeOnly", { provider });
  if (code.endsWith("_probe_ok")) return t("agentConfig.testCheckMessages.probePassed", { provider });
  if (code.endsWith("_probe_failed") || code.endsWith("_probe_error")) return t("agentConfig.testCheckMessages.probeFailed", { provider });
  if (code.endsWith("_model_not_found")) return t("agentConfig.testCheckMessages.modelNotFound", { provider });
  if (code.endsWith("_model_validation_skipped_remote")) return t("agentConfig.testCheckMessages.modelValidationSkippedRemote", { provider });
  if (code.endsWith("_model_validation_via_probe")) return t("agentConfig.testCheckMessages.modelValidationViaProbe", { provider });
  if (code.endsWith("_api_key_in_config") || code.endsWith("_api_keys_found")) return t("agentConfig.testCheckMessages.apiKeyConfigured", { provider });
  if (code.endsWith("_no_api_keys")) return t("agentConfig.testCheckMessages.apiKeyMissing", { provider });
  if (code.endsWith("_auth_detected") || code.endsWith("_auth_ok")) return t("agentConfig.testCheckMessages.authDetected", { provider });
  if (code.endsWith("_auth_failed")) return t("agentConfig.testCheckMessages.authFailed", { provider });
  if (code.endsWith("_managed_provider_configured")) return t("agentConfig.testCheckMessages.managedProviderConfigured", { provider });
  if (code.endsWith("_oauth_token_configured")) return t("agentConfig.testCheckMessages.oauthTokenConfigured", { provider });
  if (code.endsWith("_bedrock_auth")) return t("agentConfig.testCheckMessages.bedrockAuth");
  if (code.endsWith("_subscription_mode_possible")) return t("agentConfig.testCheckMessages.subscriptionModePossible");
  if (code.endsWith("_anthropic_api_key_overrides_subscription")) return t("agentConfig.testCheckMessages.apiKeyOverridesSubscription");
  if (code.endsWith("_effort_flag_unsupported")) return t("agentConfig.testCheckMessages.effortFlagUnsupported", { provider });
  if (code.endsWith("_cli_version_incompatible") || code.endsWith("_cli_version_probe_mismatch") || code.endsWith("_cli_version_mismatch")) return t("agentConfig.testCheckMessages.cliVersionIncompatible", { provider });
  if (code.endsWith("_fast_mode_unsupported_model")) return t("agentConfig.testCheckMessages.fastModeUnsupported");
  if (code.endsWith("_repo_present")) return t("agentConfig.testCheckMessages.repositoryPresent", { provider });
  if (code.endsWith("_repo_missing")) return t("agentConfig.testCheckMessages.repositoryMissing", { provider });
  if (code.endsWith("_repo_invalid")) return t("agentConfig.testCheckMessages.repositoryInvalid", { provider });
  if (code.endsWith("_url_valid")) return t("agentConfig.testCheckMessages.urlValid", { provider });
  if (code.endsWith("_url_missing")) return t("agentConfig.testCheckMessages.urlMissing", { provider });
  if (code.endsWith("_url_invalid") || code.endsWith("_url_protocol_invalid")) return t("agentConfig.testCheckMessages.urlInvalid", { provider });
  if (code.endsWith("_base_url_missing")) return t("agentConfig.testCheckMessages.baseUrlMissing", { provider });
  if (code.endsWith("_base_url_invalid")) return t("agentConfig.testCheckMessages.baseUrlInvalid", { provider });
  if (code.endsWith("_dashboard_root_mapped")) return t("agentConfig.testCheckMessages.dashboardRootMapped");
  if (code.endsWith("_health_unreachable")) return t("agentConfig.testCheckMessages.healthUnreachable", { provider });
  if (code.endsWith("_loopback_http_allowed")) return t("agentConfig.testCheckMessages.loopbackHttpAllowed");
  if (code.endsWith("_plain_http_remote_denied")) return t("agentConfig.testCheckMessages.plainHttpRemoteDenied");
  if (code.endsWith("_plain_http_remote_unsafe_allowed")) return t("agentConfig.testCheckMessages.plainHttpRemoteUnsafeAllowed");
  if (code.endsWith("_plaintext_remote_ws")) return t("agentConfig.testCheckMessages.plaintextRemoteWebSocket");
  if (code.endsWith("_provider_detected")) return t("agentConfig.testCheckMessages.providerDetected", { provider });
  if (code.endsWith("_provider_mismatch")) return t("agentConfig.testCheckMessages.providerMismatch", { provider });
  if (code.endsWith("_provider_runtime_config")) return t("agentConfig.testCheckMessages.providerRuntimeConfig", { provider });
  if (code.endsWith("_provider_unknown")) return t("agentConfig.testCheckMessages.providerUnknown");
  if (code.endsWith("_provider_unsupported")) return t("agentConfig.testCheckMessages.providerUnsupported", { provider });
  if (code.endsWith("_configured_default_model")) return t("agentConfig.testCheckMessages.defaultModelConfigured", { provider });
  if (code.endsWith("_custom_provider_config")) return t("agentConfig.testCheckMessages.customProviderConfigured", { provider });
  if (code.endsWith("_python_missing")) return t("agentConfig.testCheckMessages.pythonMissing", { provider });
  if (code.endsWith("_python_old")) return t("agentConfig.testCheckMessages.pythonOutdated", { provider });
  if (code.endsWith("_cli_not_found")) return t("agentConfig.testCheckMessages.cliMissing", { provider });
  if (code.endsWith("_remote_probe_unsupported")) return t("agentConfig.testCheckMessages.remoteProbeUnsupported", { provider });
  if (code.endsWith("_command_skipped")) return t("agentConfig.testCheckMessages.commandSkipped", { provider });
  if (code.endsWith("_environment_unprepared")) return t("agentConfig.testCheckMessages.environmentUnprepared", { provider });
  if (code.endsWith("_headless_permissions_enabled")) return t("agentConfig.testCheckMessages.headlessPermissionsEnabled", { provider });
  if (code.endsWith("_probe_cleanup_incomplete")) return t("agentConfig.testCheckMessages.probeCleanupIncomplete", { provider });
  if (code.endsWith("_package_install_failed")) return t("agentConfig.testCheckMessages.packageInstallFailed", { provider });
  if (code.endsWith("_version_failed")) return t("agentConfig.testCheckMessages.versionProbeFailed", { provider });
  if (code.endsWith("_version_unknown")) return t("agentConfig.testCheckMessages.versionUnknown", { provider });
  if (code === "hermes_version") return t("agentConfig.testCheckMessages.versionDetected", { provider });
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
