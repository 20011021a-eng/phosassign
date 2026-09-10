# PhosAssign

Recommend a metal-free phosphorus organocatalyst, solvent and temperature from a reaction SMILES.

**Live demo:** [https://20011021a-eng.github.io/phosassign/](https://20011021a-eng.github.io/phosassign/)

Paste a reaction SMILES (`A.B>>C`). The app returns:

- catalyst
- solvent
- temperature
- source literature (DOI)

Built from a curated literature catalog of enantioselective phosphorus organocatalysis (CPA, SPINOL, phosphetane oxides, and related scaffolds). Ranking blends a frozen MLP assignment model with nearest-neighbor literature matching.

## Local

```bash
npm install
npx vite --config vite.spa.config.ts
```

Static site build (GitHub Pages):

```bash
npx vite build --config vite.spa.config.ts
```
