import type { ReactNode } from "react";

import { AuthenticatedRoute } from "@/features/auth/components/route-guards";

export default function NewEventLayout({ children }: { children: ReactNode }) {
  return <AuthenticatedRoute requiredRole="admin">{children}</AuthenticatedRoute>;
}
