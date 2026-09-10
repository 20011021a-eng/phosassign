import {
  analogs,
  catalysts,
  model,
  reactions,
  solvents,
  SCAN_SOLVENTS,
  SCAN_TEMPS,
  type Analog,
} from "@/lib/data";

export type RankedCatalyst = {
  rank: number;
  id: string;
  name: string;
  name_zh: string;
  className: string;
  score: number;
  mlp: number | null;
  expectedEe: number;
  maxEe: number;
  nType: number;
  nTotal: number;
  wins: number;
  modeled: boolean;
  smiles: string;
  reasonZh: string;
  reasonEn: string;
  bestDoi: string | null;
};

export type Neighbor = {
  id: string;
  catalyst_id: string;
  ee: number;
  yield: number | null;
  reaction_type: string;
  solvent: string;
  temperature_c: number;
  doi: string;
  year: number;
  dist: number;
};

export type ScanCell = {
  solvent: string;
  temp: number;
  topId: string;
  topName: string;
  score: number;
};

export type Assignment = {
  ranked: RankedCatalyst[];
  neighbors: Neighbor[];
  scan: ScanCell[];
};

type LitStat = { n: number; meanEe: number; maxEe: number; doi: string | null };

const centroids = new Map<string, number[]>();
const litByType = new Map<string, Map<string, LitStat>>();

for (const r of reactions) {
  let m = litByType.get(r.reaction_type);
  if (!m) {
    m = new Map();
    litByType.set(r.reaction_type, m);
  }
  const prev = m.get(r.catalyst_id);
  if (!prev) {
    m.set(r.catalyst_id, { n: 1, meanEe: r.ee, maxEe: r.ee, doi: r.doi });
  } else {
    const n = prev.n + 1;
    const maxEe = Math.max(prev.maxEe, r.ee);
    const doi = r.ee >= prev.maxEe ? r.doi : prev.doi;
    m.set(r.catalyst_id, {
      n,
      meanEe: prev.meanEe + (r.ee - prev.meanEe) / n,
      maxEe,
      doi,
    });
  }
}

function getCentroid(type: string): number[] {
  const hit = centroids.get(type);
  if (hit) return hit;
  const rows = analogs.filter((a) => a.reaction_type === type);
  const src = rows.length ? rows : analogs;
  const acc = new Array(209).fill(0);
  for (const r of src) {
    for (let i = 0; i < 209; i++) acc[i] += r.vec[i];
  }
  const n = src.length || 1;
  const c = acc.map((v) => v / n);
  centroids.set(type, c);
  return c;
}

function makeFeatures(type: string, solvent: string, temp: number): number[] {
  const v = getCentroid(type).slice();
  const props = solvents[solvent]?.props;
  if (props) {
    for (let i = 0; i < 16; i++) v[192 + i] = props[i];
  }
  v[208] = temp / 100;
  return v;
}

function scale(x: number[]): number[] {
  const out = new Array(x.length);
  for (let i = 0; i < x.length; i++) {
    const s = model.scaler_scale[i] || 1;
    out[i] = (x[i] - model.scaler_mean[i]) / s;
  }
  return out;
}

function mlpProba(xScaled: number[]): number[] {
  let h = xScaled;
  const { coefs, intercepts } = model.mlp;
  for (let layer = 0; layer < coefs.length; layer++) {
    const W = coefs[layer];
    const b = intercepts[layer];
    const next = new Array(b.length);
    const last = layer === coefs.length - 1;
    for (let j = 0; j < b.length; j++) {
      let s = b[j];
      for (let i = 0; i < h.length; i++) s += h[i] * W[i][j];
      next[j] = last ? s : Math.max(0, s);
    }
    h = next;
  }
  const m = Math.max(...h);
  const e = h.map((v) => Math.exp(v - m));
  const z = e.reduce((a, b) => a + b, 0) || 1;
  return e.map((v) => v / z);
}

