import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { RankList } from "@/components/RankList";
import { LangProvider, useLang } from "@/lib/i18n";
import { EXAMPLE_SMILES, recommendFromSmiles, type Recommendation } from "@/lib/predict";
import "../src/styles.css";

function readSmiles() {
  const el = document.getElementById("smi") as HTMLTextAreaElement | null;
  return (el?.value ?? "").trim();
}

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

function Home() {
  const { t, lang, toggle } = useLang();
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [hint, setHint] = useState("");

  function predict(raw?: string) {
    const q = (raw ?? readSmiles()).replace(/\s+/g, "").trim();
    if (q.length < 2) {
      setRec(null);
      setHint("");
      return;
    }
    try {
      const next = recommendFromSmiles(q);
      setRec(next);
      setHint(next ? "" : t.emptyHint);
    } catch {
      setRec(null);
      setHint(t.emptyHint);
    }
  }

  useEffect(() => {
    const box = document.getElementById("smi") as HTMLTextAreaElement | null;
    const go = document.getElementById("go");
    const ex = document.getElementById("ex");
    if (!box) return;
    const onInput = () => predict(box.value);
    const onGo = (e: Event) => {
      e.preventDefault();
      predict(box.value);
    };
    const onEx = (e: Event) => {
      e.preventDefault();
      box.value = EXAMPLE_SMILES;
      predict(EXAMPLE_SMILES);
    };
    box.addEventListener("input", onInput);
    go?.addEventListener("click", onGo);
    ex?.addEventListener("click", onEx);
    return () => {
      box.removeEventListener("input", onInput);
      go?.removeEventListener("click", onGo);
      ex?.removeEventListener("click", onEx);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  return (
    <div className="flex min-h-dvh flex-col overflow-y-auto bg-paper text-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-paper">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3 px-4 py-2">
          <div className="flex items-center gap-2">
            <LogoMark />
            <span className="font-display text-base font-medium tracking-tight">{t.brand}</span>
          </div>
          <button
            type="button"
            onClick={toggle}
            className="inline-flex min-h-10 items-center rounded-sm border border-line px-2.5 text-sm text-ink-soft hover:bg-paper-2"
          >
            {t.lang}
          </button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-xl px-4 py-5">
        <h1 className="font-display text-2xl font-medium tracking-tight">{t.heroTitle}</h1>
        <div className="mt-4 flex flex-col gap-2">
          <label htmlFor="smi" className="text-xs font-medium tracking-wide text-muted">
            {t.substrate}
          </label>
          <textarea
            id="smi"
            name="smi"
            rows={3}
            placeholder={t.placeholderSmi}
            onInput={(e) => predict(e.currentTarget.value)}
            className="w-full resize-y rounded-sm border border-line bg-card px-3 py-2 font-mono text-xs leading-relaxed text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-viridian"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="go"
              type="button"
              onClick={() => predict()}
              className="inline-flex min-h-11 items-center rounded-sm bg-viridian px-4 text-sm font-medium text-viridian-fg hover:bg-viridian-dim"
            >
              {t.run}
            </button>
            <button
              id="ex"
              type="button"
              onClick={() => {
                const el = document.getElementById("smi") as HTMLTextAreaElement | null;
                if (el) el.value = EXAMPLE_SMILES;
                predict(EXAMPLE_SMILES);
              }}
              className="inline-flex min-h-11 items-center rounded-sm px-3 text-sm text-ink-soft hover:bg-paper-2"
            >
              {t.tryExample}
            </button>
          </div>
        </div>
        {hint ? <p className="mt-4 text-sm text-ink">{hint}</p> : null}
        {rec ? <RankList rec={rec} lang={lang} label={t.catalysts} /> : null}
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LangProvider>
      <Home />
    </LangProvider>
  </StrictMode>,
);
