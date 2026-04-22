import { fail, ok, parseJson } from "@/lib/utils/api";
import { recaptchaVerifySchema } from "@/lib/validation/schemas";

interface RecaptchaVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
}

const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

export async function POST(request: Request) {
  const payload = await parseJson(request);
  const parsed = recaptchaVerifySchema.safeParse(payload);
  if (!parsed.success) {
    return fail("INVALID_PAYLOAD", "Invalid reCAPTCHA payload", 422);
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    return fail(
      "RECAPTCHA_NOT_CONFIGURED",
      "Signup is temporarily unavailable. Please try again later.",
      503,
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "";

  const form = new URLSearchParams({
    secret: secretKey,
    response: parsed.data.token,
  });
  if (ip) form.set("remoteip", ip);

  try {
    const verifyResponse = await fetch(RECAPTCHA_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });

    const verifyBody = (await verifyResponse.json()) as RecaptchaVerifyResponse;
    if (!verifyBody.success) {
      return fail(
        "RECAPTCHA_FAILED",
        "reCAPTCHA verification failed. Please try again.",
        403,
      );
    }

    return ok({ verified: true });
  } catch {
    return fail(
      "RECAPTCHA_VERIFY_ERROR",
      "Unable to verify reCAPTCHA right now. Please try again.",
      500,
    );
  }
}
