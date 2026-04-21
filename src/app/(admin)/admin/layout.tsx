import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { requireStaffUser } from "@/lib/auth/server";

export default async function AdminLayout({ children }: PropsWithChildren) {
  const admin = await requireStaffUser().catch((error: unknown) => {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      redirect("/login");
    }

    redirect("/");
  });

  return (
    <AdminShell adminName={admin.name} adminEmail={admin.email}>
      {children}
    </AdminShell>
  );
}
