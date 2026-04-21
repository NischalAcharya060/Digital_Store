import Link from "next/link";

import { Card } from "@/components/ui/card";

interface FirebaseConfigAlertProps {
  mode?: "missing-config" | "database-not-found";
}

export function FirebaseConfigAlert({ mode = "missing-config" }: FirebaseConfigAlertProps) {
  const isDatabaseMissing = mode === "database-not-found";

  return (
    <Card className="mx-auto max-w-3xl">
      <h2 className="text-xl font-semibold text-[var(--color-primary)]">
        {isDatabaseMissing
          ? "Firestore database is not initialized"
          : "Firebase is not configured yet"}
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        {isDatabaseMissing
          ? "Your Firebase credentials are loaded, but this project has no active Firestore database."
          : "Add your Firebase project values in .env, then restart the dev server."}
      </p>

      <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-700">
        {isDatabaseMissing ? (
          <>
            <li>Create Firestore Database in the Firebase console for this project.</li>
            <li>Use Native mode unless your PRD requires Datastore mode.</li>
            <li>Verify FIREBASE_PROJECT_ID and NEXT_PUBLIC_FIREBASE_PROJECT_ID match.</li>
          </>
        ) : (
          <>
            <li>NEXT_PUBLIC_FIREBASE_PROJECT_ID</li>
            <li>FIREBASE_PROJECT_ID</li>
            <li>FIREBASE_CLIENT_EMAIL</li>
            <li>FIREBASE_PRIVATE_KEY</li>
          </>
        )}
      </ul>

      <p className="mt-4 text-sm text-slate-600">
        {isDatabaseMissing
          ? "After creating Firestore Database, restart your dev server and reload this page."
          : "You can start from .env.example and copy values from your Firebase project settings and service account."}
      </p>

      <div className="mt-4">
        <Link
          href={
            isDatabaseMissing
              ? "https://console.firebase.google.com/"
              : "https://cloud.google.com/docs/authentication/getting-started"
          }
          className="text-sm font-medium text-[var(--color-secondary)] underline underline-offset-2"
        >
          {isDatabaseMissing
            ? "Open Firebase console"
            : "Google authentication setup guide"}
        </Link>
      </div>
    </Card>
  );
}
