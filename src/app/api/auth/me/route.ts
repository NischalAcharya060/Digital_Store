import { getCurrentUserProfile } from "@/lib/auth/server";
import { ok } from "@/lib/utils/api";

export async function GET() {
  const profile = await getCurrentUserProfile();
  return ok({ profile });
}
