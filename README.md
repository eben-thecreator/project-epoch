# Project Epoch — SCHIS

**A Spatial Cultural Heritage Information System (SCHIS) for Ghana's museums, monuments, and material culture.**

Project Epoch is a full-stack GIS web platform that documents, maps, and showcases national heritage assets. It combines a PostGIS-powered spatial database with an interactive map experience and an asset-management back office — built to demonstrate how geomatics technology can support heritage documentation and conservation.

> **Thesis context:** This system was designed and built as the practical component of a geomatic engineering thesis on the application of GIS to cultural heritage management in Ghana.

---

## Features

### Interactive Heritage Map
- **PostGIS spatial layers** — heritage assets rendered as points, polygons, and lines via `ST_AsGeoJSON`, alongside reference layers (regions, districts, roads, rivers, protected areas)
- **Marker clustering** with category-aware symbology and adaptive zoom behaviour
- **Full-text search** backed by PostgreSQL `tsvector` + GIN indexes (⌘K / Ctrl+K)
- **Temporal filtering** by period/year range across pre-colonial, colonial, and post-independence eras
- **Light/dark cartography** with multiple basemaps including satellite imagery
- **Asset dossier side panel** with media carousel and fly-to navigation

### Digital Catalogues
- Artifact collection, museum spaces, textile catalogue, and photo/document archive
- Category-filtered browsing with detail pages and 3D model viewing (`react-three-fiber`)

### Asset Management Back Office
- CRUD for heritage assets with 40+ descriptive, dimensional, temporal, and provenance fields
- Bulk media upload (images, video, audio, 3D models) with per-asset galleries
- Data completeness scoring and verification workflow fields

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Mapping | Leaflet, react-leaflet, leaflet.markercluster |
| 3D | three.js, @react-three/fiber, @react-three/drei |
| Backend | Node.js, Express |
| Database | PostgreSQL + PostGIS, node-pg-migrate |
| Auth | Environment-gated admin API |

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- PostgreSQL ≥ 14 with the **PostGIS** extension

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
#    then edit .env with your database credentials

# 3. Apply database migrations
npm run migrate

# 4. Start the API server (http://localhost:3000)
npm run server

# 5. In a second terminal, start the frontend dev server
npm run dev
```

### Scripts

| Script | Purpose |
| :--- | :--- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Production frontend build |
| `npm run preview` | Preview the production build |
| `npm run server` | Express API with hot reload (nodemon) |
| `npm start` | Express API (production mode) |
| `npm run migrate` | Apply pending database migrations |
| `npm run migrate:create` | Create a new migration file |
| `npm run typecheck` | TypeScript project check |

---

## Project Structure

```
├── src/
│   ├── components/       # Shared UI (header, model viewer, cards)
│   ├── screens/
│   │   ├── Map/          # GIS map screen + layer/search/panel components
│   │   ├── CaseStudies/  # Catalogue screens (artifacts, museums, textiles…)
│   │   ├── MediaAdmin/   # Asset management back office
│   │   └── …             # Home, Gallery, Research, Blog, Contact…
│   └── lib/              # API helpers & utilities
├── server/
│   ├── index.js          # Express API + static uploads
│   ├── db.js             # PostgreSQL pool
│   └── schema.sql        # Database schema reference
├── migrations/           # node-pg-migrate migrations
├── public/images/        # Static imagery
└── entity_relationship_diagram.md
```

---

## Author

**Ebenezer Ankudey** — Geomatic Engineer
Research team: Amoah-Yeboah Abena Pokua · Ankudey Ebenezer · Elorm Dei-Zanga Aku
Academic supervisor: Professor Quaye Ballard
