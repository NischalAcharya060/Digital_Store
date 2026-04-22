"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

declare global {
  interface RecaptchaRenderOptions {
    sitekey: string;
    theme?: "light" | "dark";
    callback?: (token: string) => void;
    "expired-callback"?: () => void;
    "error-callback"?: () => void;
  }

  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      render: (
        container: HTMLElement | string,
        parameters: RecaptchaRenderOptions,
      ) => number;
      reset: (widgetId?: number) => void;
    };
  }
}

let recaptchaLoader: Promise<void> | null = null;
const RECAPTCHA_SCRIPT_SOURCES = [
  "https://www.google.com/recaptcha/api.js?render=explicit",
  "https://www.recaptcha.net/recaptcha/api.js?render=explicit",
];

function loadRecaptchaScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      reject(new Error("reCAPTCHA can only run in the browser."));
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-recaptcha-src="${src}"]`,
    );
    if (existing) {
      if (window.grecaptcha?.render) {
        resolve();
        return;
      }
      existing.remove();
    }

    const script = document.createElement("script");
    let finished = false;
    const done = (onDone: () => void) => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timeoutId);
      script.onload = null;
      script.onerror = null;
      onDone();
    };

    script.src = src;
    script.async = true;
    script.defer = true;
    script.dataset.recaptcha = "signup-v2";
    script.dataset.recaptchaSrc = src;
    script.onload = () => done(resolve);
    script.onerror = () =>
      done(() => {
        script.remove();
        reject(new Error("Unable to load reCAPTCHA script."));
      });

    const timeoutId = window.setTimeout(() => {
      done(() => {
        script.remove();
        reject(new Error("reCAPTCHA script load timed out."));
      });
    }, 8000);

    document.head.appendChild(script);
  });
}

function loadRecaptcha(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("reCAPTCHA can only run in the browser."));
  }

  if (window.grecaptcha?.render) {
    return Promise.resolve();
  }

  if (recaptchaLoader) {
    return recaptchaLoader;
  }

  recaptchaLoader = (async () => {
    for (const src of RECAPTCHA_SCRIPT_SOURCES) {
      try {
        await loadRecaptchaScript(src);
        if (window.grecaptcha?.render) {
          return;
        }
      } catch {
        // try next source
      }
    }
    recaptchaLoader = null;
    throw new Error("Unable to load reCAPTCHA. Please refresh and try again.");
  })();

  return recaptchaLoader;
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18">
      <path
        fill="#4285F4"
        d="M17.64 9.2045c0-.6382-.0573-1.2518-.1636-1.8409H9v3.4818h4.8436c-.2086 1.125-.8427 2.0782-1.796 2.7164v2.2582h2.9087c1.7018-1.5668 2.6837-3.8741 2.6837-6.6155z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1791l-2.9087-2.2582c-.8059.54-1.8368.8591-3.0477.8591-2.3441 0-4.3282-1.5832-5.0364-3.7105H.9573v2.3318C2.4382 15.9859 5.4818 18 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.9636 10.7105C3.7836 10.1705 3.6818 9.5932 3.6818 9c0-.5932.1018-1.1705.2818-1.7105V4.9577H.9573C.3477 6.1718 0 7.5491 0 9s.3477 2.8282.9573 4.0423l3.0063-2.3318z"
      />
      <path
        fill="#EA4335"
        d="M9 3.5782c1.3214 0 2.5077.4541 3.4405 1.3459l2.5813-2.5814C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0141.9573 4.9577l3.0063 2.3318C4.6718 5.1614 6.6559 3.5782 9 3.5782z"
      />
    </svg>
  );
}

export function LoginForm() {
  const router = useRouter();
  const { signInEmail, signUpEmail, signInGoogle } = useAuth();
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() ?? "";
  const recaptchaConfigured = recaptchaSiteKey.length > 0;

  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);
  const recaptchaWidgetIdRef = useRef<number | null>(null);

  const resetRecaptcha = useCallback(() => {
    setRecaptchaToken("");
    if (typeof window === "undefined") {
      return;
    }

    const grecaptcha = window.grecaptcha;
    if (grecaptcha && recaptchaWidgetIdRef.current !== null) {
      grecaptcha.reset(recaptchaWidgetIdRef.current);
    }
  }, []);

  const ensureRecaptchaWidget = useCallback(async () => {
    if (!recaptchaConfigured) {
      return;
    }
    setRecaptchaError(null);

    await loadRecaptcha();
    const grecaptcha = window.grecaptcha;
    if (!grecaptcha?.ready || !grecaptcha.render || !recaptchaContainerRef.current) {
      throw new Error("reCAPTCHA is still loading. Please try again.");
    }

    await new Promise<void>((resolve) => {
      grecaptcha.ready(() => resolve());
    });

    if (recaptchaWidgetIdRef.current !== null) {
      return;
    }

    const theme =
      document.documentElement.getAttribute("data-theme") === "light"
        ? "light"
        : "dark";

    recaptchaWidgetIdRef.current = grecaptcha.render(recaptchaContainerRef.current, {
      sitekey: recaptchaSiteKey,
      theme,
      callback: (token) => {
        setRecaptchaToken(token);
      },
      "expired-callback": () => {
        setRecaptchaToken("");
      },
      "error-callback": () => {
        setRecaptchaToken("");
      },
    });
  }, [recaptchaConfigured, recaptchaSiteKey]);

  const setRecaptchaContainer = useCallback(
    (node: HTMLDivElement | null) => {
      recaptchaContainerRef.current = node;
      if (!node || !isSignup) {
        return;
      }

      void ensureRecaptchaWidget().catch((nextError) => {
        setRecaptchaError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to load reCAPTCHA. Please refresh and try again.",
        );
      });
    },
    [ensureRecaptchaWidget, isSignup],
  );

  async function handleEmailSubmit() {
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (isSignup) {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Password and confirm password do not match.");
        return;
      }
      if (!recaptchaConfigured) {
        setError("Signup is temporarily unavailable. reCAPTCHA is not configured.");
        return;
      }
      if (!recaptchaToken) {
        setError("Please complete the reCAPTCHA challenge.");
        return;
      }
    }

    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      if (isSignup) {
        await signUpEmail(email.trim(), password, recaptchaToken);
        setNotice("Account created successfully. Redirecting...");
      } else {
        await signInEmail(email.trim(), password);
      }

      router.push("/");
      router.refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Authentication failed");
      if (isSignup) {
        resetRecaptcha();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-6 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.45)] sm:p-7">
      <div className="inline-flex w-full rounded-lg border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface-2)] p-1">
        <button
          type="button"
          onClick={() => {
            setIsSignup(false);
            setError(null);
            setNotice(null);
            setRecaptchaError(null);
            setConfirmPassword("");
            resetRecaptcha();
            recaptchaWidgetIdRef.current = null;
          }}
          className={`h-9 flex-1 rounded-md text-sm font-medium transition ${
            !isSignup
              ? "bg-[color:var(--color-surface)] text-[color:var(--color-text)]"
              : "text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => {
            setIsSignup(true);
            setError(null);
            setNotice(null);
            setRecaptchaError(null);
            resetRecaptcha();
          }}
          className={`h-9 flex-1 rounded-md text-sm font-medium transition ${
            isSignup
              ? "bg-[color:var(--color-surface)] text-[color:var(--color-text)]"
              : "text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]"
          }`}
        >
          Create account
        </button>
      </div>

      <h1 className="mt-5 text-2xl font-semibold text-[color:var(--color-text)]">
        {isSignup ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
        {isSignup
          ? "Create an account to track orders and receive delivery codes instantly."
          : "Sign in to checkout, track orders, and access delivery codes instantly."}
      </p>

      <div className="mt-6 space-y-3">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={isSignup ? "new-password" : "current-password"}
        />
        {isSignup ? (
          <Input
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            hint="Use at least 6 characters."
          />
        ) : null}

        {isSignup ? (
          <div className="rounded-lg border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface-2)] p-3">
            {recaptchaConfigured ? (
              <>
                <div ref={setRecaptchaContainer} className="mt-2 flex justify-center" />
                {recaptchaError ? (
                  <p className="mt-2 text-xs text-[color:var(--color-danger)]">
                    {recaptchaError}
                  </p>
                ) : null}
                <button
                  type="button"
                  className="mt-2 text-xs text-[color:var(--color-accent)] hover:text-[color:var(--color-accent-2)]"
                  onClick={() => {
                    setRecaptchaError(null);
                    recaptchaWidgetIdRef.current = null;
                    if (recaptchaContainerRef.current) {
                      recaptchaContainerRef.current.innerHTML = "";
                    }
                    void ensureRecaptchaWidget().catch((nextError) => {
                      setRecaptchaError(
                        nextError instanceof Error
                          ? nextError.message
                          : "Unable to load reCAPTCHA. Please refresh and try again.",
                      );
                    });
                  }}
                >
                  Reload reCAPTCHA
                </button>
              </>
            ) : (
              <p className="text-xs text-[color:var(--color-danger)]">
                Signup is temporarily unavailable. reCAPTCHA is not configured.
              </p>
            )}
          </div>
        ) : null}

        {error ? (
          <p className="rounded-lg border border-[color:var(--color-danger)]/30 bg-[color:color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-3 py-2 text-sm text-[color:var(--color-danger)]">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className="rounded-lg border border-[color:var(--color-success)]/30 bg-[color:color-mix(in_srgb,var(--color-success)_10%,transparent)] px-3 py-2 text-sm text-[color:var(--color-success)]">
            {notice}
          </p>
        ) : null}

        <Button fullWidth disabled={loading} onClick={handleEmailSubmit}>
          {loading
            ? "Please wait..."
            : isSignup
              ? "Create account"
              : "Sign in"}
        </Button>

        <button
          type="button"
          disabled={loading}
          className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-[#dadce0] bg-white px-4 text-sm font-medium text-[#3c4043] transition hover:bg-[#f8f9fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={async () => {
            setLoading(true);
            setError(null);
            setNotice(null);

            try {
              await signInGoogle();
              router.push("/");
              router.refresh();
            } catch (nextError) {
              setError(nextError instanceof Error ? nextError.message : "Google login failed");
            } finally {
              setLoading(false);
            }
          }}
        >
          <GoogleIcon />
          <span>Continue with Google</span>
        </button>
      </div>
    </div>
  );
}