function neighborsFor(type: string, solvent: string, temp: number): Neighbor[] {
  const props = solvents[solvent]?.props ?? new Array(16).fill(0);
  const rows = analogs.filter((a) => a.reaction_type === type);
  if (rows.length === 0) return [];
  const src: Analog[] = rows;
  const scored = src.map((a) => {
    let s = 0;
    for (let i = 0; i < 16; i++) {
      const d = (a.vec[192 + i] - props[i]) / (model.scaler_scale[192 + i] || 1);
      s += d * d;
    }
    const dt = (a.vec[208] - temp / 100) / (model.scaler_scale[208] || 1);
    s += dt * dt;
    return { ...a, dist: s };
  });
  scored.sort((a, b) => b.ee - a.ee || a.dist - b.dist);
  return scored.slice(0, 6).map((a) => ({
    id: a.id,
    catalyst_id: a.catalyst_id,
    ee: a.ee,
    yield: a.yield,
    reaction_type: a.reaction_type,
    solvent: a.solvent,
    temperature_c: a.temperature_c,
    doi: a.doi,
    year: a.year,
    dist: a.dist,
  }));
}

function rankFor(type: string, solvent: string, temp: number): RankedCatalyst[] {
  const feat = makeFeatures(type, solvent, temp);
  const proba = mlpProba(scale(feat));
  const mlpMap: Record<string, number> = {};
  model.classes.forEach((c, i) => {
    mlpMap[c] = proba[i];
  });

  const winners = model.type_winners[type] ?? [];
  const winCount = Object.fromEntries(winners) as Record<string, number>;
  const winMax = Math.max(1, ...winners.map((w) => w[1]));
  const lit = litByType.get(type) ?? new Map<string, LitStat>();

  const scores = catalysts.map((c) => {
    const mlp = c.id in mlpMap ? mlpMap[c.id] : null;
    const wins = winCount[c.id] ?? 0;
    const stat = lit.get(c.id);
    const glob = model.per_catalyst_ee[c.id];
    const litScore = stat ? (stat.maxEe / 100) * Math.min(1, stat.n / 3) : 0;
    const winScore = wins / winMax;
    const mlpScore = mlp ?? 0;
    const score = 0.42 * mlpScore + 0.38 * winScore + 0.2 * litScore;
    const expectedEe = stat?.meanEe ?? glob?.mean ?? 0;
    const maxEe = stat?.maxEe ?? glob?.max ?? 0;
    const nType = stat?.n ?? 0;
    const nTotal = glob?.n ?? 0;
    const reasonsZh: string[] = [];
    const reasonsEn: string[] = [];
    if (wins > 0) {
      reasonsZh.push(`本反应类型最高 ee 筛选中胜出 ${wins} 次`);
      reasonsEn.push(`Won the highest-ee screen for this reaction type ${wins}×`);
    }
    if (mlp != null) {
      reasonsZh.push(`MLP 指派概率 ${(mlp * 100).toFixed(0)}%（7 类模型）`);
      reasonsEn.push(`MLP assignment probability ${(mlp * 100).toFixed(0)}% (7-class model)`);
    }
    if (nType > 0) {
      reasonsZh.push(`本类型 ${nType} 条记录，最高 ee ${maxEe.toFixed(0)}%`);
      reasonsEn.push(`${nType} records of this type, max ee ${maxEe.toFixed(0)}%`);
    } else if (nTotal > 0) {
      reasonsZh.push(`库中共 ${nTotal} 条，均未覆盖本反应类型`);
      reasonsEn.push(`${nTotal} records in the library, none of this reaction type`);
    }
    if (!reasonsZh.length) {
      reasonsZh.push("样本不足，仅按骨架先验排序");
      reasonsEn.push("Too few examples; ranked by scaffold prior only");
    }
    return {
      rank: 0,
      id: c.id,
      name: c.name,
      name_zh: c.name_zh,
      className: c.class,
      score,
      mlp,
      expectedEe,
      maxEe,
      nType,
      nTotal,
      wins,
      modeled: mlp != null,
      smiles: c.smiles,
      reasonZh: reasonsZh.join(" · "),
      reasonEn: reasonsEn.join(" · "),
      bestDoi: stat?.doi ?? null,
    } satisfies RankedCatalyst;
  });

  scores.sort((a, b) => b.score - a.score || b.maxEe - a.maxEe);
  return scores.map((s, i) => ({ ...s, rank: i + 1 }));
}

