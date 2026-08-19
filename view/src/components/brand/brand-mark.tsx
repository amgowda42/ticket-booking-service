import { Ticket } from "lucide-react";

import { cn } from "@/lib/utils";

function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5 font-semibold tracking-tight", className)}>
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
        <Ticket className="size-4" aria-hidden="true" />
      </span>
      <span>Seatwise</span>
    </div>
  );
}

export { BrandMark };
