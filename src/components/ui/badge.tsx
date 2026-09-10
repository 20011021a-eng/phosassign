import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "accent" | "warn" | "ok" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        tone === "neutral" && "bg-paper-2 text-ink-soft",
        tone === "accent" && "bg-viridian text-viridian-fg",
        tone === "warn" && "bg-paper-2 text-warn",
        tone === "ok" && "bg-paper-2 text-ok",
        className,
      )}
      {...props}
    />
  );
}
