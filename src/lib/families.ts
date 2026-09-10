export type FamilyStatus = "in_model" | "in_catalog" | "catalog_no_ee" | "missing_ee";

export type Family = {
  id: string;
  class: string;
  class_zh: string;
  status: FamilyStatus;
  asymmetric: boolean;
  note_zh: string;
  note_en: string;
};

/** Coverage of metal-free phosphorus organocatalyst families. Assignment only uses rows with ee. */
export const FAMILIES: Family[] = [
  {
    id: "cpa",
    class: "BINOL / H8-BINOL / SPINOL / TADDOL / VANOL CPA",
    class_zh: "BINOL / H₈-BINOL / SPINOL / TADDOL / VANOL 磷酸",
    status: "in_model",
    asymmetric: true,
    note_zh: "主库。TRIP、STRIP、H8-TRIP 等已进 MLP。",
    note_en: "Core library. TRIP, STRIP, H8-TRIP etc. enter the MLP.",
  },
  {
    id: "ntpa-idp",
    class: "NTPA / IDP / IDPi",
    class_zh: "NTPA / IDP / IDPi",
    status: "in_model",
    asymmetric: true,
    note_zh: "更强 Brønsted 酸；IDPi-F6 为 MLP 类。",
    note_en: "Stronger Brønsted acids; IDPi-F6 is an MLP class.",
  },
  {
    id: "phosphine",
    class: "Chiral phosphines (Kwon, HypPhos, SITCP, Xiao, Peng, Wei)",
    class_zh: "手性膦（Kwon / HypPhos / SITCP / Xiao / Peng / Wei）",
    status: "in_catalog",
    asymmetric: true,
    note_zh: "已入名录与反应库。[3+2] 等由文献胜出规则指派；多数不足 2 次最高 ee 胜出，故不进 MLP 7 类。Fu 二茂铁膦因含 Fe 排除。",
    note_en: "In the catalog. [3+2] is assigned via literature winners; most lack ≥2 highest-ee wins so they stay out of the 7-class MLP. Fu ferrocenyl phosphines excluded (contain Fe).",
  },
  {
    id: "phosphine-oxide",
    class: "Chiral phosphine oxides",
    class_zh: "手性膦氧",
    status: "in_catalog",
    asymmetric: true,
    note_zh: "BINAPO、螺环膦氧已入名录，样本很少。",
    note_en: "BINAPO and a spiro phosphine oxide are listed; few examples.",
  },
  {
    id: "p1",
    class: "NHC–phosphinidene P(I)",
    class_zh: "NHC 稳定 P(I) 膦烯 / 磷宾",
    status: "catalog_no_ee",
    asymmetric: false,
    note_zh:
      "Mandal 系列：IMe=PPh（Chem. Eur. J. 2021 酰胺甲酰化；JACS 2024 安息香 + γ-丁内酯 4a–4q）与 mNHP（JACS 2025 硫醇甲酰化 9a–9y、Ar–F 氢脱氟 10a–10f）。全部消旋、无 ee，入名录但不进最高 ee 指派。脂肪酰胺 3u–3y 结构未确认，未收录。金属配合物（Ir/Zn/Cu）已读并排除。",
    note_en:
      "Mandal series: IMe=PPh (Chem. Eur. J. 2021 amide formylation; JACS 2024 benzoin and γ-butyrolactone 4a–4q) and mNHP (JACS 2025 thiol formylation 9a–9y, Ar–F HDF 10a–10f). All racemic, no ee — catalogued but excluded from highest-ee assignment. Aliphatic amides 3u–3y skipped (structures not confirmed). Metal complexes (Ir/Zn/Cu) read and excluded.",
  },
  {
    id: "dap",
    class: "1,3,2-Diazaphospholenes / phosphenium",
    class_zh: "1,3,2-二氮磷杂环戊烯 / 磷鎓",
    status: "in_catalog",
    asymmetric: true,
    note_zh:
      "Cramer 2018 P17 已入名录：酰基吡咯 1,4-还原，甲苯 2 °C，97% 产率、87% ee（Infoscience 开放全文+SI）。Speed 2019 DAP-OTf 1-28 已从 Dalhousie 开放学位论文入库：5-(2-萘基)-3,4-二氢-2H-吡咯，THF −35 °C，HBpin，96:4 er（92% ee）。不重训 MLP。",
    note_en:
      "Cramer 2018 P17 is in the catalog: acyl-pyrrole 1,4-reduction in toluene at 2 °C, 97% yield, 87% ee (Infoscience OA paper+SI). Speed 2019 DAP-OTf 1-28 ingested from the Dalhousie OA thesis: 5-(2-naphthyl)-3,4-dihydro-2H-pyrrole, THF −35 °C, HBpin, 96:4 er (92% ee). MLP not retrained.",
  },
  {
    id: "bimp",
    class: "Chiral iminophosphoranes (BIMP)",
    class_zh: "手性亚氨基膦（BIMP）",
    status: "in_catalog",
    asymmetric: true,
    note_zh: "Dixon 2013 BIMP 4a 已入名录：酮亚胺硝基 Mannich，neat MeNO2，最高 95% ee（PMC 开放全文）。",
    note_en: "Dixon 2013 BIMP 4a is in the catalog: ketimine nitro-Mannich in neat MeNO2, up to 95% ee (PMC OA).",
  },
  {
    id: "piii-pv",
    class: "P(III)/P(V) phosphetanes and phosphorus triamides (Radosevich)",
    class_zh: "P(III)/P(V) 磷杂环丁烷 / 磷三酰胺（Radosevich）",
    status: "catalog_no_ee",
    asymmetric: false,
    note_zh:
      "MIT Radosevich 组 2021–2026：六甲基磷杂环丁烷氧化物（光促 N-芳基化、N–N 偶联、2-酰胺吡啶、氮杂䓬/氨基酰苯胺/苯并咪唑）、1,2,2,4-四甲基（一级胺化 P5 / 硝基烷烃 C–N P4）、1-异丙基五甲基（吲哚 C–H 氰化 Table 2）、1-苯基-2,2,3-三甲基（羧酸腈化）与非三角磷三酰胺（杂芳 C–H 硼化）。全部消旋、ee=0，入名录不进最高 ee 指派。含 Pd/Ir 的金属磷烷、计量磷鎓 C–H 氧化加成与计量脱氧氟化已排除。正文+SI 分离产率已入库。",
    note_en:
      "MIT Radosevich 2021–2026: hexamethylphosphetane oxide (photo N-arylation, N–N coupling, 2-amidopyridines, azepine/aminoanilide/benzimidazole), 1,2,2,4-tetramethyl (primary amination P5 / nitroalkane C–N P4), 1-isopropylpentamethyl (indole C–H cyanation Table 2), 1-phenyl-2,2,3-trimethyl (carboxylic acid nitrilation), and a nontrigonal phosphorus triamide (heteroarene C–H borylation). All racemic, ee=0 — catalogued but excluded from highest-ee assignment. Pd/Ir metallophosphoranes, stoichiometric phosphenium C–H OA, and stoichiometric deoxyfluorination excluded. Main-text + SI isolated yields ingested.",
  },
  {
    id: "phosphonium",
    class: "Chiral phosphonium salts",
    class_zh: "手性鏻盐",
    status: "missing_ee",
    asymmetric: true,
    note_zh: "Maruoka / Ooi / Shirakawa 相转移与离子对催化。有 ee，尚未入名录。",
    note_en: "Maruoka / Ooi / Shirakawa phase-transfer and ion-pairing. Asymmetric; not yet in the catalog.",
  },
];
