import type { ReactNode } from "react";

export function Summary({
  icon,
  label,
  value,
  className,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-border/70 bg-background/60 p-3 ${className ?? ""}`}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