export function assign(type: string, solvent: string, temp: number): Assignment {
  const ranked = rankFor(type, solvent, temp);
  const neighbors = neighborsFor(type, solvent, temp);
  const scan: ScanCell[] = [];
  for (const s of SCAN_SOLVENTS) {
    for (const t of SCAN_TEMPS) {
      const top = rankFor(type, s, t)[0];
      scan.push({
        solvent: s,
        temp: t,
        topId: top.id,
        topName: top.name,
        score: top.score,
      });
    }
  }
  return { ranked, neighbors, scan };
}

export function exampleSmiles(type: string): { reaction: string; additive: string } {
  const row =
    reactions.find((r) => r.reaction_type === type && r.ee >= 80) ??
    reactions.find((r) => r.reaction_type === type);
  return {
    reaction: row?.reaction_smiles ?? "",
    additive: row?.additive_smiles ?? "",
  };
}

export const EXAMPLE_SMILES =
  "c1ccc(-c2ccc3ccccc3n2)cc1.CCOC(=O)C1=C(C)NC(C)=C(C(=O)OCC)C1>>c1ccc(C2CCc3ccccc3N2)cc1";

export type ConditionPick = {
  catalyst_id: string;
  name: string;
  name_zh: string;
  solvent: string;
  temperature_c: number;
  expectedEe: number;
  maxEe: number;
  score: number;
};

export type PaperRef = {
  doi: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  ee: number;
};

export type Recommendation = {
  type: string;
  sim: number;
  primary: ConditionPick;
  alts: ConditionPick[];
  refs: PaperRef[];
};

const analogById = Object.fromEntries(analogs.map((a) => [a.id, a])) as Record<string, Analog>;

type Indexed = {
  row: (typeof reactions)[number];
  grams: [Set<string>, Set<string>, Set<string>];
  tokens: [string[], string[], string[]];
};

const INDEX: Indexed[] = reactions.map((row) => ({
  row,
  grams: [gramSet(row.reaction_smiles), gramSet(row.substrate_smiles), gramSet(row.product_smiles)],
  tokens: [molTokens(row.reaction_smiles), molTokens(row.substrate_smiles), molTokens(row.product_smiles)],
}));

function gramSet(s: string): Set<string> {
  const t = s.replace(/\s+/g, "");
  const out = new Set<string>();
  const n = 4;
  if (t.length <= n) {
    if (t) out.add(t);
    return out;
  }
  for (let i = 0; i <= t.length - n; i++) out.add(t.slice(i, i + n));
  return out;
}

function dice(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let n = 0;
  for (const x of a) if (b.has(x)) n++;
  return (2 * n) / (a.size + b.size);
}

function molTokens(s: string): string[] {
  return s.replace(/\s+/g, "").split(/>>|>|\./).filter(Boolean);
}

function tokenJaccard(q: string[], t: string[]): number {
  const A = new Set(q);
  const B = new Set(t);
  let n = 0;
  for (const x of A) if (B.has(x)) n++;
  const u = A.size + B.size - n;
  return u ? n / u : 0;
}

function similarity(query: string, target: string): number {
  const q = query.replace(/\s+/g, "");
  const t = target.replace(/\s+/g, "");
  if (!q || !t) return 0;
  if (q === t) return 1;
  if (t.includes(q) || q.includes(t)) return Math.min(0.95, q.length / Math.max(t.length, 1) + 0.4);
  return Math.max(dice(gramSet(q), gramSet(t)), tokenJaccard(molTokens(q), molTokens(t)));
}

function scoreIndexed(qGrams: Set<string>, qTokens: string[], q: string, item: Indexed): number {
  let best = 0;
  for (let i = 0; i < 3; i++) {
    const target = i === 0 ? item.row.reaction_smiles : i === 1 ? item.row.substrate_smiles : item.row.product_smiles;
    const t = target.replace(/\s+/g, "");
    if (!t) continue;
    if (q === t) return 1;
    if (t.includes(q) || q.includes(t)) best = Math.max(best, 0.92);
    best = Math.max(best, dice(qGrams, item.grams[i]), tokenJaccard(qTokens, item.tokens[i]));
  }
  return best;
}

