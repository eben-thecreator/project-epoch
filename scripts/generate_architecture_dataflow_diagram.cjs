const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function generateSiteArchitectureDataFlowSVG() {
  const W = 1780;
  const H = 1380;

  const FONT_SANS = "'Segoe UI', -apple-system, BlinkMacSystemFont, Arial, sans-serif";
  const FONT_MONO = "'Consolas', 'Courier New', monospace";

  // Palette from the reference image:
  const COLOR_BG = '#ffffff';
  const COLOR_LINE = '#1e293b';
  const COLOR_STAR = '#cbd5e1';          // Neutral gray actor star
  const COLOR_PEACH = '#fed7aa';         // Soft peach / orange VM containers
  const COLOR_GREEN = '#bbf7d0';         // Soft pastel green storage buckets
  const COLOR_BLUE = '#bae6fd';          // Soft pastel sky-blue database cylinders
  const COLOR_CORAL = '#fca5a5';         // Soft salmon / coral auxiliary services
  const COLOR_GRAY_BOX = '#cbd5e1';      // Medium gray pipeline container
  const COLOR_WHITE = '#ffffff';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="background-color: ${COLOR_BG};">
  <defs>
    <!-- Solid Dark Arrowhead Marker -->
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="${COLOR_LINE}" />
    </marker>
    <!-- Reverse Arrowhead Marker -->
    <marker id="arrow-rev" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 10 1.5 L 0 5 L 10 8.5 z" fill="${COLOR_LINE}" />
    </marker>
  </defs>

  <style>
    text {
      font-family: ${FONT_SANS};
      fill: #0f172a;
      -webkit-font-smoothing: antialiased;
    }
    .code { font-family: ${FONT_MONO}; font-size: 9.5px; fill: #334155; }
    .lbl-title { font-size: 13px; font-weight: 700; text-anchor: middle; fill: #0f172a; }
    .lbl-sub { font-size: 9.5px; font-weight: 500; text-anchor: middle; fill: #475569; }
    .lbl-bracket { font-size: 12.5px; font-weight: 700; fill: #1e293b; }
    .lbl-flow { font-size: 10.5px; font-weight: 700; fill: #0f172a; }
    .lbl-flow-sub { font-size: 9px; font-weight: 500; fill: #475569; }
    .vm-tag { font-size: 12px; font-weight: 800; fill: #9a3412; }
    .line-flow { stroke: ${COLOR_LINE}; stroke-width: 1.6; fill: none; }
    .line-flow-dashed { stroke: ${COLOR_LINE}; stroke-width: 1.4; stroke-dasharray: 5, 4; fill: none; }
  </style>

  <!-- ================================================================= -->
  <!-- TOP BANNER (CLEAN & NON-OVERLAPPING ROW)                          -->
  <!-- ================================================================= -->
  <g transform="translate(60, 16)">
    <rect width="1660" height="34" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.2" rx="4" />
    <text x="20" y="22" font-size="14" font-weight="800" fill="#0f172a" letter-spacing="0.5">PROJECT EPOCH — SITE SYSTEM ARCHITECTURE &amp; DATA FLOW TOPOLOGY</text>
    <text x="680" y="22" font-size="11" font-weight="500" fill="#64748b">Ghana Spatial Cultural Heritage Information System (SCHIS) • React 18 / Express.js / PostGIS / Multer</text>
    <text x="1640" y="22" font-size="10.5" font-weight="700" fill="#059669" text-anchor="end">FIGURE 1 · UNIQUE SYSTEM TOPOLOGY</text>
  </g>


  <!-- ================================================================= -->
  <!-- TIER 1: USER ROLES & CLIENT PRESENTATION TIER                     -->
  <!-- ================================================================= -->

  <!-- ACTOR 1: PUBLIC RESEARCHERS & VISITORS (Star Shape, Top Left) -->
  <g transform="translate(105, 140)">
    <path d="M 0 -45 
             C 4 -45, 11 -25, 15 -20
             C 20 -15, 42 -15, 45 -12
             C 48 -9, 30 5, 27 10
             C 24 15, 34 38, 30 42
             C 26 46, 8 32, 0 32
             C -8 32, -26 46, -30 42
             C -34 38, -24 15, -27 10
             C -30 5, -48 -9, -45 -12
             C -42 -15, -20 -15, -15 -20
             C -11 -25, -4 -45, 0 -45 Z" 
          fill="${COLOR_STAR}" stroke="${COLOR_LINE}" stroke-width="1.8" />
    <text x="0" y="0" font-size="13" font-weight="800" text-anchor="middle">Public</text>
    <text x="0" y="15" font-size="13" font-weight="800" text-anchor="middle">Visitors</text>
    <text x="0" y="55" font-size="8.5" font-weight="600" text-anchor="middle" fill="#475569">Researchers · Students</text>
  </g>

  <!-- CLIENT APP 1: INTERACTIVE GIS ATLAS & DISCOVERY CANVAS -->
  <g transform="translate(210, 95)">
    <rect width="250" height="92" fill="${COLOR_WHITE}" stroke="${COLOR_LINE}" stroke-width="1.8" rx="8" />
    <text x="125" y="28" class="lbl-title" font-size="13">Interactive GIS Atlas (SPA)</text>
    <text x="125" y="46" class="lbl-sub">Leaflet 1.9 · react-leaflet · MarkerCluster</text>
    <text x="125" y="62" class="lbl-sub">⌘K Search · Era Timeline Slider · Facets</text>
    <text x="125" y="78" class="code" text-anchor="middle">src/screens/Map/</text>
  </g>

  <!-- CLIENT APP 2: 3D PHOTOGRAMMETRY & DIGITAL CATALOGUES -->
  <g transform="translate(480, 95)">
    <rect width="250" height="92" fill="${COLOR_WHITE}" stroke="${COLOR_LINE}" stroke-width="1.8" rx="8" />
    <text x="125" y="28" class="lbl-title" font-size="13">Digital Catalogues &amp; 3D Viewer</text>
    <text x="125" y="46" class="lbl-sub">Three.js · @react-three/fiber · GLTF/GLB</text>
    <text x="125" y="62" class="lbl-sub">Textiles (Kente/Adinkra) · Forts · Dossier</text>
    <text x="125" y="78" class="code" text-anchor="middle">src/screens/CaseStudies/</text>
  </g>

  <!-- CLIENT APP 3: CURATOR ASSET MANAGEMENT BACK OFFICE -->
  <g transform="translate(750, 95)">
    <rect width="250" height="92" fill="${COLOR_WHITE}" stroke="${COLOR_LINE}" stroke-width="1.8" rx="8" />
    <text x="125" y="28" class="lbl-title" font-size="13">Curator Back Office Portal</text>
    <text x="125" y="46" class="lbl-sub">40+ Metadata Fields · GPS GeoJSON Ingest</text>
    <text x="125" y="62" class="lbl-sub">Bulk Media Uploader · Verification Review</text>
    <text x="125" y="78" class="code" text-anchor="middle">src/screens/MediaAdmin/</text>
  </g>

  <!-- ACTOR 2: HERITAGE CURATORS & ADMINS (Star Shape, Top Right of Clients) -->
  <g transform="translate(1075, 140)">
    <path d="M 0 -45 
             C 4 -45, 11 -25, 15 -20
             C 20 -15, 42 -15, 45 -12
             C 48 -9, 30 5, 27 10
             C 24 15, 34 38, 30 42
             C 26 46, 8 32, 0 32
             C -8 32, -26 46, -30 42
             C -34 38, -24 15, -27 10
             C -30 5, -48 -9, -45 -12
             C -42 -15, -20 -15, -15 -20
             C -11 -25, -4 -45, 0 -45 Z" 
          fill="${COLOR_STAR}" stroke="${COLOR_LINE}" stroke-width="1.8" />
    <text x="0" y="0" font-size="13" font-weight="800" text-anchor="middle">Curators</text>
    <text x="0" y="15" font-size="13" font-weight="800" text-anchor="middle">&amp; Admins</text>
    <text x="0" y="55" font-size="8.5" font-weight="600" text-anchor="middle" fill="#475569">Field Officers · GMMB</text>
  </g>

  <!-- EXTERNAL BASEMAP & MEDIA CDN CACHE (Top Far Right, Tall Box like reference CDN) -->
  <g transform="translate(1330, 85)">
    <rect width="260" height="205" fill="${COLOR_WHITE}" stroke="${COLOR_LINE}" stroke-width="1.8" rx="8" />
    <text x="130" y="32" class="lbl-title" font-size="13.5">Basemap Providers &amp; CDN</text>
    <text x="130" y="48" class="lbl-sub" font-weight="700">External Tile Servers &amp; Static Cache</text>
    <line x1="20" y1="62" x2="240" y2="62" stroke="#e2e8f0" stroke-width="1.2" />
    
    <text x="25" y="84" font-size="11" font-weight="700" fill="#0f172a">• CartoDB Light &amp; Dark Tiles</text>
    <text x="35" y="98" class="code">cartodb-basemaps-a.global.ssl...</text>
    
    <text x="25" y="122" font-size="11" font-weight="700" fill="#0f172a">• OpenStreetMap Standard Tiles</text>
    <text x="35" y="136" class="code">tile.openstreetmap.org/{z}/{x}/{y}</text>
    
    <text x="25" y="160" font-size="11" font-weight="700" fill="#0f172a">• Esri World Imagery Satellite</text>
    <text x="35" y="174" class="code">services.arcgisonline.com/ArcGIS...</text>

    <text x="130" y="196" font-size="9.5" font-weight="600" fill="#059669" text-anchor="middle">Direct Edge Streaming to Leaflet Canvas</text>
  </g>

  <!-- HTTP CLIENT INGRESS / ROUTING (DNS & Reverse Proxy Gateway) -->
  <g transform="translate(360, 235)">
    <rect width="490" height="46" fill="${COLOR_WHITE}" stroke="${COLOR_LINE}" stroke-width="1.8" rx="8" />
    <text x="245" y="24" class="lbl-title" font-size="13">HTTP Client Gateway &amp; Reverse Proxy Dispatcher</text>
    <text x="245" y="38" class="lbl-sub">Vite Dev Server (Port 5173) / Express Production Proxy (Port 5000)</text>
  </g>


  <!-- ================================================================= -->
  <!-- MAIN SITE SYSTEM BOUNDARY (BACKEND RUNTIME & PERSISTENCE)          -->
  <!-- ================================================================= -->
  <rect x="180" y="320" width="1540" height="1020" fill="${COLOR_WHITE}" stroke="${COLOR_LINE}" stroke-width="2" rx="10" />


  <!-- ================================================================= -->
  <!-- AUXILIARY SECURITY & SYSTEM SERVICES (LEFT COLUMN, BRACKETED)     -->
  <!-- ================================================================= -->
  <g transform="translate(25, 490)">
    <!-- Header Text -->
    <text x="65" y="14" font-size="13" font-weight="800" text-anchor="middle">Security &amp;</text>
    <text x="65" y="30" font-size="13" font-weight="800" text-anchor="middle">Aux Services</text>

    <!-- Horizontal Curly Bracket Embracing the Column Below -->
    <path d="M 15 48 
             Q 35 48 45 42 
             Q 55 36 65 34 
             Q 75 36 85 42 
             Q 95 48 115 48" 
          fill="none" stroke="${COLOR_LINE}" stroke-width="1.5" />

    <!-- 1. HMAC-SHA256 Timing-Safe Authentication -->
    <g transform="translate(10, 60)">
      <rect width="112" height="78" fill="${COLOR_CORAL}" stroke="${COLOR_LINE}" stroke-width="1.6" rx="8" />
      <text x="56" y="24" font-size="10.5" font-weight="800" text-anchor="middle">HMAC-SHA256</text>
      <text x="56" y="38" font-size="10.5" font-weight="800" text-anchor="middle">Token Auth</text>
      <text x="56" y="54" font-size="8.5" font-weight="600" text-anchor="middle">timingSafeEqual()</text>
      <text x="56" y="68" font-size="8.5" font-weight="600" text-anchor="middle">Bearer Auth Guard</text>
    </g>

    <!-- 2. Path Traversal Sandbox Guard -->
    <g transform="translate(10, 154)">
      <rect width="112" height="78" fill="${COLOR_CORAL}" stroke="${COLOR_LINE}" stroke-width="1.6" rx="8" />
      <text x="56" y="24" font-size="10.5" font-weight="800" text-anchor="middle">Upload Sandbox</text>
      <text x="56" y="38" font-size="10.5" font-weight="800" text-anchor="middle">Guard</text>
      <text x="56" y="54" font-size="8.5" font-weight="600" text-anchor="middle">resolveUploadPath()</text>
      <text x="56" y="68" font-size="8.5" font-weight="600" text-anchor="middle">Directory Traversal</text>
    </g>

    <!-- 3. Soft-Deletion & Audit Trail -->
    <g transform="translate(10, 248)">
      <path d="M 0 14 L 0 62 A 56 14 0 0 0 112 62 L 112 14 Z" fill="${COLOR_CORAL}" stroke="${COLOR_LINE}" stroke-width="1.6" />
      <ellipse cx="56" cy="14" rx="56" ry="14" fill="${COLOR_CORAL}" stroke="${COLOR_LINE}" stroke-width="1.6" />
      <text x="56" y="34" font-size="10.5" font-weight="800" text-anchor="middle">Audit &amp; Soft-Delete</text>
      <text x="56" y="48" font-size="10.5" font-weight="800" text-anchor="middle">Registry</text>
      <text x="56" y="62" class="code" text-anchor="middle">deleted_at IS NULL</text>
    </g>

    <!-- 4. System Telemetry & Health Monitor -->
    <g transform="translate(10, 345)">
      <rect width="112" height="78" fill="${COLOR_CORAL}" stroke="${COLOR_LINE}" stroke-width="1.6" rx="8" />
      <text x="56" y="24" font-size="10.5" font-weight="800" text-anchor="middle">System Telemetry</text>
      <text x="56" y="38" font-size="10.5" font-weight="800" text-anchor="middle">&amp; Health Check</text>
      <text x="56" y="54" font-size="8.5" font-weight="600" text-anchor="middle">GET /api/health</text>
      <text x="56" y="68" font-size="8.5" font-weight="600" text-anchor="middle">GET /api/stats</text>
    </g>
  </g>


  <!-- ================================================================= -->
  <!-- APPLICATION RUNTIME TIER (EXPRESS.JS REST API & CONTROLLERS)      -->
  <!-- ================================================================= -->

  <!-- INGRESS MIDDLEWARE PIPELINE -->
  <g transform="translate(380, 345)">
    <rect width="450" height="44" fill="${COLOR_WHITE}" stroke="${COLOR_LINE}" stroke-width="1.8" rx="8" />
    <text x="225" y="22" class="lbl-title" font-size="13">Express Middleware &amp; Request Sanitization Gate</text>
    <text x="225" y="36" class="lbl-sub">cors() · express.json({ limit: "1mb" }) · sanitize-html · ID Pattern Validation</text>
  </g>

  <!-- APP FRONTEND / QUERY ROUTE CONTROLLERS BRACKET -->
  <g transform="translate(195, 435)">
    <text x="35" y="34" class="lbl-bracket" text-anchor="end">Query</text>
    <text x="35" y="50" class="lbl-bracket" text-anchor="end">Routes</text>
    <path d="M 52 5 
             Q 44 5 44 25 
             L 44 38 
             Q 44 45 36 45 
             Q 44 45 44 52 
             L 44 65 
             Q 44 85 52 85" 
          fill="none" stroke="${COLOR_LINE}" stroke-width="1.5" />
  </g>

  <!-- NODE 1: PUBLIC HERITAGE ASSETS QUERY CONTROLLER (Peach VM Box) -->
  <g transform="translate(265, 430)">
    <rect width="215" height="95" fill="${COLOR_PEACH}" stroke="${COLOR_LINE}" stroke-width="1.8" rx="8" />
    <text x="12" y="18" class="vm-tag">NODE</text>
    <rect x="8" y="24" width="199" height="63" fill="${COLOR_WHITE}" stroke="${COLOR_LINE}" stroke-width="1.6" rx="6" />
    <text x="107" y="44" class="lbl-title" font-size="11.5">Heritage Assets Controller</text>
    <text x="107" y="59" class="lbl-sub" font-size="9">GET /api/heritage-assets</text>
    <text x="107" y="73" class="lbl-sub" font-size="8.5">Search, Era Slider, Category Filters</text>
  </g>

  <!-- NODE 2: SPATIAL ADMINISTRATIVE BOUNDARY CONTROLLER (Peach VM Box) -->
  <g transform="translate(500, 430)">
    <rect width="215" height="95" fill="${COLOR_PEACH}" stroke="${COLOR_LINE}" stroke-width="1.8" rx="8" />
    <text x="12" y="18" class="vm-tag">NODE</text>
    <rect x="8" y="24" width="199" height="63" fill="${COLOR_WHITE}" stroke="${COLOR_LINE}" stroke-width="1.6" rx="6" />
    <text x="107" y="44" class="lbl-title" font-size="11.5">Spatial Layers Controller</text>
    <text x="107" y="59" class="lbl-sub" font-size="9">GET /api/spatial-layers/*</text>
    <text x="107" y="73" class="lbl-sub" font-size="8.5">Regions, Districts, Rivers, Roads</text>
  </g>

  <!-- APP MUTATION / BACKEND CONTROLLER BRACKET -->
  <g transform="translate(200, 600)">
    <text x="35" y="42" class="lbl-bracket" text-anchor="end">Admin</text>
    <text x="35" y="58" class="lbl-bracket" text-anchor="end">Mutations</text>
    <path d="M 52 5 
             Q 44 5 44 32 
             L 44 43 
             Q 44 53 36 53 
             Q 44 53 44 63 
             L 44 74 
             Q 44 100 52 100" 
          fill="none" stroke="${COLOR_LINE}" stroke-width="1.5" />
  </g>

  <!-- NODE 3: CURATOR ASSET INGESTION & MUTATION SERVER (Peach VM Box) -->
  <g transform="translate(350, 590)">
    <rect width="280" height="115" fill="${COLOR_PEACH}" stroke="${COLOR_LINE}" stroke-width="1.8" rx="8" />
    <text x="14" y="20" class="vm-tag">NODE</text>
    <rect x="12" y="28" width="256" height="76" fill="${COLOR_WHITE}" stroke="${COLOR_LINE}" stroke-width="1.6" rx="6" />
    <text x="140" y="50" class="lbl-title" font-size="12.5">Curator Asset Mutation Engine</text>
    <text x="140" y="66" class="lbl-sub" font-size="9.5">POST / PUT / DELETE /api/heritage-assets</text>
    <text x="140" y="80" class="lbl-sub" font-size="9">POST / DELETE /api/media · POST /api/admin/login</text>
    <text x="140" y="94" font-size="8.5" font-weight="700" fill="#dc2626" text-anchor="middle">requireAdmin Middleware Gate (Bearer Token)</text>
  </g>


  <!-- ================================================================= -->
  <!-- DIGITAL ASSET & MEDIA PROCESSING PIPELINE (GRAY CLOUD CONTAINER)  -->
  <!-- ================================================================= -->
  <g transform="translate(740, 375)">
    <rect width="950" height="225" fill="${COLOR_GRAY_BOX}" stroke="${COLOR_LINE}" stroke-width="1.8" rx="4" />
    <text x="20" y="26" font-size="14" font-weight="800" fill="#0f172a">Digital Media Ingestion &amp; Storage Pipeline</text>
    <text x="335" y="26" font-size="10.5" font-weight="600" fill="#475569">(Multer Multipart Engine · Local Disk Repository · Static Serving)</text>

    <!-- 1. Media Files (Document with wavy bottom) -->
    <g transform="translate(20, 55)">
      <path d="M 0 0 L 115 0 L 115 70 C 86 80, 86 60, 57 70 C 29 80, 29 60, 0 70 Z" 
            fill="${COLOR_WHITE}" stroke="${COLOR_LINE}" stroke-width="1.6" />
      <text x="57" y="30" class="lbl-title" font-size="12">Raw Media Files</text>
      <text x="57" y="46" class="lbl-sub" font-size="8.5">Photos (.jpg, .webp)</text>
      <text x="57" y="58" class="lbl-sub" font-size="8.5">3D (.glb) · Audio (.mp3)</text>
    </g>

    <!-- 2. Content Filter (Rack / Column filter shape with inner vertical lines) -->
    <g transform="translate(180, 42)">
      <rect width="110" height="106" fill="${COLOR_WHITE}" stroke="${COLOR_LINE}" stroke-width="1.6" rx="4" />
      <line x1="10" y1="0" x2="10" y2="106" stroke="${COLOR_LINE}" stroke-width="1.2" />
      <line x1="100" y1="0" x2="100" y2="106" stroke="${COLOR_LINE}" stroke-width="1.2" />
      <text x="55" y="44" class="lbl-title" font-size="11.5">Multer MIME</text>
      <text x="55" y="58" class="lbl-title" font-size="11.5">&amp; Type Filter</text>
      <text x="55" y="74" class="lbl-sub" font-size="8.5">createMediaType()</text>
      <text x="55" y="88" class="lbl-sub" font-size="8.5">1MB Body Guard</text>
    </g>

    <!-- 3. External Storage (1st Green Bucket Shape: Multer Staging) -->
    <g transform="translate(335, 52)">
      <path d="M 0 0 L 130 0 L 108 82 A 8 8 0 0 1 100 88 L 30 88 A 8 8 0 0 1 22 82 Z" 
            fill="${COLOR_GREEN}" stroke="${COLOR_LINE}" stroke-width="1.6" />
      <text x="65" y="38" class="lbl-title" font-size="11.5">Multer Disk</text>
      <text x="65" y="52" class="lbl-title" font-size="11.5">Storage Buffer</text>
      <text x="65" y="68" class="lbl-sub" font-size="8.5">mediaStorage stream</text>
    </g>

    <!-- 4. Video / Media Convertor (Horizontal Block Chevron Arrow) -->
    <g transform="translate(510, 48)">
      <path d="M 0 14 
               L 85 14 
               L 85 0 
               L 155 47 
               L 85 94 
               L 85 80 
               L 0 80 
               L 24 47 Z" 
            fill="${COLOR_WHITE}" stroke="${COLOR_LINE}" stroke-width="1.6" />
      <text x="62" y="42" class="lbl-title" font-size="11.5">Cryptographic</text>
      <text x="62" y="56" class="lbl-title" font-size="11.5">Hash Pipeline</text>
      <text x="62" y="70" class="code" text-anchor="middle">randomBytes(16)</text>
    </g>

    <!-- 5. External Storage (2nd Green Bucket Shape: Persistent Disk) -->
    <g transform="translate(710, 52)">
      <path d="M 0 0 L 140 0 L 118 82 A 8 8 0 0 1 110 88 L 30 88 A 8 8 0 0 1 22 82 Z" 
            fill="${COLOR_GREEN}" stroke="${COLOR_LINE}" stroke-width="1.6" />
      <text x="70" y="36" class="lbl-title" font-size="12">Persistent File</text>
      <text x="70" y="50" class="lbl-title" font-size="12">Store (/uploads/)</text>
      <text x="70" y="66" class="lbl-sub" font-size="8.5">Static Media Storage</text>
    </g>

    <!-- Connectors inside Cloud Storage -->
    <line x1="135" y1="92" x2="180" y2="92" class="line-flow" marker-end="url(#arrow)" />
    <line x1="290" y1="92" x2="335" y2="92" class="line-flow" marker-end="url(#arrow)" />
    <line x1="465" y1="92" x2="508" y2="92" class="line-flow" marker-end="url(#arrow)" />
    <line x1="665" y1="95" x2="710" y2="95" class="line-flow" marker-end="url(#arrow)" />
  </g>


  <!-- ================================================================= -->
  <!-- DATABASE & PERSISTENCE TIER (POSTGRESQL 16 + POSTGIS + FTS)        -->
  <!-- ================================================================= -->

  <!-- CONNECTION POOL (White Cylinder) -->
  <g transform="translate(425, 735)">
    <path d="M 0 10 L 0 46 A 65 10 0 0 0 130 46 L 130 10 Z" fill="${COLOR_WHITE}" stroke="${COLOR_LINE}" stroke-width="1.6" />
    <ellipse cx="65" cy="10" rx="65" ry="10" fill="${COLOR_WHITE}" stroke="${COLOR_LINE}" stroke-width="1.6" />
    <text x="65" y="28" class="lbl-title" font-size="11.5">PostgreSQL Pool</text>
    <text x="65" y="42" class="lbl-sub" font-size="8.5">pg.Pool (max 20 clients · 30s idle)</text>
  </g>

  <!-- CYLINDER 1: RELATIONAL HERITAGE ENTITIES (Light Blue Cylinder) -->
  <g transform="translate(230, 855)">
    <path d="M 0 14 L 0 85 A 70 14 0 0 0 140 85 L 140 14 Z" fill="${COLOR_BLUE}" stroke="${COLOR_LINE}" stroke-width="1.6" />
    <ellipse cx="70" cy="14" rx="70" ry="14" fill="${COLOR_BLUE}" stroke="${COLOR_LINE}" stroke-width="1.6" />
    <text x="70" y="44" class="lbl-title" font-size="12">Relational Entities</text>
    <text x="70" y="60" class="lbl-title" font-size="11">PostgreSQL 16</text>
    <text x="70" y="76" class="lbl-sub" font-size="8.5">heritage_assets (40+ cols)</text>
    <text x="70" y="112" font-size="8.5" font-weight="700" text-anchor="middle" fill="#475569">heritage_asset_media FK</text>
  </g>

  <!-- CYLINDER 2: POSTGIS SPATIAL DATA ENGINE (Light Blue Cylinder) -->
  <g transform="translate(405, 855)">
    <path d="M 0 14 L 0 85 A 75 14 0 0 0 150 85 L 150 14 Z" fill="${COLOR_BLUE}" stroke="${COLOR_LINE}" stroke-width="1.6" />
    <ellipse cx="75" cy="14" rx="75" ry="14" fill="${COLOR_BLUE}" stroke="${COLOR_LINE}" stroke-width="1.6" />
    <text x="75" y="44" class="lbl-title" font-size="12">PostGIS Spatial</text>
    <text x="75" y="60" class="lbl-title" font-size="11">Data Engine</text>
    <text x="75" y="76" class="code" text-anchor="middle">EPSG:4326 · GiST Index</text>
    <text x="75" y="112" font-size="8.5" font-weight="700" text-anchor="middle" fill="#475569">ST_AsGeoJSON · Layers</text>
  </g>

  <!-- CYLINDER 3: POSTGRESQL FULL-TEXT SEARCH (Light Blue Cylinder) -->
  <g transform="translate(590, 855)">
    <path d="M 0 14 L 0 85 A 70 14 0 0 0 140 85 L 140 14 Z" fill="${COLOR_BLUE}" stroke="${COLOR_LINE}" stroke-width="1.6" />
    <ellipse cx="70" cy="14" rx="70" ry="14" fill="${COLOR_BLUE}" stroke="${COLOR_LINE}" stroke-width="1.6" />
    <text x="70" y="44" class="lbl-title" font-size="12">PostgreSQL FTS</text>
    <text x="70" y="60" class="lbl-title" font-size="11">Search Engine</text>
    <text x="70" y="76" class="code" text-anchor="middle">tsvector · GIN Index</text>
    <text x="70" y="112" font-size="8.5" font-weight="700" text-anchor="middle" fill="#475569">Weights A, B, C, D</text>
  </g>


  <!-- ================================================================= -->
  <!-- TELEMETRY, DATA MART & GIS EXPORT PIPELINE (BOTTOM RIGHT)          -->
  <!-- ================================================================= -->

  <!-- Telemetry & Interaction Log Buffer (Green Bucket Shape) -->
  <g transform="translate(770, 660)">
    <path d="M 0 0 L 130 0 L 108 82 A 8 8 0 0 1 100 88 L 30 88 A 8 8 0 0 1 22 82 Z" 
          fill="${COLOR_GREEN}" stroke="${COLOR_LINE}" stroke-width="1.6" />
    <text x="65" y="40" class="lbl-title" font-size="12">Telemetry &amp; Log</text>
    <text x="65" y="54" class="lbl-title" font-size="12">Event Buffer</text>
    <text x="65" y="68" class="lbl-sub" font-size="8.5">Viewport BBox, Search</text>
  </g>

  <!-- Historical Spatial Data Mart (Light Blue Cylinder) -->
  <g transform="translate(980, 660)">
    <path d="M 0 14 L 0 74 A 75 14 0 0 0 150 74 L 150 14 Z" fill="${COLOR_BLUE}" stroke="${COLOR_LINE}" stroke-width="1.6" />
    <ellipse cx="75" cy="14" rx="75" ry="14" fill="${COLOR_BLUE}" stroke="${COLOR_LINE}" stroke-width="1.6" />
    <text x="75" y="44" class="lbl-title" font-size="12.5">Historical GeoJSON</text>
    <text x="75" y="60" class="lbl-title" font-size="12.5">Spatial Data Mart</text>
    <text x="75" y="76" class="lbl-sub" font-size="8.5">Curated Heritage Archive</text>
  </g>

  <!-- GIS Serializer & Exporter Engine (White Rounded Box) -->
  <g transform="translate(1210, 665)">
    <rect width="170" height="75" fill="${COLOR_WHITE}" stroke="${COLOR_LINE}" stroke-width="1.8" rx="8" />
    <text x="85" y="32" class="lbl-title" font-size="12">GIS Exporter Engine</text>
    <text x="85" y="50" class="lbl-sub" font-size="9">GeoJSON (RFC 7946)</text>
    <text x="85" y="64" class="lbl-sub" font-size="9">CSV &amp; KML Downloads</text>
  </g>

  <!-- Conservation Intelligence & National Reporting (White Rounded Box) -->
  <g transform="translate(1440, 655)">
    <rect width="210" height="95" fill="${COLOR_WHITE}" stroke="${COLOR_LINE}" stroke-width="1.8" rx="8" />
    <text x="105" y="32" class="lbl-title" font-size="12.5">Conservation BI &amp;</text>
    <text x="105" y="48" class="lbl-title" font-size="12.5">National Reporting</text>
    <text x="105" y="66" class="lbl-sub" font-size="9">Preservation Status Metrics</text>
    <text x="105" y="80" class="lbl-sub" font-size="9">GMMB Field Verification Audit</text>
  </g>


  <!-- ================================================================= -->
  <!-- DATA FLOW ARROWS & LABELED PATHWAYS                               -->
  <!-- ================================================================= -->

  <!-- Flow 1A: Public Visitors to GIS Atlas & Catalogues -->
  <line x1="150" y1="140" x2="210" y2="140" class="line-flow" marker-end="url(#arrow)" />

  <!-- Flow 1B: Curators to Media Admin -->
  <line x1="1030" y1="140" x2="1000" y2="140" class="line-flow" marker-end="url(#arrow)" />

  <!-- Flow 2: Clients to HTTP Gateway via Clean T-Junction -->
  <line x1="335" y1="187" x2="335" y2="215" class="line-flow" />
  <line x1="605" y1="187" x2="605" y2="215" class="line-flow" />
  <line x1="875" y1="187" x2="875" y2="215" class="line-flow" />
  <line x1="335" y1="215" x2="875" y2="215" class="line-flow" />
  <line x1="605" y1="215" x2="605" y2="235" class="line-flow" marker-end="url(#arrow)" />

  <!-- Flow 3: Gateway into Express Ingress Middleware -->
  <line x1="605" y1="281" x2="605" y2="345" class="line-flow" marker-end="url(#arrow)" />

  <!-- Flow 4: Ingress to Query Nodes (Split Left & Right) -->
  <path d="M 500 389 L 500 412 L 372 412 L 372 430" class="line-flow" marker-end="url(#arrow)" />
  <path d="M 680 389 L 680 412 L 607 412 L 607 430" class="line-flow" marker-end="url(#arrow)" />

  <!-- Flow 5: Ingress to Curator Mutation Node (Clean Center Drop through Gap) -->
  <line x1="490" y1="389" x2="490" y2="590" class="line-flow" marker-end="url(#arrow)" />

  <!-- Flow 6: Curator Mutation Node to Media Processing Pipeline -->
  <path d="M 630 645 L 720 645 L 720 495 L 740 495" class="line-flow" marker-end="url(#arrow)" />
  <text x="645" y="635" class="lbl-flow" font-size="9.5">Multipart Ingest</text>

  <!-- Flow 7: Controllers to PostgreSQL Pool -->
  <path d="M 372 525 L 372 560 L 450 560 L 450 735" class="line-flow" marker-end="url(#arrow)" />
  <path d="M 607 525 L 607 560 L 530 560 L 530 735" class="line-flow" marker-end="url(#arrow)" />
  <line x1="490" y1="705" x2="490" y2="735" class="line-flow" marker-end="url(#arrow)" />

  <!-- Flow 8: Pool to Databases (Parallel Queries & Spatial Binding) -->
  <path d="M 450 781 L 450 818 L 300 818 L 300 855" class="line-flow" marker-end="url(#arrow)" marker-start="url(#arrow-rev)" />
  <line x1="480" y1="781" x2="480" y2="855" class="line-flow" marker-end="url(#arrow)" marker-start="url(#arrow-rev)" />
  <path d="M 520 781 L 520 818 L 660 818 L 660 855" class="line-flow" marker-end="url(#arrow)" marker-start="url(#arrow-rev)" />

  <!-- Flow 9: Media Store to CDN & Direct Static Express Stream -->
  <line x1="1455" y1="427" x2="1455" y2="290" class="line-flow" marker-end="url(#arrow)" />
  <text x="1465" y="355" class="lbl-flow" font-size="10">Static Media Stream</text>
  <text x="1465" y="370" class="code">express.static('/uploads')</text>

  <!-- Flow 10: CDN Tile delivery looping over the top into Interactive GIS Atlas -->
  <path d="M 1455 85 L 1455 62 L 335 62 L 335 95" class="line-flow-dashed" marker-end="url(#arrow)" />
  <!-- Pill badge for Basemap Tile Delivery Label -->
  <g transform="translate(680, 52)">
    <rect width="360" height="20" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" rx="4" />
    <text x="180" y="14" font-size="9.5" font-weight="700" fill="#0f172a" text-anchor="middle">XYZ Raster Basemap Tile Delivery (CartoDB / OSM / Satellite)</text>
  </g>

  <!-- Flow 11: Application Telemetry to Event Buffer -->
  <path d="M 630 680 L 770 680" class="line-flow" marker-end="url(#arrow)" />
  <text x="645" y="672" class="lbl-flow" font-size="9.5">BBox &amp; Logs</text>

  <!-- Flow 12: Event Buffer to Historical Spatial Data Mart -->
  <line x1="900" y1="704" x2="980" y2="704" class="line-flow" marker-end="url(#arrow)" />

  <!-- Flow 13: Spatial Database to Data Mart (ETL GeoJSON Aggregation, Well Below Cylinders) -->
  <path d="M 480 940 L 480 1005 L 1055 1005 L 1055 748" class="line-flow" marker-end="url(#arrow)" />
  <g transform="translate(630, 995)">
    <rect width="320" height="20" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" rx="4" />
    <text x="160" y="14" font-size="10" font-weight="700" fill="#0f172a" text-anchor="middle">Spatial ETL &amp; Aggregation: ST_AsGeoJSON(geom)</text>
  </g>

  <!-- Flow 14: Data Mart to GIS Exporter Engine -->
  <line x1="1130" y1="704" x2="1210" y2="704" class="line-flow" marker-end="url(#arrow)" />

  <!-- Flow 15: Exporter Engine to Conservation BI -->
  <line x1="1380" y1="704" x2="1440" y2="704" class="line-flow" marker-end="url(#arrow)" />


  <!-- ================================================================= -->
  <!-- NOTATION & SPECIFICATION LEGEND (BOTTOM)                           -->
  <!-- ================================================================= -->
  <g transform="translate(195, 1270)">
    <rect width="1510" height="42" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.2" rx="4" />
    
    <text x="20" y="26" font-size="11" font-weight="800" fill="#0f172a" letter-spacing="0.5">NOTATION LEGEND:</text>
    
    <!-- Legend item 1: Compute / Server (Orange VM) -->
    <rect x="150" y="14" width="24" height="15" fill="${COLOR_PEACH}" stroke="${COLOR_LINE}" stroke-width="1.2" rx="2" />
    <text x="182" y="26" font-size="10" font-weight="600" fill="#334155">Express.js API Route Controller</text>

    <!-- Legend item 2: Storage Bucket (Green) -->
    <path d="M 390 14 L 406 14 L 402 28 L 394 28 Z" fill="${COLOR_GREEN}" stroke="${COLOR_LINE}" stroke-width="1.2" />
    <text x="414" y="26" font-size="10" font-weight="600" fill="#334155">File System &amp; Telemetry Storage</text>

    <!-- Legend item 3: Database (Blue) -->
    <rect x="635" y="14" width="18" height="15" fill="${COLOR_BLUE}" stroke="${COLOR_LINE}" stroke-width="1.2" rx="2" />
    <text x="662" y="26" font-size="10" font-weight="600" fill="#334155">PostgreSQL / PostGIS Spatial Database</text>

    <!-- Legend item 4: Security Services (Coral) -->
    <rect x="915" y="14" width="18" height="15" fill="${COLOR_CORAL}" stroke="${COLOR_LINE}" stroke-width="1.2" rx="2" />
    <text x="941" y="26" font-size="10" font-weight="600" fill="#334155">HMAC &amp; Security Guards</text>

    <!-- Legend item 5: Synchronous Solid Flow -->
    <line x1="1135" y1="21" x2="1170" y2="21" stroke="${COLOR_LINE}" stroke-width="1.6" marker-end="url(#arrow)" />
    <text x="1178" y="26" font-size="10" font-weight="600" fill="#334155">API / SQL Data Flow</text>

    <!-- Legend item 6: Dashed Tile Flow -->
    <line x1="1310" y1="21" x2="1345" y2="21" stroke="${COLOR_LINE}" stroke-width="1.4" stroke-dasharray="4,3" marker-end="url(#arrow)" />
    <text x="1353" y="26" font-size="10" font-weight="600" fill="#334155">Tile / Media Stream</text>
  </g>

</svg>`;
}

// Write to files
const svg = generateSiteArchitectureDataFlowSVG();
const rootSvg = path.resolve(__dirname, '..', 'system_architecture.svg');
const docsSvg = path.resolve(__dirname, '..', 'docs', 'system_architecture.svg');
const namedSvg = path.resolve(__dirname, '..', 'system_architecture_diagram.svg');
const namedDocsSvg = path.resolve(__dirname, '..', 'docs', 'system_architecture_diagram.svg');

fs.writeFileSync(rootSvg, svg, 'utf-8');
fs.writeFileSync(docsSvg, svg, 'utf-8');
fs.writeFileSync(namedSvg, svg, 'utf-8');
fs.writeFileSync(namedDocsSvg, svg, 'utf-8');
console.log('Site-specific architecture SVG generated successfully.');

// Render PNG using Microsoft Edge Headless
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const rootPng = path.resolve(__dirname, '..', 'system_architecture.png');
const docsPng = path.resolve(__dirname, '..', 'docs', 'system_architecture.png');
const namedPng = path.resolve(__dirname, '..', 'system_architecture_diagram.png');
const namedDocsPng = path.resolve(__dirname, '..', 'docs', 'system_architecture_diagram.png');

if (fs.existsSync(edgePath)) {
  console.log('Rendering site-specific PNG via Edge headless...');
  execFileSync(edgePath, [
    '--headless',
    '--disable-gpu',
    `--screenshot=${rootPng}`,
    '--window-size=1780,1380',
    `file:///${rootSvg.replace(/\\/g, '/')}`
  ]);
  console.log('PNG rendered:', fs.existsSync(rootPng), 'Size:', fs.statSync(rootPng).size);
  fs.copyFileSync(rootPng, docsPng);
  fs.copyFileSync(rootPng, namedPng);
  fs.copyFileSync(rootPng, namedDocsPng);
  console.log('Copied to docs/system_architecture.png and system_architecture_diagram.png');
} else {
  console.warn('Edge path not found:', edgePath);
}
