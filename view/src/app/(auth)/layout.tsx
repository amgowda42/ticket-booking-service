import type { ReactNode } from "react";

import { GuestRoute } from "@/features/auth/components/route-guards";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <GuestRoute>{children}</GuestRoute>;
}
