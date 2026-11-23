// @vitest-environment jsdom
import { act } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProviderLimitMessage } from "./ProviderLimitMessage";
import { i18n } from "@/i18n";
import { formatProviderLimitMessage } from "@/lib/provider-limit-message";

describe("live provider reset messages", () => {
  let container: HTMLDivElement;
  let root: Root;
  let visibility: DocumentVisibilityState;
  const resetAt = new Date(2099, 10, 18, 12, 17, 34, 353);
  const message = `The provider usage limit for this agent is expected to reset at ${resetAt.toISOString()}. Paperclip will start this work then.`;

  beforeEach(async () => {
    await i18n.changeLanguage("en");
    vi.useFakeTimers();
    vi.setSystemTime(new Date(resetAt.getTime() - 44 * 60_000));
    visibility = "visible";
    vi.spyOn(document, "visibilityState", "get").mockImplementation(() => visibility);
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    flushSync(() => root.unmount());
    container.remove();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("counts down without refreshing or rendering its parent again", () => {
    let parentRenders = 0;
    function Parent() {
      parentRenders += 1;
      return <ProviderLimitMessage>{message}</ProviderLimitMessage>;
    }
    flushSync(() => root.render(<Parent />));
    expect(container.textContent).toContain("in 44 minutes (Nov 18, 2099, 12:17 PM");
    flushSync(() => vi.advanceTimersByTime(60_000));
    expect(container.textContent).toContain("in 43 minutes (Nov 18, 2099, 12:17 PM");
    expect(parentRenders).toBe(1);
  });

  it("localizes known provider limit copy and relative reset time in Brazilian Portuguese", async () => {
    await act(async () => { await i18n.changeLanguage("pt-BR"); });
    try {
      flushSync(() => root.render(<ProviderLimitMessage>{message}</ProviderLimitMessage>));
      expect(container.textContent).toContain("O limite de uso do provedor para este agente deve ser redefinido em 44 minutos (");
      expect(container.textContent).toContain("O Paperclip iniciará este trabalho nesse momento.");
      expect(container.textContent).not.toContain("The provider usage limit");
    } finally {
      await act(async () => { await i18n.changeLanguage("en"); });
    }
  });

  it("localizes the recognized provider limit lifecycle messages while retaining their dates", async () => {
    await act(async () => { await i18n.changeLanguage("pt-BR"); });
    try {
      const samples = [
        `Waiting for the provider usage limit to reset at ${resetAt.toISOString()} before starting work`,
        `The provider usage limit resets at ${resetAt.toISOString()}; this wake could not schedule its retry and released the task`,
        `Waiting for the agent's provider usage limit to reset; the work starts at ${resetAt.toISOString()}.`,
        `This agent's provider usage limit has no reported reset time. Work is held; a retry can recheck availability after ${resetAt.toISOString()}; the limit may still apply then.`,
        `Waiting to recheck the provider usage limit after ${resetAt.toISOString()} before starting work`,
        `Paperclip will recheck the agent's provider usage limit at ${resetAt.toISOString()} before starting work.`,
      ];
      const localized = samples.map((sample) => formatProviderLimitMessage(
        sample,
        resetAt.getTime() - 44 * 60_000,
        "pt-BR",
        (key) => i18n.t(key),
      ));
      for (const message of localized) {
        expect(message).toContain("em 44 minutos (");
        expect(message).not.toContain("provider usage limit");
        expect(message).not.toContain("before starting work");
      }
    } finally {
      await act(async () => { await i18n.changeLanguage("en"); });
    }
  });

  it("shares one timer across messages and stops it on unmount", () => {
    flushSync(() => root.render(<><ProviderLimitMessage>{message}</ProviderLimitMessage><ProviderLimitMessage>{message}</ProviderLimitMessage></>));
    expect(vi.getTimerCount()).toBe(1);
    flushSync(() => root.render(null));
    expect(vi.getTimerCount()).toBe(0);
  });

  it("pauses in a hidden tab and immediately catches up when shown", () => {
    flushSync(() => root.render(<ProviderLimitMessage>{message}</ProviderLimitMessage>));
    flushSync(() => {
      visibility = "hidden";
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(vi.getTimerCount()).toBe(0);
    flushSync(() => vi.advanceTimersByTime(5 * 60_000));
    flushSync(() => {
      visibility = "visible";
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(container.textContent).toContain("in 39 minutes (");
    expect(vi.getTimerCount()).toBe(1);
  });

  it("updates the final seconds and stops ticking at the deadline", () => {
    vi.setSystemTime(new Date(resetAt.getTime() - 3000));
    flushSync(() => root.render(<ProviderLimitMessage>{message}</ProviderLimitMessage>));
    expect(container.textContent).toContain("in 3 seconds (");
    flushSync(() => vi.advanceTimersByTime(1000));
    expect(container.textContent).toContain("in 2 seconds (");
    flushSync(() => vi.advanceTimersByTime(2000));
    expect(container.textContent).toContain("reset now (");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("does not tick for unrelated messages, invalid timestamps, or past deadlines", () => {
    for (const text of ["Run failed", "The provider usage limit resets at an unknown time.",
      "The provider usage limit resets at 2099-99-99T99:99:99.999Z.",
      "The provider usage limit resets at 2000-01-01T00:00:00Z."]) {
      flushSync(() => root.render(<ProviderLimitMessage>{text}</ProviderLimitMessage>));
      expect(vi.getTimerCount()).toBe(0);
    }
  });
});
