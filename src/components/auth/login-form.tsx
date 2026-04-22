"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

// ─── reCAPTCHA types ───────────────────────────────────────────────────────────
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
      render: (container: HTMLElement | string, parameters: RecaptchaRenderOptions) => number;
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
      reject(new Error("reCAPTCHA can only run in the browser.")); return;
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[data-recaptcha-src="${src}"]`);
    if (existing) { if (window.grecaptcha?.render) { resolve(); return; } existing.remove(); }
    const script = document.createElement("script");
    let finished = false;
    const done = (onDone: () => void) => {
      if (finished) return; finished = true;
      window.clearTimeout(timeoutId); script.onload = null; script.onerror = null; onDone();
    };
    script.src = src; script.async = true; script.defer = true;
    script.dataset.recaptcha = "signup-v2"; script.dataset.recaptchaSrc = src;
    script.onload = () => done(resolve);
    script.onerror = () => done(() => { script.remove(); reject(new Error("Unable to load reCAPTCHA script.")); });
    const timeoutId = window.setTimeout(() => {
      done(() => { script.remove(); reject(new Error("reCAPTCHA script load timed out.")); });
    }, 8000);
    document.head.appendChild(script);
  });
}

function loadRecaptcha(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("reCAPTCHA can only run in the browser."));
  if (window.grecaptcha?.render) return Promise.resolve();
  if (recaptchaLoader) return recaptchaLoader;
  recaptchaLoader = (async () => {
    for (const src of RECAPTCHA_SCRIPT_SOURCES) {
      try { await loadRecaptchaScript(src); if (window.grecaptcha?.render) return; } catch {}
    }
    recaptchaLoader = null;
    throw new Error("Unable to load reCAPTCHA. Please refresh and try again.");
  })();
  return recaptchaLoader;
}

// ─── Icons (inline SVG, no extra deps) ────────────────────────────────────────
function IconMail() {
  return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
  );
}
function IconLock() {
  return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
  );
}
function IconEye({ off }: { off?: boolean }) {
  return off ? (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" />
      </svg>
  ) : (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
      </svg>
  );
}
function IconCheck() {
  return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
  );
}
function IconAlert() {
  return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
      </svg>
  );
}
function IconShield() {
  return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
      </svg>
  );
}
function IconArrow() {
  return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" x2="19" y1="12" y2="12" /><polyline points="12 5 19 12 12 19" />
      </svg>
  );
}
function IconSpinner() {
  return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
  );
}
function GoogleIcon() {
  return (
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18">
        <path fill="#4285F4" d="M17.64 9.2045c0-.6382-.0573-1.2518-.1636-1.8409H9v3.4818h4.8436c-.2086 1.125-.8427 2.0782-1.796 2.7164v2.2582h2.9087c1.7018-1.5668 2.6837-3.8741 2.6837-6.6155z"/>
        <path fill="#34A853" d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1791l-2.9087-2.2582c-.8059.54-1.8368.8591-3.0477.8591-2.3441 0-4.3282-1.5832-5.0364-3.7105H.9573v2.3318C2.4382 15.9859 5.4818 18 9 18z"/>
        <path fill="#FBBC05" d="M3.9636 10.7105C3.7836 10.1705 3.6818 9.5932 3.6818 9c0-.5932.1018-1.1705.2818-1.7105V4.9577H.9573C.3477 6.1718 0 7.5491 0 9s.3477 2.8282.9573 4.0423l3.0063-2.3318z"/>
        <path fill="#EA4335" d="M9 3.5782c1.3214 0 2.5077.4541 3.4405 1.3459l2.5813-2.5814C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0141.9573 4.9577l3.0063 2.3318C4.6718 5.1614 6.6559 3.5782 9 3.5782z"/>
      </svg>
  );
}

// ─── Password strength ─────────────────────────────────────────────────────────
function getStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "" };
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { score: s, label: "Weak", color: "#ef4444" };
  if (s <= 2) return { score: s, label: "Fair", color: "#f97316" };
  if (s <= 3) return { score: s, label: "Good", color: "#eab308" };
  return { score: s, label: "Strong", color: "#22c55e" };
}

// ─── FloatField ────────────────────────────────────────────────────────────────
interface FloatFieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  icon: React.ReactNode;
  suffix?: React.ReactNode;
  hasError?: boolean;
}

function FloatField({ id, label, type, value, onChange, autoComplete, icon, suffix, hasError }: FloatFieldProps) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;

  return (
      <div
          className="lf-field"
          data-focused={focused ? "true" : undefined}
          data-error={hasError ? "true" : undefined}
      >
        <span className="lf-field-icon">{icon}</span>
        <div className="lf-field-inner">
          <label htmlFor={id} className={`lf-label${floated ? " lf-label--up" : ""}`}>{label}</label>
          <input
              id={id}
              type={type}
              value={value}
              autoComplete={autoComplete}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="lf-input"
          />
        </div>
        {suffix && <div className="lf-field-suffix">{suffix}</div>}
      </div>
  );
}

// ─── LoginForm ─────────────────────────────────────────────────────────────────
export function LoginForm() {
  const router = useRouter();
  const { signInEmail, signUpEmail, signInGoogle } = useAuth();
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() ?? "";
  const recaptchaConfigured = recaptchaSiteKey.length > 0;

  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);
  const recaptchaWidgetIdRef = useRef<number | null>(null);

  const strength = isSignup ? getStrength(password) : { score: 0, label: "", color: "" };
  const pwMatch = password && confirmPassword && password === confirmPassword;
  const pwMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const resetRecaptcha = useCallback(() => {
    setRecaptchaToken("");
    if (typeof window === "undefined") return;
    const g = window.grecaptcha;
    if (g && recaptchaWidgetIdRef.current !== null) g.reset(recaptchaWidgetIdRef.current);
  }, []);

  const ensureRecaptchaWidget = useCallback(async () => {
    if (!recaptchaConfigured) return;
    setRecaptchaError(null);
    await loadRecaptcha();
    const g = window.grecaptcha;
    if (!g?.ready || !g.render || !recaptchaContainerRef.current) throw new Error("reCAPTCHA is still loading.");
    await new Promise<void>((res) => g.ready(() => res()));
    if (recaptchaWidgetIdRef.current !== null) return;
    const theme = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    recaptchaWidgetIdRef.current = g.render(recaptchaContainerRef.current, {
      sitekey: recaptchaSiteKey, theme,
      callback: (t) => setRecaptchaToken(t),
      "expired-callback": () => setRecaptchaToken(""),
      "error-callback": () => setRecaptchaToken(""),
    });
  }, [recaptchaConfigured, recaptchaSiteKey]);

  const setRecaptchaContainer = useCallback((node: HTMLDivElement | null) => {
    recaptchaContainerRef.current = node;
    if (!node || !isSignup) return;
    void ensureRecaptchaWidget().catch((err) =>
        setRecaptchaError(err instanceof Error ? err.message : "Unable to load reCAPTCHA.")
    );
  }, [ensureRecaptchaWidget, isSignup]);

  function switchTab(signup: boolean) {
    setIsSignup(signup); setError(null); setNotice(null); setRecaptchaError(null);
    setConfirmPassword(""); resetRecaptcha(); recaptchaWidgetIdRef.current = null;
  }

  async function handleSubmit() {
    if (!email.trim() || !password) { setError("Please enter your email and password."); return; }
    if (isSignup) {
      if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
      if (password !== confirmPassword) { setError("Passwords do not match."); return; }
      if (!recaptchaConfigured) { setError("Signup temporarily unavailable. reCAPTCHA is not configured."); return; }
      if (!recaptchaToken) { setError("Please complete the reCAPTCHA challenge."); return; }
    }
    setLoading(true); setError(null); setNotice(null);
    try {
      if (isSignup) {
        await signUpEmail(email.trim(), password, recaptchaToken);
        setNotice("Account created! Redirecting…");
      } else {
        await signInEmail(email.trim(), password);
      }
      router.push("/"); router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
      if (isSignup) resetRecaptcha();
    } finally { setLoading(false); }
  }

  return (
      <>
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;400;500;600;700;800&family=Geist:wght@300;400;500;600&display=swap');

        /* ── Scoped variables that EXTEND your existing CSS var system ── */
        .lf-root {
          /* fonts */
          --lf-font-display: 'Bricolage Grotesque', sans-serif;
          --lf-font-body: 'Geist', sans-serif;

          /* map to your existing vars */
          --lf-bg:        var(--color-surface);
          --lf-bg2:       var(--color-surface-2);
          --lf-border:    var(--color-surface-border);
          --lf-text:      var(--color-text);
          --lf-muted:     var(--color-text-muted);
          --lf-accent:    var(--color-accent);
          --lf-accent2:   var(--color-accent-2);
          --lf-danger:    var(--color-danger, #ef4444);
          --lf-success:   var(--color-success, #22c55e);

          /* derived */
          --lf-accent-glow: color-mix(in srgb, var(--lf-accent) 20%, transparent);
          --lf-danger-glow: color-mix(in srgb, var(--lf-danger) 12%, transparent);

          font-family: var(--lf-font-body);
        }

        /* ── Card ── */
        .lf-card {
          width: 100%;
          max-width: 420px;
          background: var(--lf-bg);
          border: 1px solid var(--lf-border);
          border-radius: 24px;
          padding: 28px 28px 24px;
          box-shadow:
            0 2px 0 0 color-mix(in srgb, var(--lf-accent) 8%, transparent),
            0 20px 60px -10px color-mix(in srgb, #000 35%, transparent);
          position: relative;
          overflow: hidden;
        }
        .lf-card::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 24px;
          background: radial-gradient(ellipse 280px 200px at 110% -10%, color-mix(in srgb, var(--lf-accent) 14%, transparent), transparent 70%);
          pointer-events: none;
        }

        /* ── Tab bar ── */
        .lf-tabs {
          display: flex;
          background: var(--lf-bg2);
          border: 1px solid var(--lf-border);
          border-radius: 14px;
          padding: 3px;
          gap: 3px;
        }
        .lf-tab {
          flex: 1; height: 36px; border: none; cursor: pointer;
          border-radius: 11px; background: transparent;
          font-family: var(--lf-font-display); font-size: 0.8125rem; font-weight: 600;
          color: var(--lf-muted); transition: all 0.2s;
        }
        .lf-tab:hover:not(.lf-tab--active) { color: var(--lf-text); }
        .lf-tab--active {
          background: var(--lf-bg);
          color: var(--lf-text);
          box-shadow: 0 1px 6px color-mix(in srgb, #000 20%, transparent);
        }

        /* ── Heading block ── */
        .lf-heading {
          font-family: var(--lf-font-display);
          font-size: 1.4375rem; font-weight: 800;
          color: var(--lf-text); letter-spacing: -0.025em;
          margin: 20px 0 4px; line-height: 1.2;
        }
        .lf-sub {
          font-size: 0.8125rem; color: var(--lf-muted); line-height: 1.55;
          margin-bottom: 22px;
        }

        /* ── Fields stack ── */
        .lf-fields { display: flex; flex-direction: column; gap: 13px; }

        /* ── Float field ── */
        .lf-field {
          display: flex; align-items: center;
          background: var(--lf-bg2);
          border: 1.5px solid var(--lf-border);
          border-radius: 14px;
          transition: border-color 0.18s, box-shadow 0.18s;
          overflow: hidden;
        }
        .lf-field[data-focused] {
          border-color: var(--lf-accent);
          box-shadow: 0 0 0 3px var(--lf-accent-glow);
        }
        .lf-field[data-error] {
          border-color: var(--lf-danger);
          box-shadow: 0 0 0 3px var(--lf-danger-glow);
        }
        .lf-field-icon {
          padding: 0 10px 0 14px; color: var(--lf-muted); flex-shrink: 0;
          display: flex; align-items: center;
          transition: color 0.18s;
        }
        .lf-field[data-focused] .lf-field-icon { color: var(--lf-accent); }
        .lf-field[data-error] .lf-field-icon { color: var(--lf-danger); }

        .lf-field-inner { position: relative; flex: 1; padding: 14px 4px 6px 0; min-width: 0; }

        .lf-label {
          position: absolute; left: 0; pointer-events: none; select: none;
          font-size: 0.875rem; font-weight: 500; color: var(--lf-muted);
          top: 50%; transform: translateY(-50%);
          transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
        }
        .lf-label--up {
          font-size: 0.65rem; top: 6px; transform: none; font-weight: 600;
          letter-spacing: 0.02em; text-transform: uppercase;
        }
        .lf-field[data-focused] .lf-label--up { color: var(--lf-accent); }
        .lf-field[data-error] .lf-label--up { color: var(--lf-danger); }

        .lf-input {
          display: block; width: 100%; background: transparent; border: none;
          outline: none; font-family: var(--lf-font-body); font-size: 0.9rem;
          color: var(--lf-text); padding-top: 8px; padding-bottom: 0;
          caret-color: var(--lf-accent);
        }

        .lf-field-suffix {
          padding: 0 12px 0 4px; display: flex; align-items: center; flex-shrink: 0;
        }
        .lf-eye {
          background: none; border: none; cursor: pointer; padding: 4px;
          color: var(--lf-muted); border-radius: 6px; display: flex; align-items: center;
          transition: color 0.15s, background 0.15s;
        }
        .lf-eye:hover { color: var(--lf-text); background: color-mix(in srgb, var(--lf-muted) 12%, transparent); }

        /* ── Strength bar ── */
        .lf-strength { display: flex; align-items: center; gap: 4px; margin-top: 8px; }
        .lf-strength-seg {
          flex: 1; height: 3px; border-radius: 99px;
          background: var(--lf-border); transition: background 0.3s;
        }
        .lf-strength-lbl {
          font-size: 0.7rem; font-weight: 700; flex-shrink: 0;
          min-width: 38px; text-align: right; letter-spacing: 0.01em;
        }

        /* ── Match hint ── */
        .lf-match {
          display: flex; align-items: center; gap: 5px;
          font-size: 0.74rem; font-weight: 500;
          margin-top: 5px; margin-left: 2px;
        }

        /* ── Alerts ── */
        .lf-alert {
          display: flex; align-items: flex-start; gap: 9px;
          border-radius: 12px; padding: 11px 13px; font-size: 0.8125rem; line-height: 1.45;
        }
        .lf-alert-icon { flex-shrink: 0; margin-top: 1px; }
        .lf-alert--error {
          background: color-mix(in srgb, var(--lf-danger) 10%, transparent);
          border: 1px solid color-mix(in srgb, var(--lf-danger) 28%, transparent);
          color: var(--lf-danger);
        }
        .lf-alert--success {
          background: color-mix(in srgb, var(--lf-success) 10%, transparent);
          border: 1px solid color-mix(in srgb, var(--lf-success) 28%, transparent);
          color: var(--lf-success);
        }

        /* ── Primary button ── */
        .lf-btn-primary {
          width: 100%; height: 48px; border: none; border-radius: 14px; cursor: pointer;
          background: linear-gradient(135deg, var(--lf-accent), var(--lf-accent2));
          color: #fff; font-family: var(--lf-font-display);
          font-size: 0.9375rem; font-weight: 700; letter-spacing: -0.01em;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.2s;
          box-shadow: 0 4px 20px color-mix(in srgb, var(--lf-accent) 38%, transparent);
        }
        .lf-btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 28px color-mix(in srgb, var(--lf-accent) 48%, transparent);
          filter: brightness(1.05);
        }
        .lf-btn-primary:active:not(:disabled) { transform: translateY(0); filter: brightness(0.97); }
        .lf-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }
        .lf-spinner { animation: lf-spin 0.7s linear infinite; }
        @keyframes lf-spin { to { transform: rotate(360deg); } }

        /* ── Divider ── */
        .lf-divider { display: flex; align-items: center; gap: 10px; }
        .lf-divider-line { flex: 1; height: 1px; background: var(--lf-border); }
        .lf-divider-txt { font-size: 0.72rem; color: var(--lf-muted); font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; }

        /* ── Google button ── */
        .lf-btn-google {
          width: 100%; height: 48px; border-radius: 14px;
          border: 1.5px solid var(--lf-border);
          background: var(--lf-bg2); color: var(--lf-text);
          font-family: var(--lf-font-body); font-size: 0.875rem; font-weight: 500;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          cursor: pointer; transition: all 0.18s;
        }
        .lf-btn-google:hover:not(:disabled) {
          background: var(--lf-bg);
          border-color: color-mix(in srgb, var(--lf-muted) 60%, transparent);
          box-shadow: 0 2px 10px color-mix(in srgb, #000 12%, transparent);
        }
        .lf-btn-google:disabled { opacity: 0.55; cursor: not-allowed; }

        /* ── reCAPTCHA wrapper ── */
        .lf-recaptcha {
          background: var(--lf-bg2); border: 1px solid var(--lf-border);
          border-radius: 14px; padding: 12px;
        }
        .lf-recaptcha-reload {
          background: none; border: none; cursor: pointer; font-size: 0.74rem;
          color: var(--lf-accent); margin-top: 8px; padding: 0;
          font-family: var(--lf-font-body); text-decoration: underline;
          text-underline-offset: 2px; transition: opacity 0.15s;
        }
        .lf-recaptcha-reload:hover { opacity: 0.7; }

        /* ── Trust badge ── */
        .lf-trust {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          margin-top: 16px; font-size: 0.72rem; color: var(--lf-muted);
        }
        .lf-trust-icon { color: var(--lf-success); }
      `}</style>

        <div className="lf-root">
          <div className="lf-card">
            {/* Tabs */}
            <div className="lf-tabs" role="tablist">
              <button role="tab" aria-selected={!isSignup} className={`lf-tab${!isSignup ? " lf-tab--active" : ""}`} onClick={() => switchTab(false)}>
                Sign in
              </button>
              <button role="tab" aria-selected={isSignup} className={`lf-tab${isSignup ? " lf-tab--active" : ""}`} onClick={() => switchTab(true)}>
                Create account
              </button>
            </div>

            {/* Heading */}
            <h1 className="lf-heading">{isSignup ? "Create your account" : "Welcome back"}</h1>
            <p className="lf-sub">
              {isSignup
                  ? "Join to track orders and receive delivery codes instantly."
                  : "Sign in to checkout, track orders, and access delivery codes."}
            </p>

            {/* Fields */}
            <div className="lf-fields">
              <FloatField id="lf-email" label="Email address" type="email" value={email} onChange={setEmail} autoComplete="email" icon={<IconMail />} />

              {/* Password + strength */}
              <div>
                <FloatField
                    id="lf-password" label="Password"
                    type={showPw ? "text" : "password"}
                    value={password} onChange={setPassword}
                    autoComplete={isSignup ? "new-password" : "current-password"}
                    icon={<IconLock />}
                    suffix={
                      <button type="button" className="lf-eye" onClick={() => setShowPw(p => !p)} tabIndex={-1} aria-label={showPw ? "Hide password" : "Show password"}>
                        <IconEye off={showPw} />
                      </button>
                    }
                />
                {isSignup && password.length > 0 && (
                    <div className="lf-strength">
                      {[1,2,3,4].map(i => (
                          <div key={i} className="lf-strength-seg" style={{ background: i <= strength.score ? strength.color : undefined }} />
                      ))}
                      <span className="lf-strength-lbl" style={{ color: strength.color }}>{strength.label}</span>
                    </div>
                )}
              </div>

              {/* Confirm password */}
              {isSignup && (
                  <div>
                    <FloatField
                        id="lf-confirm-password" label="Confirm password"
                        type={showConfirmPw ? "text" : "password"}
                        value={confirmPassword} onChange={setConfirmPassword}
                        autoComplete="new-password" hasError={pwMismatch}
                        icon={<IconLock />}
                        suffix={
                          <button type="button" className="lf-eye" onClick={() => setShowConfirmPw(p => !p)} tabIndex={-1} aria-label={showConfirmPw ? "Hide password" : "Show password"}>
                            <IconEye off={showConfirmPw} />
                          </button>
                        }
                    />
                    {confirmPassword.length > 0 && (
                        <div className="lf-match" style={{ color: pwMatch ? "#22c55e" : "#ef4444" }}>
                          {pwMatch ? <><IconCheck /> Passwords match</> : <><IconAlert /> Passwords don't match</>}
                        </div>
                    )}
                  </div>
              )}

              {/* reCAPTCHA */}
              {isSignup && (
                  <div className="lf-recaptcha">
                    {recaptchaConfigured ? (
                        <>
                          <div ref={setRecaptchaContainer} style={{ display: "flex", justifyContent: "center" }} />
                          {recaptchaError && <p style={{ marginTop: 8, fontSize: "0.75rem", color: "var(--lf-danger)" }}>{recaptchaError}</p>}
                          <button type="button" className="lf-recaptcha-reload" onClick={() => {
                            setRecaptchaError(null); recaptchaWidgetIdRef.current = null;
                            if (recaptchaContainerRef.current) recaptchaContainerRef.current.innerHTML = "";
                            void ensureRecaptchaWidget().catch((e) => setRecaptchaError(e instanceof Error ? e.message : "Unable to load reCAPTCHA."));
                          }}>Reload reCAPTCHA</button>
                        </>
                    ) : (
                        <p style={{ fontSize: "0.75rem", color: "var(--lf-danger)" }}>Signup temporarily unavailable. reCAPTCHA is not configured.</p>
                    )}
                  </div>
              )}

              {/* Banners */}
              {error && (
                  <div className="lf-alert lf-alert--error">
                    <span className="lf-alert-icon"><IconAlert /></span>
                    <span>{error}</span>
                  </div>
              )}
              {notice && (
                  <div className="lf-alert lf-alert--success">
                    <span className="lf-alert-icon"><IconCheck /></span>
                    <span>{notice}</span>
                  </div>
              )}

              {/* CTA */}
              <button className="lf-btn-primary" disabled={loading || googleLoading} onClick={handleSubmit}>
                {loading
                    ? <span className="lf-spinner"><IconSpinner /></span>
                    : <><span>{isSignup ? "Create account" : "Sign in"}</span><IconArrow /></>}
              </button>

              <div className="lf-divider">
                <div className="lf-divider-line" />
                <span className="lf-divider-txt">or</span>
                <div className="lf-divider-line" />
              </div>

              {/* Google */}
              <button className="lf-btn-google" disabled={loading || googleLoading} onClick={async () => {
                setGoogleLoading(true); setError(null); setNotice(null);
                try { await signInGoogle(); router.push("/"); router.refresh(); }
                catch (err) { setError(err instanceof Error ? err.message : "Google login failed"); }
                finally { setGoogleLoading(false); }
              }}>
                {googleLoading ? <span className="lf-spinner"><IconSpinner /></span> : <GoogleIcon />}
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Trust */}
            <div className="lf-trust">
              <span className="lf-trust-icon"><IconShield /></span>
              <span>Your data is encrypted and never shared</span>
            </div>
          </div>
        </div>
      </>
  );
}