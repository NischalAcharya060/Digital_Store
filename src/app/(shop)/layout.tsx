import type { PropsWithChildren } from "react";

import { StoreFooter } from "@/components/layout/store-footer";
import { StoreHeader } from "@/components/layout/store-header";

export default function ShopLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-dvh flex-col">
      <StoreHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <StoreFooter />
    </div>
  );
}
