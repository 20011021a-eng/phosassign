import rawAnalogs from "@/data/analogs.json";
import rawCatalysts from "@/data/catalysts.json";
import rawMetrics from "@/data/metrics.json";
import rawModel from "@/data/model.json";
import rawNeeded from "@/data/papers_needed.json";
import rawPapers from "@/data/papers.json";
import rawReactions from "@/data/reactions.json";
import rawSolvents from "@/data/solvents.json";

export type Catalyst = {
  id: string;
  name: string;
  name_zh: string;
  class: string;
  backbone: string;
  aryl: string;
  acidity: string;
  smiles: string;
  notes: string;
  has_metal: boolean;
};

export type Reaction = {
  reaction_type: string;
  catalyst_id: string;
  solvent: string;
  temperature_c: number;
  ee: number;
  additive_smiles: string;
  additive_name: string;
  loading_molpct: number | null;
  doi: string;
  year: number;
  title: string;
  journal: string;
  authors: string;
  yield: number | null;
  source: string;
  access: string;
  notes: string;
  has_metal: boolean;
  reaction_smiles: string;
  product_smiles: string;
  substrate_smiles: string;
  id: string;
};

export type Analog = {
  id: string;
  vec: number[];
  catalyst_id: string;
  ee: number;
  yield: number | null;
  reaction_type: string;
  solvent: string;
  temperature_c: number;
  doi: string;
  year: number;
};

export type Paper = {
  doi: string;
  title: string;
  year: number;
  journal: string;
  authors: string;
  access: string;
  source: string;
  n_reactions: number;
  reaction_types: string[];
};

export type PaperNeeded = {
  year: number;
  title: string;
  doi: string;
  journal: string;
  reason: string;
};

export type Metrics = {
  n_reactions: number;
  n_assignment: number;
  n_catalysts_total: number;
  n_catalysts_modeled: number;
  n_reaction_types: number;
  feature_dim: number;
  mlp: { acc_mean: number; acc_min: number; acc_max: number; f1_mean: number; folds: { fold: number; acc: number; f1: number }[] };
  rf: { acc_mean: number; acc_min: number; acc_max: number; f1_mean: number; folds: { fold: number; acc: number; f1: number }[] };
  top_n: Record<string, { mean: number; folds: number[] }>;
  ee_r2_train: number;
  feature_importance: Record<string, number>;
  rare_catalysts: string[];
  method: string;
};

export type ModelJson = {
  classes: string[];
  scaler_mean: number[];
  scaler_scale: number[];
  mlp: { coefs: number[][][]; intercepts: number[][]; activation: string };
  rf_feature_importance: number[];
  per_catalyst_ee: Record<string, { mean: number; std: number; n: number; max: number }>;
  feature_blocks: [string, number, number][];
  type_winners: Record<string, [string, number][]>;
};

export const catalysts = rawCatalysts as Catalyst[];
export const reactions = rawReactions as Reaction[];
export const solvents = rawSolvents as Record<string, { props: number[] }>;
export const metrics = rawMetrics as Metrics;
export const papers = rawPapers as Paper[];
export const papersNeeded = rawNeeded as PaperNeeded[];
export const analogs = rawAnalogs as Analog[];
export const model = rawModel as unknown as ModelJson;

export const catalystById = Object.fromEntries(catalysts.map((c) => [c.id, c])) as Record<string, Catalyst>;

const typeCount = new Map<string, number>();
for (const r of reactions) typeCount.set(r.reaction_type, (typeCount.get(r.reaction_type) ?? 0) + 1);

export const reactionTypes = [...typeCount.entries()]
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .map(([t]) => t);

export const typeCounts = typeCount;

