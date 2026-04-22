import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME } from "@/lib/constants/app";
import { firebaseAdminAuth } from "@/lib/firebase/admin";
import { fail, ok, parseJson } from "@/lib/utils/api";
import { sessionSchema } from "@/lib/validation/schemas";
import { ensureUserProfile } from "@/services/user.service";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 5;

export async function POST(request: Request) {
  const payload = await parseJson<{ idToken: string }>(request);
  const parsed = sessionSchema.safeParse(payload);

  if (!parsed.success) {
    return fail("INVALID_PAYLOAD", "Invalid id token payload", 422);
  }

  try {
    const decodedToken = await firebaseAdminAuth.verifyIdToken(parsed.data.idToken);
    const user = await firebaseAdminAuth.getUser(decodedToken.uid);

    const profile = await ensureUserProfile(user);
    if (profile.status === "suspended") {
      return fail(
        "ACCOUNT_SUSPENDED",
        "Your account has been banned or suspended. Please contact support.",
        403,
      );
    }

    const expiresIn = SESSION_MAX_AGE_SECONDS * 1000;
    const sessionCookie = await firebaseAdminAuth.createSessionCookie(
      parsed.data.idToken,
      {
        expiresIn,
      },
    );

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return ok({ message: "Session created" });
  } catch {
    return fail("AUTH_FAILED", "Unable to create session", 401);
  }
}
