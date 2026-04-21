import "server-only";

import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME, COLLECTIONS } from "@/lib/constants/app";
import { firebaseAdminAuth, firebaseAdminDb } from "@/lib/firebase/admin";
import type { UserProfile } from "@/types/domain";

export async function getSessionCookieValue(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function requireAuthUser() {
  const sessionCookie = await getSessionCookieValue();
  if (!sessionCookie) {
    throw new Error("UNAUTHORIZED");
  }

  const decoded = await firebaseAdminAuth.verifySessionCookie(sessionCookie, true);
  return decoded;
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const decoded = await requireAuthUser();
    const userSnap = await firebaseAdminDb
      .collection(COLLECTIONS.users)
      .doc(decoded.uid)
      .get();

    if (!userSnap.exists) {
      return null;
    }

    const data = userSnap.data() as Omit<UserProfile, "id">;
    const profile: UserProfile = {
      id: userSnap.id,
      ...data,
      status: data.status ?? "active",
    };

    // Suspended users cannot use the app, even mid-session.
    if (profile.status === "suspended") {
      return null;
    }

    return profile;
  } catch {
    return null;
  }
}

export async function requireAdminUser() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    throw new Error("UNAUTHORIZED");
  }

  if (profile.role !== "admin" && profile.role !== "super_admin") {
    throw new Error("FORBIDDEN");
  }

  return profile;
}

/**
 * Allow super admins, admins, and moderators for staff admin areas.
 */
export async function requireStaffUser() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    throw new Error("UNAUTHORIZED");
  }

  if (
    profile.role !== "admin" &&
    profile.role !== "super_admin" &&
    profile.role !== "moderator"
  ) {
    throw new Error("FORBIDDEN");
  }

  return profile;
}
