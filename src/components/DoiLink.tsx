import { doiHref } from "@/lib/data";
import { cn } from "@/lib/utils";

export function DoiLink({ doi, className }: { doi: string; className?: string }) {
  const href = doiHref(doi);
  if (!href) {
    return <span className={cn("font-mono text-xs text-muted", className)}>{doi || "—"}</span>;
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn("font-mono text-xs text-viridian underline-offset-2 hover:underline", className)}
    >
      {doi}
    </a>
  );
}
