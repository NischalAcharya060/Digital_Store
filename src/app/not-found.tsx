import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-3xl font-semibold text-[var(--color-primary)]">Page not found</h1>
      <p className="text-sm text-slate-600">The requested page does not exist.</p>
      <Link href="/">
        <Button>Go to home</Button>
      </Link>
    </div>
  );
}
