export function isFirestoreDatabaseNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as {
    code?: unknown;
    message?: unknown;
    details?: unknown;
  };

  const code =
    typeof candidate.code === "string" || typeof candidate.code === "number"
      ? String(candidate.code).toUpperCase()
      : "";

  if (code === "5" || code === "NOT_FOUND") {
    return true;
  }

  const message = [candidate.message, candidate.details]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();

  return (
    message.includes("5 not_found") ||
    (message.includes("database") &&
      message.includes("(default)") &&
      message.includes("does not exist"))
  );
}
