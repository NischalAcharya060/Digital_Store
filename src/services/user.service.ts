import "server-only";

import type { UserRecord } from "firebase-admin/auth";
import { FieldValue } from "firebase-admin/firestore";

import { COLLECTIONS } from "@/lib/constants/app";
import { firebaseAdminAuth, firebaseAdminDb } from "@/lib/firebase/admin";
import { nowIso } from "@/lib/utils/time";
import type { UserProfile, UserRole, UserStatus } from "@/types/domain";

type RoleUpdateActor = Pick<UserProfile, "id" | "role">;

const ADMIN_EDITABLE_ROLES = new Set<UserRole>(["user", "moderator"]);

export async function ensureUserProfile(user: UserRecord): Promise<UserProfile> {
  const userRef = firebaseAdminDb.collection(COLLECTIONS.users).doc(user.uid);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    const profile: Omit<UserProfile, "id"> = {
      name: user.displayName ?? user.email?.split("@")[0] ?? "User",
      email: user.email ?? "",
      role: "user",
      status: "active",
      createdAt: nowIso(),
      lastLoginAt: nowIso(),
    };

    await userRef.set(profile);

    return { id: user.uid, ...profile };
  }

  const data = userSnap.data() as Omit<UserProfile, "id">;

  // Backfill defaults for older records and bump lastLoginAt
  const update: Partial<UserProfile> = { lastLoginAt: nowIso() };
  if (!data.status) update.status = "active";

  await userRef.set(update, { merge: true });

  return {
    id: user.uid,
    ...data,
    ...update,
  };
}

export async function listAllUsers(): Promise<UserProfile[]> {
  const snap = await firebaseAdminDb.collection(COLLECTIONS.users).get();
  return snap.docs.map((doc) => {
    const data = doc.data() as Omit<UserProfile, "id">;
    return {
      id: doc.id,
      ...data,
      status: data.status ?? "active",
    };
  });
}

export async function countAdmins(): Promise<number> {
  const snap = await firebaseAdminDb
    .collection(COLLECTIONS.users)
    .where("role", "==", "admin")
    .get();
  return snap.size;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const snap = await firebaseAdminDb.collection(COLLECTIONS.users).doc(userId).get();
  if (!snap.exists) return null;
  const data = snap.data() as Omit<UserProfile, "id">;
  return { id: snap.id, ...data, status: data.status ?? "active" };
}

/**
 * Update a user's role with admin/super-admin boundaries.
 */
export async function updateUserRole(
  userId: string,
  nextRole: UserRole,
  actor: RoleUpdateActor,
): Promise<UserProfile> {
  if (userId === actor.id) {
    throw new Error("CANNOT_CHANGE_SELF_ROLE");
  }

  const current = await getUserProfile(userId);
  if (!current) throw new Error("USER_NOT_FOUND");

  if (current.role === nextRole) {
    return current;
  }

  if (current.role === "super_admin" || nextRole === "super_admin") {
    throw new Error("SUPER_ADMIN_ROLE_LOCKED");
  }

  if (
    actor.role === "admin" &&
    (!ADMIN_EDITABLE_ROLES.has(current.role) || !ADMIN_EDITABLE_ROLES.has(nextRole))
  ) {
    throw new Error("ADMIN_ROLE_RESTRICTED");
  }

  if (
    actor.role !== "super_admin" &&
    (current.role === "admin" || nextRole === "admin")
  ) {
    throw new Error("ADMIN_ROLE_RESTRICTED");
  }

  if (current.role === "admin" && nextRole !== "admin") {
    const admins = await countAdmins();
    if (admins <= 1) {
      throw new Error("LAST_ADMIN");
    }
  }

  await firebaseAdminDb
    .collection(COLLECTIONS.users)
    .doc(userId)
    .set({ role: nextRole }, { merge: true });

  return { ...current, role: nextRole };
}

/**
 * Suspend or reactivate a user. Suspended users are also disabled in Firebase Auth
 * so their session cookie verification will fail and they can't obtain new tokens.
 */
export async function setUserStatus(
  userId: string,
  nextStatus: UserStatus,
  actor: RoleUpdateActor,
  reason?: string,
): Promise<UserProfile> {
  if (userId === actor.id && nextStatus === "suspended") {
    throw new Error("CANNOT_SUSPEND_SELF");
  }

  const current = await getUserProfile(userId);
  if (!current) throw new Error("USER_NOT_FOUND");

  if (current.role === "super_admin") {
    throw new Error("SUPER_ADMIN_ROLE_LOCKED");
  }

  if (actor.role === "admin" && !ADMIN_EDITABLE_ROLES.has(current.role)) {
    throw new Error("ADMIN_ROLE_RESTRICTED");
  }

  if (current.role === "admin" && nextStatus === "suspended") {
    const admins = await countAdmins();
    if (admins <= 1) {
      throw new Error("LAST_ADMIN");
    }
  }

  const update: Partial<UserProfile> = { status: nextStatus };

  if (nextStatus === "suspended") {
    update.suspendedAt = nowIso();
    update.suspendedBy = actor.id;
    update.suspendedReason = reason?.trim() || "No reason provided";
  }

  await firebaseAdminDb
    .collection(COLLECTIONS.users)
    .doc(userId)
    .set(update, { merge: true });

  // Handle field deletion for reactivation
  if (nextStatus === "active") {
    await firebaseAdminDb
      .collection(COLLECTIONS.users)
      .doc(userId)
      .update({
        suspendedAt: FieldValue.delete(),
        suspendedBy: FieldValue.delete(),
        suspendedReason: FieldValue.delete(),
      });
  }

  // Mirror to Firebase Auth — disabling revokes tokens and blocks sign-in.
  try {
    await firebaseAdminAuth.updateUser(userId, { disabled: nextStatus === "suspended" });
    if (nextStatus === "suspended") {
      await firebaseAdminAuth.revokeRefreshTokens(userId);
    }
  } catch (err) {
    // If Auth user doesn't exist (e.g. soft account), ignore.
    if (!(err instanceof Error && err.message.includes("no user record"))) {
      throw err;
    }
  }

  // Return updated profile
  return await getUserProfile(userId) as UserProfile;
}

export async function deleteUserAccount(
  userId: string,
  actor: RoleUpdateActor,
): Promise<void> {
  if (userId === actor.id) throw new Error("CANNOT_DELETE_SELF");

  const current = await getUserProfile(userId);
  if (!current) throw new Error("USER_NOT_FOUND");

  if (current.role === "super_admin") {
    throw new Error("SUPER_ADMIN_ROLE_LOCKED");
  }

  if (actor.role === "admin" && !ADMIN_EDITABLE_ROLES.has(current.role)) {
    throw new Error("ADMIN_ROLE_RESTRICTED");
  }

  if (current.role === "admin") {
    const admins = await countAdmins();
    if (admins <= 1) throw new Error("LAST_ADMIN");
  }

  await firebaseAdminDb.collection(COLLECTIONS.users).doc(userId).delete();

  try {
    await firebaseAdminAuth.deleteUser(userId);
  } catch (err) {
    if (!(err instanceof Error && err.message.includes("no user record"))) {
      throw err;
    }
  }
}
