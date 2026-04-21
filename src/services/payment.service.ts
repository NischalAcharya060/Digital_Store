import "server-only";

export interface PaymentVerificationResult {
  success: boolean;
  providerTransactionId: string;
  raw: unknown;
}

function getEsewaVerifyUrl() {
  return (
    process.env.ESEWA_VERIFY_URL ??
    "https://rc.esewa.com.np/api/epay/transaction/status/"
  );
}

export async function verifyEsewaPayment(input: {
  transactionId: string;
  totalAmount: number;
}): Promise<PaymentVerificationResult> {
  const productCode = process.env.ESEWA_PRODUCT_CODE;
  if (!productCode) {
    throw new Error("Missing ESEWA_PRODUCT_CODE");
  }

  const params = new URLSearchParams({
    product_code: productCode,
    total_amount: input.totalAmount.toString(),
    transaction_uuid: input.transactionId,
  });

  const url = `${getEsewaVerifyUrl()}?${params.toString()}`;
  const response = await fetch(url, { method: "GET" });

  if (!response.ok) {
    throw new Error("eSewa verification request failed");
  }

  const data = (await response.json()) as { status?: string; transaction_uuid?: string };

  const success = data.status?.toUpperCase() === "COMPLETE";

  return {
    success,
    providerTransactionId: data.transaction_uuid ?? input.transactionId,
    raw: data,
  };
}

export async function verifyKhaltiPayment(input: {
  pidx: string;
}): Promise<PaymentVerificationResult> {
  const secretKey = process.env.KHALTI_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Missing KHALTI_SECRET_KEY");
  }

  const verifyUrl =
    process.env.KHALTI_VERIFY_URL ??
    "https://a.khalti.com/api/v2/epayment/lookup/";

  const response = await fetch(verifyUrl, {
    method: "POST",
    headers: {
      Authorization: `Key ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pidx: input.pidx }),
  });

  if (!response.ok) {
    throw new Error("Khalti verification request failed");
  }

  const data = (await response.json()) as {
    status?: string;
    transaction_id?: string;
  };

  const success = data.status?.toLowerCase() === "completed";

  return {
    success,
    providerTransactionId: data.transaction_id ?? input.pidx,
    raw: data,
  };
}