export const TYPE_ZH: Record<string, string> = {
  "transfer hydrogenation (quinoline)": "喹啉转移氢化",
  "hydantoin condensation": "乙内酰脲缩合",
  "reductive amination": "还原胺化",
  "Mannich (silyl ketene acetal)": "Mannich（硅基烯酮缩醛）",
  "Pictet–Spengler": "Pictet–Spengler",
  "Pictet–Spengler (CF3-ketone)": "CF₃-Pictet–Spengler",
  "Biginelli-like": "Biginelli 类反应",
  "Friedel–Crafts (indolizine)": "吲哚嗪傅–克",
  "aza-Friedel–Crafts (indole)": "氮杂傅–克（吲哚）",
  "aza-Friedel–Crafts (THIQUINOL)": "氮杂傅–克（THIQUINOL）",
  "epoxidation (H2O2)": "双氧水环氧化",
  "C–P phosphinylation (DHIQ)": "二氢异喹啉膦基化",
  "Ugi-4CR": "Ugi 四组分",
  "transfer hydrogenation (imine)": "亚胺转移氢化",
  "meso-anhydride methanolysis": "meso-酸酐甲醇解",
  "atroposelective N-arylbenzimidazole": "轴手性 N-芳基苯并咪唑",
  "Rauhut–Currier": "Rauhut–Currier",
  "atroposelective diaryl ether acylation": "轴手性二芳基醚酰化",
  "phosphine [3+2] (allenoate–imine)": "膦催化 [3+2]",
  "oxa-Diels–Alder (IEDDA)": "氧杂 Diels–Alder",
  "sulfa-Michael": "硫杂 Michael",
  "Wolff rearrangement": "Wolff 重排",
  "spiroketalization": "螺缩酮化",
  "Nazarov cyclization": "Nazarov 环化",
  "transfer hydrogenation (benzoxazine)": "苯并噁嗪转移氢化",
  Strecker: "Strecker",
  hydrophosphonylation: "氢膦酸化",
  "N-alkylation of indoles": "吲哚 N-烷基化",
  "[4+2] dienecarbamate": "[4+2] 二烯氨基甲酸酯",
  "[6+2] pyrrole-2-methide": "[6+2] 吡咯-2-次甲基",
  "photo-CPA Giese-type": "光-CPA Giese",
  "atroposelective bisindole": "轴手性联吲哚",
  "atroposelective anthrone oxime": "轴手性蒽酮肟",
  "propargylic substitution (isoindolinone–indole)": "炔丙基取代（异吲哚酮–吲哚）",
  "sulfinamidine amination": "亚磺脒胺化",
  "axially chiral sulfoxide (squaramide, not CPA)": "轴手性亚砜（方酰胺，非 CPA）",
  "atroposelective cyclobutanamide": "轴手性环丁酰胺",
  "transfer hydrogenation (cyclic imine)": "环状亚胺转移氢化",
  "amide formylation (CO2/silane)": "酰胺甲酰化（CO₂/硅烷）",
  "benzoin condensation": "安息香缩合",
  "γ-butyrolactone (P(I) relay)": "γ-丁内酯（P(I) 接力）",
  "γ-butyrolactone (P(I) relay, racemic)": "γ-丁内酯（P(I) 接力）",
  "thiol formylation (CO2)": "硫醇甲酰化（CO₂）",
  "hydrodefluorination (Ar–F)": "芳基氟氢脱氟",
  "atroposelective N-arylbenzimidazole (C–C cleavage)": "轴手性 N-芳基苯并咪唑（C–C 断裂）",
  "gem-difluoro [4+2] indoloquinazoline": "偕二氟 [4+2] 吲哚喹唑啉",
  "para-C–H azobenzene (oxazolone)": "偶氮苯对位 C–H（噁唑酮）",
  "N–N axial 3,3′-bisquinazolinone": "N–N 轴手性 3,3′-联喹唑啉酮",
  "spirooxindole-dihydroquinazolinone": "螺氧化吲哚-二氢喹唑啉酮",
  "isoquinoline phosphonation": "异喹啉膦酸化",
  "ketimine nitro-Mannich (BIMP)": "酮亚胺硝基 Mannich（BIMP）",
  "8-aminoquinoline transfer hydrogenation": "8-氨基喹啉转移氢化",
  "DAP 1,4-reduction (acyl pyrrole)": "DAP 1,4-还原（酰基吡咯）",
  "phosphenium imine hydroboration": "磷鎓亚胺硼氢化",
  "3-azabicyclo[3.1.1]heptane ATH": "3-氮杂双环[3.1.1]庚烷转移氢化",
  "review (NHCP)": "综述（NHCP）",
  "review (mNHP)": "综述（mNHP）",
  "review (NHC–phosphinidene)": "综述（NHC–膦烯）",
  "synthesis (NHC–phosphinidene)": "合成（NHC–膦烯）",
  "C–H borylation (heteroarene)": "杂芳 C–H 硼化",
  "carboxylic acid nitrilation": "羧酸腈化",
  "photo reductive N-arylation": "光促还原 N-芳基化",
  "N–N coupling (nitroarene–aniline)": "N–N 偶联（硝基芳烃–苯胺）",
  "electrophilic C–H cyanation": "亲电 C–H 氰化",
  "deoxyfluorination (stoichiometric P-triamide)": "脱氧氟化（计量磷三酰胺）",
  "tandem C/N-difunctionalization (nitroarene)": "串联 C/N 双官能团化（硝基芳烃）",
  "primary amination (HNO/Nef)": "一级胺化（Nef/HNO）",
  "nitroalkane–boronic C–N coupling": "硝基烷烃–硼酸 C–N 偶联",
  "amide serial condensation (2-amidopyridine)": "酰胺接力缩合（2-酰胺吡啶）",
  "review (organopnictogen redox)": "综述（第 15 族氧化还原）",
  "highlight (PIII/PV C–N)": "亮点（P(III)/P(V) C–N）",
  "electrochemical phosphine oxide reduction": "电化学膦氧还原",
  "18O KIE (nitroarene N-arylation)": "¹⁸O KIE（硝基芳烃 N-芳基化）",
};

