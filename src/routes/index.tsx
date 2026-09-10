import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RankList } from "@/components/RankList";
import { useLang } from "@/lib/i18n";
import { EXAMPLE_SMILES, recommendFromSmiles, type Recommendation } from "@/lib/predict";

export const Route = createFileRoute("/")({ component: Home });

function readSmiles() {
  const el = document.getElementById("smi") as HTMLTextAreaElement | null;
  return (el?.value ?? "").trim();
}

function Home() {
  const { t, lang } = useLang();
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
      e.stopPropagation();
      predict(box.value);
    };
    const onEx = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      box.value = EXAMPLE_SMILES;
      predict(EXAMPLE_SMILES);
    };

    box.addEventListener("input", onInput);
    box.addEventListener("paste", () => setTimeout(() => predict(box.value), 0));
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
  );
}
