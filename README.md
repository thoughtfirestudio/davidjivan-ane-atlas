# ANE Atlas — The Land Between Empires

An interactive historical atlas of the Levant, 1200–539 BCE — the biblical kingdoms of Israel and Judah and the empires that crushed them. Live at **ane.davidjivan.net**.

Every moment of the atlas tells two stories at once, switchable with one toggle:

- **The text says** — the biblical narrative as the Judahite scribes wrote it
- **The ground says** — what the archaeology and the inscriptions actually show

## Stack

- React 18 + TypeScript + Vite
- Leaflet (react-leaflet) with CARTO Voyager basemaps
- All content in editable JSON/GeoJSON under `public/data/` — no React code changes needed to edit history

## Running locally

```bash
npm install
npm run dev        # dev server
npm run build      # typecheck + production build
npm run preview    # serve the built app
npm run validate:data   # validates every data file before shipping
```

## The data files (edit these, not the code)

| File | What it holds |
|------|---------------|
| `public/data/acts.json` | The five acts (title, year range, narrative, map focus) |
| `public/data/sites.geojson` | Points of interest with dual-voice popups |
| `public/data/core_kingdoms.geojson` | Israel/Judah polygons through their phases |
| `public/data/superpowers.geojson` | Empires: Egypt, Assyria, Babylon, Media, Persia |
| `public/data/neighbors.geojson` | Philistia, Phoenicia, Aram, Ammon, Moab, Edom, Midian |
| `public/data/trade_routes.geojson` | Via Maris + King's Highway |
| `public/data/campaign_arrows.geojson` | Military campaigns (visible only in their year) |
| `public/data/deportation_routes.geojson` | The three exile paths to Babylon |
| `public/data/events.json` | Anniversary popups (biblical + archaeological quotes) |
| `public/data/rulers.json` | The ruler wheel + dual verdicts |

### How a feature becomes visible

Every GeoJSON feature carries its own lifecycle:

```json
{
  "properties": {
    "name": "Kingdom of Israel",
    "kind": "kingdom",
    "mode": "both",
    "start": 930,   // BCE year it appears
    "end": 722,     // BCE year it disappears
    "color": "#2c4a6e",
    "label": "Israel",
    "popup": { "bible": "...", "archaeology": "...", "source": "..." }
  }
}
```

The year slider simply filters on `start`/`end` (BCE years run downward) and the narrative toggle filters on `mode`:

- `mode: "both"` — shown in both narrative views
- `mode: "biblical"` — shown only in "The text says"
- `mode: "archaeological"` — shown only in "The ground says"

Campaigns and deportations use `start == end` (their single year). To add, remove, or re-date a kingdom, an empire, or a site: edit the JSON, run `npm run validate:data`, rebuild.

### Borders are schematic

Polygon coordinates are simplified from the archaeological picture (Finkelstein & Silberman, Lipschits, standard historical atlases) — they communicate extent and change, not survey-grade boundaries. The study library's `07-study-library/ane-atlas/` folder documents the sourcing for every claim.

## Verification

```bash
npm run validate:data   # data integrity (structure, year ranges, coordinates)
node scripts/qa.mjs     # browser-level functional QA (layers, popups, toggle, mobile)
```

## The research layer

The historical spine, sources, and methodology live in the parent vault at `07-study-library/ane-atlas/` (README, core-ideas, sources-mentioned, supporting-research) — the app is the visualization; that folder is the argument.
