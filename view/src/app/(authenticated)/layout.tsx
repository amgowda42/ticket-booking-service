import type { ReactNode } from "react";

import { AuthenticatedShell } from "@/features/auth/components/authenticated-shell";
import { AuthenticatedRoute } from "@/features/auth/components/route-guards";

export default function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AuthenticatedRoute><AuthenticatedShell>{children}</AuthenticatedShell></AuthenticatedRoute>;
}
