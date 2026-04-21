import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME } from "@/lib/constants/app";
import { ok } from "@/lib/utils/api";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);

  return ok({ message: "Logged out" });
}