function blendStructure(hits: { row: (typeof reactions)[number]; sim: number }[]): number[] {
  const acc = new Array(192).fill(0);
  let wsum = 0;
  for (const h of hits.slice(0, 8)) {
    const a = analogById[h.row.id];
    if (!a) continue;
    const w = Math.max(h.sim, 0.04);
    for (let i = 0; i < 192; i++) acc[i] += a.vec[i] * w;
    wsum += w;
  }
  if (wsum === 0) {
    const c = getCentroid(hits[0]?.row.reaction_type ?? reactions[0].reaction_type);
    return c.slice(0, 192);
  }
  return acc.map((v) => v / wsum);
}

function featuresFrom(structure: number[], solvent: string, temp: number): number[] {
  const v = new Array(209);
  for (let i = 0; i < 192; i++) v[i] = structure[i] || 0;
  const props = solvents[solvent]?.props;
  if (props) {
    for (let i = 0; i < 16; i++) v[192 + i] = props[i];
  } else {
    for (let i = 0; i < 16; i++) v[192 + i] = 0;
  }
  v[208] = temp / 100;
  return v;
}

function rankWithFeatures(feat: number[], type: string): RankedCatalyst[] {
  const proba = mlpProba(scale(feat));
  const mlpMap: Record<string, number> = {};
  model.classes.forEach((c, i) => {
    mlpMap[c] = proba[i];
  });

  const winners = model.type_winners[type] ?? [];
  const winCount = Object.fromEntries(winners) as Record<string, number>;
  const winMax = Math.max(1, ...winners.map((w) => w[1]));
  const lit = litByType.get(type) ?? new Map<string, LitStat>();

  const scores = catalysts.map((c) => {
    const mlp = c.id in mlpMap ? mlpMap[c.id] : null;
    const wins = winCount[c.id] ?? 0;
    const stat = lit.get(c.id);
    const glob = model.per_catalyst_ee[c.id];
    const litScore = stat ? (stat.maxEe / 100) * Math.min(1, stat.n / 3) : 0;
    const winScore = wins / winMax;
    const mlpScore = mlp ?? 0;
    const score = 0.42 * mlpScore + 0.38 * winScore + 0.2 * litScore;
    return {
      rank: 0,
      id: c.id,
      name: c.name,
      name_zh: c.name_zh,
      className: c.class,
      score,
      mlp,
      expectedEe: stat?.meanEe ?? glob?.mean ?? 0,
      maxEe: stat?.maxEe ?? glob?.max ?? 0,
      nType: stat?.n ?? 0,
      nTotal: glob?.n ?? 0,
      wins,
      modeled: mlp != null,
      smiles: c.smiles,
      reasonZh: "",
      reasonEn: "",
      bestDoi: stat?.doi ?? null,
    } satisfies RankedCatalyst;
  });

  scores.sort((a, b) => b.score - a.score || b.maxEe - a.maxEe);
  return scores.map((s, i) => ({ ...s, rank: i + 1 }));
}

function toPick(row: RankedCatalyst, solvent: string, temp: number): ConditionPick {
  return {
    catalyst_id: row.id,
    name: row.name,
    name_zh: row.name_zh,
    solvent,
    temperature_c: temp,
    expectedEe: row.expectedEe,
    maxEe: row.maxEe,
    score: row.score,
  };
}

function refsFor(
  catalystId: string,
  type: string,
  pool: { row: (typeof reactions)[number] }[],
): PaperRef[] {
  const all = reactions.filter((r) => r.catalyst_id === catalystId);
  const byDoi = new Map<string, PaperRef & { n: number; typeHit: number }>();
  for (const r of all) {
    if (!r.doi || r.doi.startsWith("ord-")) continue;
    const prev = byDoi.get(r.doi);
    const typeHit = r.reaction_type === type ? 1 : 0;
    if (!prev) {
      byDoi.set(r.doi, {
        doi: r.doi,
        title: r.title,
        authors: r.authors,
        journal: r.journal,
        year: r.year,
        ee: r.ee,
        n: 1,
        typeHit,
      });
    } else {
      prev.n += 1;
      prev.typeHit += typeHit;
      if (r.ee > prev.ee) prev.ee = r.ee;
    }
  }
  for (const h of pool) {
    const r = h.row;
    if (r.catalyst_id !== catalystId || !r.doi || r.doi.startsWith("ord-")) continue;
    const prev = byDoi.get(r.doi);
    if (prev) prev.typeHit += 2;
  }
  return [...byDoi.values()]
    .sort((a, b) => b.typeHit - a.typeHit || b.n - a.n || b.ee - a.ee)
    .slice(0, 3)
    .map(({ n: _n, typeHit: _t, ...p }) => p);
}

