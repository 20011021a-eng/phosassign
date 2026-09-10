import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useLang } from "@/lib/i18n";

function LogoMark() {
  return (
    <svg viewBox="0 0 28 28" className="size-7 shrink-0 text-viridian" aria-hidden>
      <rect width="28" height="28" rx="6" fill="currentColor" />
      <rect x="3.5" y="5.5" width="4.8" height="17" rx="2.4" className="fill-paper" />
      <rect x="19.7" y="5.5" width="4.8" height="17" rx="2.4" className="fill-paper" />
      <path d="M14 9 18.6 14 14 19 9.4 14 Z" className="fill-paper" />
    </svg>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { t, toggle } = useLang();

  return (
    <div className="flex min-h-dvh flex-col overflow-y-auto bg-paper text-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-paper">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3 px-4 py-2">
          <Link to="/" className="flex items-center gap-2">
            <LogoMark />
            <span className="font-display text-base font-medium tracking-tight">{t.brand}</span>
          </Link>
          <button
            type="button"
            onClick={toggle}
            className="inline-flex min-h-10 items-center rounded-sm border border-line px-2.5 text-sm text-ink-soft hover:bg-paper-2"
          >
            {t.lang}
          </button>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
