"use client";

import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import { getFirebaseClientAuth } from "@/lib/firebase/client";
import type { ApiResponse } from "@/types/api";
import type { UserProfile } from "@/types/domain";

async function fetchUserProfile() {
  const response = await fetch("/api/auth/me", { cache: "no-store" });
  const body = (await response.json()) as ApiResponse<{
    profile: UserProfile | null;
  }>;

  if (!response.ok || !body.ok) {
    return null;
  }

  return body.data.profile;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (
    email: string,
    password: string,
    recaptchaToken: string,
  ) => Promise<void>;
  signInGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapAuthError(error: unknown): Error {
  if (!(error instanceof Error)) {
    return new Error("Authentication failed. Please try again.");
  }

  const message = error.message;
  if (message.includes("ACCOUNT_SUSPENDED") || message.includes("auth/user-disabled")) {
    return new Error(
      "Your account has been banned or suspended. Please contact support.",
    );
  }
  if (
    message.includes("auth/invalid-credential") ||
    message.includes("auth/wrong-password") ||
    message.includes("INVALID_LOGIN_CREDENTIALS")
  ) {
    return new Error("Invalid email or password.");
  }
  if (message.includes("auth/user-not-found")) {
    return new Error("No account found for this email.");
  }
  if (message.includes("auth/email-already-in-use")) {
    return new Error("An account with this email already exists.");
  }
  if (message.includes("auth/weak-password")) {
    return new Error("Password is too weak. Use at least 6 characters.");
  }
  if (message.includes("auth/too-many-requests")) {
    return new Error("Too many attempts. Please wait and try again.");
  }
  if (message.includes("auth/popup-closed-by-user")) {
    return new Error("Google sign-in was cancelled.");
  }
  if (message.includes("auth/network-request-failed")) {
    return new Error("Network error. Please check your internet connection.");
  }

  return new Error(message || "Authentication failed. Please try again.");
}

async function createServerSession(user: User) {
  const idToken = await user.getIdToken();

  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  const body = (await response.json().catch(() => null)) as ApiResponse<{
    message: string;
  }> | null;

  if (!response.ok || !body?.ok) {
    throw new Error(
      body && !body.ok ? body.error.message : "Failed to create server session",
    );
  }
}

async function verifyRecaptchaForSignup(recaptchaToken: string) {
  const response = await fetch("/api/auth/recaptcha/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: recaptchaToken }),
  });

  const body = (await response.json().catch(() => null)) as ApiResponse<{
    verified: boolean;
  }> | null;

  if (!response.ok || !body?.ok || !body.data.verified) {
    throw new Error(
      body && !body.ok
        ? body.error.message
        : "reCAPTCHA verification failed. Please try again.",
    );
  }
}

async function clearClientAuthState() {
  const auth = getFirebaseClientAuth();
  if (auth.currentUser) {
    await signOut(auth);
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const auth = getFirebaseClientAuth();
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (!active) {
        return;
      }

      setUser(nextUser);

      if (!nextUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const nextProfile = await fetchUserProfile().catch(() => null);

      if (active) {
        setProfile(nextProfile);
        setLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const signInEmail = useCallback(async (email: string, password: string) => {
    try {
      const auth = getFirebaseClientAuth();
      const credential = await signInWithEmailAndPassword(auth, email, password);
      await createServerSession(credential.user);
    } catch (error) {
      await clearClientAuthState().catch(() => undefined);
      throw mapAuthError(error);
    }
  }, []);

  const signUpEmail = useCallback(
    async (email: string, password: string, recaptchaToken: string) => {
      try {
        await verifyRecaptchaForSignup(recaptchaToken);
        const auth = getFirebaseClientAuth();
        const credential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        await createServerSession(credential.user);
      } catch (error) {
        await clearClientAuthState().catch(() => undefined);
        throw mapAuthError(error);
      }
    },
    [],
  );

  const signInGoogle = useCallback(async () => {
    try {
      const auth = getFirebaseClientAuth();
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      await createServerSession(credential.user);
    } catch (error) {
      await clearClientAuthState().catch(() => undefined);
      throw mapAuthError(error);
    }
  }, []);

  const logout = useCallback(async () => {
    const auth = getFirebaseClientAuth();
    await signOut(auth);
    await fetch("/api/auth/logout", { method: "POST" });
    setProfile(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      signInEmail,
      signUpEmail,
      signInGoogle,
      logout,
    }),
    [loading, logout, profile, signInEmail, signInGoogle, signUpEmail, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used inside AuthProvider");
  }

  return context;
}