function fallbackRec(): Recommendation {
  const type = reactions[0]?.reaction_type ?? "";
  const ranked = rankFor(type || "transfer hydrogenation (quinoline)", "toluene", 25);
  const primary = toPick(ranked[0], "toluene", 25);
  return {
    type,
    sim: 0,
    primary,
    alts: ranked.slice(1, 5).map((r) => toPick(r, "toluene", 25)),
    refs: refsFor(primary.catalyst_id, type, []),
  };
}

export function recommendFromSmiles(raw: string): Recommendation | null {
  const q = String(raw ?? "").replace(/\s+/g, "").trim();
  if (q.length < 2) return null;

  try {
    const qGrams = gramSet(q);
    const qTokens = molTokens(q);
    const scored = INDEX.map((item) => ({
      row: item.row,
      sim: scoreIndexed(qGrams, qTokens, q, item),
    })).sort((a, b) => b.sim - a.sim || b.row.ee - a.row.ee);

    const typeScore = new Map<string, number>();
    for (const h of scored.slice(0, 40)) {
      const w = Math.max(h.sim, 0.01) * (0.25 + h.row.ee / 100);
      typeScore.set(h.row.reaction_type, (typeScore.get(h.row.reaction_type) ?? 0) + w);
    }
    let type = scored[0].row.reaction_type;
    let bestT = -1;
    for (const [k, v] of typeScore) {
      if (v > bestT) {
        bestT = v;
        type = k;
      }
    }

    const pool = scored.filter((h) => h.row.reaction_type === type).slice(0, 24);
    const structure = blendStructure(scored.slice(0, 8));

    const condScore = new Map<string, { solvent: string; temp: number; n: number; maxEe: number; cat: string }>();
    for (const h of pool) {
      const k = `${h.row.solvent}|${h.row.temperature_c}`;
      const prev = condScore.get(k);
      if (!prev) {
        condScore.set(k, {
          solvent: h.row.solvent,
          temp: h.row.temperature_c,
          n: 1,
          maxEe: h.row.ee,
          cat: h.row.catalyst_id,
        });
      } else {
        prev.n += 1;
        if (h.row.ee > prev.maxEe) {
          prev.maxEe = h.row.ee;
          prev.cat = h.row.catalyst_id;
        }
      }
    }

    let litCond = {
      solvent: pool[0].row.solvent,
      temp: pool[0].row.temperature_c,
      cat: pool[0].row.catalyst_id,
      n: 1,
      maxEe: pool[0].row.ee,
    };
    let bestC = -1;
    for (const c of condScore.values()) {
      const s = c.maxEe * (0.4 + 0.6 * Math.min(1, c.n / 5));
      if (s > bestC) {
        bestC = s;
        litCond = c;
      }
    }

    const pickSolvent = litCond.solvent;
    const pickTemp = litCond.temp;
    let pickRanked = rankWithFeatures(featuresFrom(structure, pickSolvent, pickTemp), type);
    const litCat = pickRanked.find((r) => r.id === litCond.cat);
    if (litCat && scored[0].sim >= 0.35) {
      pickRanked = [litCat, ...pickRanked.filter((r) => r.id !== litCat.id)];
    }
    if (!pickRanked[0]) return fallbackRec();

    const primary = toPick(pickRanked[0], pickSolvent, pickTemp);
    const litAtPick = condScore.get(`${pickSolvent}|${pickTemp}`);
    if (litAtPick) primary.maxEe = litAtPick.maxEe;
    const alts = pickRanked.slice(1, 5).map((r) => toPick(r, pickSolvent, pickTemp));
    const refs = refsFor(primary.catalyst_id, type, pool);

    return { type, sim: scored[0].sim, primary, alts, refs };
  } catch {
    return fallbackRec();
  }
}


