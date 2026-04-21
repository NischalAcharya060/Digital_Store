"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const { signInEmail, signUpEmail, signInGoogle } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEmailSubmit() {
    setLoading(true);
    setError(null);

    try {
      if (isSignup) {
        await signUpEmail(email, password);
      } else {
        await signInEmail(email, password);
      }

      router.push("/");
      router.refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-6 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.45)]">
      <h1 className="text-2xl font-semibold text-[color:var(--color-text)]">
        {isSignup ? "Create account" : "Welcome back"}
      </h1>
      <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
        Sign in to checkout, track orders, and access delivery codes instantly.
      </p>

      <div className="mt-6 space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {error ? (
          <p className="rounded-lg border border-[color:var(--color-danger)]/30 bg-[color:color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-3 py-2 text-sm text-[color:var(--color-danger)]">
            {error}
          </p>
        ) : null}

        <Button fullWidth disabled={loading} onClick={handleEmailSubmit}>
          {loading ? "Please wait..." : isSignup ? "Create account" : "Sign in"}
        </Button>

        <Button
          fullWidth
          variant="secondary"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            setError(null);

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
          Continue with Google
        </Button>
      </div>

      <button
        className="mt-4 text-sm text-[color:var(--color-accent)] transition hover:text-[color:var(--color-accent-2)]"
        onClick={() => setIsSignup((prev) => !prev)}
        type="button"
      >
        {isSignup ? "Already have an account? Sign in" : "New here? Create an account"}
      </button>
    </div>
  );
}
