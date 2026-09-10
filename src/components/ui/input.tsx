import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex min-h-11 w-full rounded-sm border border-line bg-card px-3 text-sm text-ink placeholder:text-muted",
        "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-viridian",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
