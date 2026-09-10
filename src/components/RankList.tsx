import { doiHref, solventLabel } from "@/lib/data";
import type { Lang } from "@/lib/i18n";
import type { ConditionPick, Recommendation } from "@/lib/predict";

function cite(p: ConditionPick["refs"][number]) {
  const lead = p.authors.split(/[,;]/)[0]?.trim() || p.authors;
  const et = p.authors.includes(",") || p.authors.includes(";") ? " et al." : "";
  return `${lead}${et} ${p.journal} ${p.year}`;
}

export function RankList({
  rec,
  lang,
}: {
  rec: Recommendation;
  lang: Lang;
  label?: string;
}) {
  const items = (rec.ranked?.length ? rec.ranked : [rec.primary, ...(rec.alts ?? [])]).slice(0, 3);
  return (
    <ol className="mt-4 flex flex-col gap-3">
      {items.map((item, i) => {
        const name = lang === "zh" ? item.name_zh : item.name;
        const first = item.refs?.[0];
        const href = first ? doiHref(first.doi) : null;
        return (
          <li
            key={item.catalyst_id}
            className="rounded-xl border border-line bg-card px-4 py-3"
          >
            <div className="flex items-baseline gap-3">
              <span className="w-5 shrink-0 font-mono text-sm tabular-nums text-muted">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-xl font-medium tracking-tight text-viridian">{name}</p>
                <p className="mt-1 text-sm text-ink-soft">
                  {solventLabel(item.solvent, lang)} · {item.temperature_c} °C
                </p>
                {first ? (
                  <p className="mt-2 text-xs leading-snug text-muted">
                    {cite(first)}
                    {href ? (
                      <>
                        {" "}
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-viridian hover:underline"
                        >
                          {first.doi}
                        </a>
                      </>
                    ) : null}
                  </p>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