export const SOLVENT_ZH: Record<string, string> = {
  toluene: "甲苯",
  benzene: "苯",
  mesitylene: "均三甲苯",
  xylene: "二甲苯",
  dichloromethane: "二氯甲烷",
  chloroform: "氯仿",
  "1,2-dichloroethane": "1,2-二氯乙烷",
  chlorobenzene: "氯苯",
  tetrahydrofuran: "四氢呋喃",
  "diethyl ether": "乙醚",
  "1,4-dioxane": "1,4-二氧六环",
  acetonitrile: "乙腈",
  "ethyl acetate": "乙酸乙酯",
  methanol: "甲醇",
  ethanol: "乙醇",
  isopropanol: "异丙醇",
  acetone: "丙酮",
  hexane: "正己烷",
  cyclohexane: "环己烷",
  mtbe: "MTBE",
  dme: "DME",
  "2-methylthf": "2-MeTHF",
  cpme: "CPME",
  benzotrifluoride: "三氟甲苯",
  "o-xylene": "邻二甲苯",
  "o-dichlorobenzene": "邻二氯苯",
  "carbon tetrachloride": "四氯化碳",
  nitromethane: "硝基甲烷",
  decalin: "十氢萘",
  "tert-butylbenzene": "叔丁基苯",
  "1,1,2,2-tetrachloroethane": "1,1,2,2-四氯乙烷",
  butyronitrile: "丁腈",
  "tert-butyl acetate": "乙酸叔丁酯",
};

export const SOLVENT_SHORT: Record<string, string> = {
  toluene: "PhMe",
  benzene: "PhH",
  dichloromethane: "DCM",
  chloroform: "CHCl₃",
  "1,2-dichloroethane": "DCE",
  chlorobenzene: "PhCl",
  tetrahydrofuran: "THF",
  "diethyl ether": "Et₂O",
  acetonitrile: "MeCN",
  methanol: "MeOH",
  ethanol: "EtOH",
  xylene: "Xyl",
  "o-xylene": "o-Xyl",
  "o-dichlorobenzene": "o-DCB",
  "carbon tetrachloride": "CCl₄",
  nitromethane: "MeNO₂",
  mesitylene: "Mes",
  cpme: "CPME",
  decalin: "Decalin",
  "tert-butylbenzene": "tBuPh",
  "1,1,2,2-tetrachloroethane": "TCE",
  butyronitrile: "nPrCN",
  "tert-butyl acetate": "tBuOAc",
};

export const CLASS_ZH: Record<string, string> = {
  "BINOL-CPA": "BINOL 磷酸",
  "H8-BINOL-CPA": "H₈-BINOL 磷酸",
  "SPINOL-CPA": "SPINOL 磷酸",
  NTPA: "N-三氟甲磺酰磷酰胺",
  IDP: "咪唑二磷",
  IDPi: "IDPi",
  "TADDOL-CPA": "TADDOL 磷酸",
  "VANOL-CPA": "VANOL 磷酸",
  phosphine: "手性膦",
  "phosphine-oxide": "手性膦氧",
  "P(I)-phosphinidene": "P(I) 膦烯 / NHC–磷宾",
  DAP: "1,3,2-二氮磷杂环戊烯",
  BIMP: "手性亚氨基膦",
  "point-chiral CPA": "点手性磷酸",
  phosphetane: "磷杂环丁烷 P(III)/P(V)",
  "phosphorus-triamide": "非三角磷三酰胺",
  phosphole: "磷杂环戊二烯",
};

export function typeLabel(type: string, lang: "zh" | "en") {
  return lang === "zh" ? (TYPE_ZH[type] ?? type) : type;
}

export function solventLabel(id: string, lang: "zh" | "en") {
  if (lang === "zh") return SOLVENT_ZH[id] ?? id;
  return id;
}

export function classLabel(id: string, lang: "zh" | "en") {
  return lang === "zh" ? (CLASS_ZH[id] ?? id) : id;
}

export function doiHref(doi: string) {
  if (!doi || doi.startsWith("ord-")) return null;
  return `https://doi.org/${doi}`;
}

export const SCAN_SOLVENTS = [
  "dichloromethane",
  "tetrahydrofuran",
  "toluene",
  "1,2-dichloroethane",
  "diethyl ether",
  "chlorobenzene",
] as const;

export const SCAN_TEMPS = [-78, -40, -20, 0, 25, 40] as const;

export const EXAMPLES = [
  { type: "transfer hydrogenation (quinoline)", solvent: "benzene", temp: 60 },
  { type: "Pictet–Spengler", solvent: "toluene", temp: 23 },
  { type: "hydantoin condensation", solvent: "toluene", temp: 20 },
  { type: "epoxidation (H2O2)", solvent: "chloroform", temp: 0 },
  { type: "phosphine [3+2] (allenoate–imine)", solvent: "toluene", temp: 25 },
  { type: "Pictet–Spengler (CF3-ketone)", solvent: "toluene", temp: 25 },
] as const;

export const SOLVENT_KEYS = Object.keys(solvents);
