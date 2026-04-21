import Link from "next/link";
import type { PropsWithChildren } from "react";

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-[color:var(--color-surface-border)]">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-2))] text-xs font-bold text-white">
              DS
            </span>
            <span className="text-[color:var(--color-text)]">Digital Store</span>
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        {children}
      </main>
    </div>
  );
}
