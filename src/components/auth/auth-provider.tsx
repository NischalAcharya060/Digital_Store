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
  signUpEmail: (email: string, password: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function createServerSession(user: User) {
  const idToken = await user.getIdToken();

  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    throw new Error("Failed to create server session");
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
    const auth = getFirebaseClientAuth();
    const credential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );

    await createServerSession(credential.user);
  }, []);

  const signUpEmail = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseClientAuth();
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    await createServerSession(credential.user);
  }, []);

  const signInGoogle = useCallback(async () => {
    const auth = getFirebaseClientAuth();
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);

    await createServerSession(credential.user);
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
