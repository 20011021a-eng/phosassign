import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { solventLabel, doiHref } from "@/lib/data";
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

  const catName = rec ? (lang === "zh" ? rec.primary.name_zh : rec.primary.name) : "";

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

      {rec ? (
        <section className="mt-4 rounded-xl border border-viridian/30 bg-card px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">{t.catalysts}</p>
          <p className="mt-1 font-display text-2xl font-medium tracking-tight text-viridian">{catName}</p>
          <dl className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <dt className="text-xs text-muted">{t.solvent}</dt>
              <dd className="mt-1 text-lg font-medium">{solventLabel(rec.primary.solvent, lang)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">{t.temperature}</dt>
              <dd className="mt-1 font-mono text-lg tabular-nums">{rec.primary.temperature_c} °C</dd>
            </div>
          </dl>
          {rec.refs?.length ? (
            <div className="mt-4 border-t border-line pt-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">{t.literature}</p>
              <ul className="mt-2 flex flex-col gap-2">
                {rec.refs.map((p) => {
                  const href = doiHref(p.doi);
                  const lead = p.authors.split(/[,;]/)[0]?.trim() || p.authors;
                  return (
                    <li key={p.doi} className="text-sm leading-snug">
                      <p>
                        {lead}
                        {p.authors.includes(",") || p.authors.includes(";") ? " et al." : ""}{" "}
                        <span className="text-muted">
                          {p.journal} {p.year}
                        </span>
                      </p>
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-xs text-viridian hover:underline"
                        >
                          {p.doi}
                        </a>
                      ) : (
                        <p className="font-mono text-xs text-muted">{p.doi}</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
