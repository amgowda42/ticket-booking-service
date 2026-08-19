import { type ComponentProps } from "react";

import { cn } from "@/lib/utils";

function Card({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/80 bg-card/90 shadow-2xl shadow-black/20 backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}

export { Card };
