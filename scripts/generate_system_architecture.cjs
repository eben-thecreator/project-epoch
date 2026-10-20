const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function escapeXml(unsafe) {
  return String(unsafe).replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

function generateSystemArchitectureSVG() {
  const W = 2600;
  const H = 1920;

  const FONT_SANS = "'Segoe UI', -apple-system, BlinkMacSystemFont, Arial, sans-serif";
  const FONT_MONO = "'Consolas', 'Courier New', monospace";

  let out = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="background-color: #ffffff;">
  <defs>
    <!-- Solid Black Arrowhead Marker (Normal) -->
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#000000" />
    </marker>
    <!-- Solid Black Arrowhead Marker (Start) -->
    <marker id="arrow-start" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 10 1.5 L 0 5 L 10 8.5 z" fill="#000000" />
    </marker>
    <!-- Dashed Line Arrowhead -->
    <marker id="arrow-dashed" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#333333" />
    </marker>
    <!-- Dashed Line Arrowhead Start -->
    <marker id="arrow-dashed-start" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 9 1.5 L 0 5 L 9 8.5 z" fill="#333333" />
    </marker>
  </defs>

  <style>
    text {
      font-family: ${FONT_SANS};
      fill: #000000;
      -webkit-font-smoothing: antialiased;
    }
    .code {
      font-family: ${FONT_MONO};
    }
    .tier-box {
      fill: #ffffff;
      stroke: #000000;
      stroke-width: 2;
      stroke-dasharray: 8, 5;
    }
    .sub-box {
      fill: #ffffff;
      stroke: #000000;
      stroke-width: 1.5;
      rx: 4;
      ry: 4;
    }
    .inner-card {
      fill: #ffffff;
      stroke: #222222;
      stroke-width: 1.1;
      rx: 3;
      ry: 3;
    }
    .flow-line {
      stroke: #000000;
      stroke-width: 1.8;
      fill: none;
    }
    .flow-line-dashed {
      stroke: #333333;
      stroke-width: 1.5;
      stroke-dasharray: 5, 4;
      fill: none;
    }
    .flow-badge {
      fill: #ffffff;
      stroke: #000000;
      stroke-width: 1.3;
      rx: 4;
    }
    .text-white {
      fill: #ffffff !important;
    }
  </style>

  <!-- ================================================================= -->
  <!-- TOP TITLE & SPECIFICATION BANNER                                  -->
  <!-- ================================================================= -->
  <g transform="translate(60, 40)">
    <!-- Header Outer Container -->
    <rect width="2480" height="90" fill="#ffffff" stroke="#000000" stroke-width="2" rx="4" />
    
    <!-- Title & System Description -->
    <text x="32" y="40" font-size="23" font-weight="800" letter-spacing="1">PROJECT EPOCH — SYSTEM ARCHITECTURE DIAGRAM</text>
    <text x="32" y="66" font-size="13" font-weight="500" fill="#333333">Spatial Cultural Heritage Information System (SCHIS) • End-to-End Multi-Tier Architectural Topology</text>
    
    <!-- Specification Badges -->
    <g transform="translate(1860, 26)">
      <rect width="280" height="38" fill="#ffffff" stroke="#000000" stroke-width="1.3" rx="3" />
      <text x="140" y="24" font-size="11.5" font-weight="700" text-anchor="middle" letter-spacing="0.5">SPECIFICATION: IEEE / UML MULTI-TIER</text>
    </g>
    <g transform="translate(2160, 26)">
      <rect width="290" height="38" fill="#000000" rx="3" />
      <text x="145" y="24" font-size="11.5" font-weight="700" class="text-white" text-anchor="middle" letter-spacing="0.5">POSTGIS EPSG:4326 (WGS 84)</text>
    </g>
  </g>

  <!-- ================================================================= -->
  <!-- ACTORS & EXTERNAL BOUNDARY SERVICES                               -->
  <!-- ================================================================= -->
  <g transform="translate(60, 150)">
    <!-- Actor 1: Public Researcher / General Visitor (Aligned above Col 1 & 2) -->
    <g transform="translate(0, 0)">
      <rect width="590" height="70" fill="#ffffff" stroke="#000000" stroke-width="1.6" rx="4" />
      <!-- Minimal User Icon -->
      <circle cx="45" cy="35" r="14" fill="#ffffff" stroke="#000000" stroke-width="1.6" />
      <path d="M 33 46 C 33 39, 57 39, 57 46" fill="none" stroke="#000000" stroke-width="1.6" />
      <circle cx="45" cy="29" r="5" fill="#000000" />
      <text x="75" y="30" font-size="13" font-weight="700">ACTOR: PUBLIC RESEARCHER / VISITOR</text>
      <text x="75" y="50" font-size="11.5" fill="#444444">Unauthenticated Client • Standard Browser (Interactive Map &amp; Catalogues)</text>
    </g>

    <!-- External Map Tile Services (Center) -->
    <g transform="translate(945, 0)">
      <rect width="590" height="70" fill="#ffffff" stroke="#000000" stroke-width="1.6" stroke-dasharray="5, 3" rx="4" />
      <text x="295" y="30" font-size="13" font-weight="700" text-anchor="middle">EXTERNAL MAP TILE PROVIDERS</text>
      <text x="295" y="50" font-size="11.5" fill="#444444" text-anchor="middle">XYZ Raster Tiles (OpenStreetMap • CartoDB Light/Dark • Esri Satellite)</text>
    </g>

    <!-- Actor 2: Heritage Curator / Administrator (Aligned above Col 4) -->
    <g transform="translate(1890, 0)">
      <rect width="590" height="70" fill="#ffffff" stroke="#000000" stroke-width="1.6" rx="4" />
      <!-- Admin Icon with Key badge -->
      <circle cx="45" cy="35" r="14" fill="#ffffff" stroke="#000000" stroke-width="1.6" />
      <path d="M 33 46 C 33 39, 57 39, 57 46" fill="none" stroke="#000000" stroke-width="1.6" />
      <circle cx="45" cy="29" r="5" fill="#000000" />
      <rect x="44" y="32" width="10" height="5" fill="#000000" rx="1" />
      <text x="75" y="30" font-size="13" font-weight="700">ACTOR: HERITAGE CURATOR / ADMINISTRATOR</text>
      <text x="75" y="50" font-size="11.5" fill="#444444">Authenticated Client • Bearer Token Auth • Asset Ingestion &amp; Verification</text>
    </g>
  </g>

  <!-- Connectors from Actors to Tier 1 -->
  <!-- Public Actor Down to Atlas -->
  <line x1="355" y1="220" x2="355" y2="258" class="flow-line" marker-end="url(#arrow)" />
  <line x1="965" y1="220" x2="965" y2="258" class="flow-line" marker-end="url(#arrow)" />
  <!-- External Tiles Down to Map Viewer (Dashed) -->
  <line x1="1300" y1="220" x2="1300" y2="258" class="flow-line-dashed" marker-end="url(#arrow-dashed)" />
  <!-- Admin Actor Down to Back Office -->
  <line x1="2245" y1="220" x2="2245" y2="258" class="flow-line" marker-end="url(#arrow)" />


  <!-- ================================================================= -->
  <!-- TIER 1: PRESENTATION & CLIENT TIER (REACT 18 SPA)                  -->
  <!-- ================================================================= -->
  <g transform="translate(60, 260)">
    <!-- Tier Boundary Container -->
    <rect width="2480" height="380" class="tier-box" rx="6" />

    <!-- Tier Header Badge -->
    <rect x="25" y="-15" width="700" height="30" fill="#000000" rx="4" />
    <text x="40" y="5" font-size="13" font-weight="800" class="text-white" letter-spacing="0.8">TIER 1: PRESENTATION &amp; CLIENT MAPPING TIER (React 18 SPA • Vite • TypeScript)</text>

    <!-- Subsystem 1.1: Interactive GIS Atlas & Cartographic Engine -->
    <g transform="translate(20, 30)">
      <rect width="590" height="330" class="sub-box" />
      <rect width="590" height="32" fill="#f2f2f2" stroke="#000000" stroke-width="1.2" rx="3" />
      <text x="15" y="21" font-size="12.5" font-weight="700">1.1 INTERACTIVE GIS ATLAS (LEAFLET 1.9)</text>
      <text x="575" y="21" font-size="11" font-weight="600" text-anchor="end" class="code">react-leaflet</text>

      <!-- Card 1 -->
      <g transform="translate(15, 42)">
        <rect width="560" height="50" class="inner-card" />
        <text x="12" y="20" font-size="11.5" font-weight="700">Spatial Vector Layer Rendering</text>
        <text x="12" y="37" font-size="10.5" fill="#444444">Point, Polygon, MultiPolygon &amp; LineString parsing from GeoJSON (EPSG:4326)</text>
      </g>

      <!-- Card 2 -->
      <g transform="translate(15, 98)">
        <rect width="560" height="50" class="inner-card" />
        <text x="12" y="20" font-size="11.5" font-weight="700">Marker Clustering &amp; Symbology Engine</text>
        <text x="12" y="37" font-size="10.5" fill="#444444">Adaptive zoom clustering (<tspan class="code">leaflet.markercluster</tspan>) &amp; Category-coded markers</text>
      </g>

      <!-- Card 3 -->
      <g transform="translate(15, 154)">
        <rect width="560" height="50" class="inner-card" />
        <text x="12" y="20" font-size="11.5" font-weight="700">Administrative Boundary Overlays</text>
        <text x="12" y="37" font-size="10.5" fill="#444444">Togglable polygons: 16 Regions, 261 Districts, Protected Areas, Rivers, Roads</text>
      </g>

      <!-- Card 4 -->
      <g transform="translate(15, 210)">
        <rect width="560" height="50" class="inner-card" />
        <text x="12" y="20" font-size="11.5" font-weight="700">Asset Dossier Side Drawer &amp; Inspection</text>
        <text x="12" y="37" font-size="10.5" fill="#444444">Detailed metadata slideout, coordinate readouts, media carousel &amp; fly-to camera</text>
      </g>

      <!-- Card 5 -->
      <g transform="translate(15, 266)">
        <rect width="560" height="48" class="inner-card" />
        <text x="12" y="19" font-size="11.5" font-weight="700">Basemap Switcher &amp; Viewport Controls</text>
        <text x="12" y="35" font-size="10.5" fill="#444444">Leaflet tile layer selector (Carto Light / Carto Dark / Satellite) &amp; scale bar</text>
      </g>
    </g>

    <!-- Subsystem 1.2: Search, Temporal & Attribute Filters -->
    <g transform="translate(630, 30)">
      <rect width="590" height="330" class="sub-box" />
      <rect width="590" height="32" fill="#f2f2f2" stroke="#000000" stroke-width="1.2" rx="3" />
      <text x="15" y="21" font-size="12.5" font-weight="700">1.2 QUERY, TEMPORAL &amp; EXPORT CONTROLS</text>
      <text x="575" y="21" font-size="11" font-weight="600" text-anchor="end" class="code">FTS / UI State</text>

      <!-- Card 1 -->
      <g transform="translate(15, 42)">
        <rect width="560" height="50" class="inner-card" />
        <text x="12" y="20" font-size="11.5" font-weight="700">Full-Text Quick Search (Command Bar)</text>
        <text x="12" y="37" font-size="10.5" fill="#444444">Instant search modal (⌘K / Ctrl+K) binding to backend PostgreSQL tsvector index</text>
      </g>

      <!-- Card 2 -->
      <g transform="translate(15, 98)">
        <rect width="560" height="50" class="inner-card" />
        <text x="12" y="20" font-size="11.5" font-weight="700">Temporal Era &amp; Historical Range Slider</text>
        <text x="12" y="37" font-size="10.5" fill="#444444">Multi-era timeline filtering (Pre-Colonial &lt;1471, Colonial, Post-Independence 1957+)</text>
      </g>

      <!-- Card 3 -->
      <g transform="translate(15, 154)">
        <rect width="560" height="50" class="inner-card" />
        <text x="12" y="20" font-size="11.5" font-weight="700">Multi-Criteria Facet Filtering</text>
        <text x="12" y="37" font-size="10.5" fill="#444444">Category toggles (Forts, Castles, Textiles, Artifacts), Condition &amp; Regional filters</text>
      </g>

      <!-- Card 4 -->
      <g transform="translate(15, 210)">
        <rect width="560" height="50" class="inner-card" />
        <text x="12" y="20" font-size="11.5" font-weight="700">Client-Side Spatial BBox Calculation</text>
        <text x="12" y="37" font-size="10.5" fill="#444444">Leaflet map bounds tracking; client-side spatial sorting and cluster count tallies</text>
      </g>

      <!-- Card 5 -->
      <g transform="translate(15, 266)">
        <rect width="560" height="48" class="inner-card" />
        <text x="12" y="19" font-size="11.5" font-weight="700">GIS Dataset Serializers &amp; Exporters</text>
        <text x="12" y="35" font-size="10.5" fill="#444444">Export filtered heritage records to standard formats: GeoJSON, CSV &amp; KML</text>
      </g>
    </g>

    <!-- Subsystem 1.3: Catalogues & 3D Heritage Viewer -->
    <g transform="translate(1240, 30)">
      <rect width="600" height="330" class="sub-box" />
      <rect width="600" height="32" fill="#f2f2f2" stroke="#000000" stroke-width="1.2" rx="3" />
      <text x="15" y="21" font-size="12.5" font-weight="700">1.3 CATALOGUES &amp; 3D DIGITIZATION VIEWER</text>
      <text x="585" y="21" font-size="11" font-weight="600" text-anchor="end" class="code">Three.js / WebGL</text>

      <!-- Card 1 -->
      <g transform="translate(15, 42)">
        <rect width="570" height="50" class="inner-card" />
        <text x="12" y="20" font-size="11.5" font-weight="700">Digital Heritage Curated Catalogues</text>
        <text x="12" y="37" font-size="10.5" fill="#444444">Specialized galleries for Ghanaian textiles (Kente/Adinkra), Regalia, Forts &amp; Castles</text>
      </g>

      <!-- Card 2 -->
      <g transform="translate(15, 98)">
        <rect width="570" height="50" class="inner-card" />
        <text x="12" y="20" font-size="11.5" font-weight="700">Interactive 3D WebGL Mesh Canvas</text>
        <text x="12" y="37" font-size="10.5" fill="#444444"><tspan class="code">@react-three/fiber</tspan> canvas rendering photogrammetric GLTF/GLB models</text>
      </g>

      <!-- Card 3 -->
      <g transform="translate(15, 154)">
        <rect width="570" height="50" class="inner-card" />
        <text x="12" y="20" font-size="11.5" font-weight="700">3D Camera &amp; Lighting Controls</text>
        <text x="12" y="37" font-size="10.5" fill="#444444"><tspan class="code">@react-three/drei</tspan> OrbitControls, directional lighting &amp; shadow projection</text>
      </g>

      <!-- Card 4 -->
      <g transform="translate(15, 210)">
        <rect width="570" height="50" class="inner-card" />
        <text x="12" y="20" font-size="11.5" font-weight="700">Historical Media &amp; Audio Streamer</text>
        <text x="12" y="37" font-size="10.5" fill="#444444">Embedded archival imagery viewer, oral history audio player &amp; document reader</text>
      </g>

      <!-- Card 5 -->
      <g transform="translate(15, 266)">
        <rect width="570" height="48" class="inner-card" />
        <text x="12" y="19" font-size="11.5" font-weight="700">Client Routing &amp; State Management</text>
        <text x="12" y="35" font-size="10.5" fill="#444444"><tspan class="code">react-router-dom v6</tspan> SPA navigation, animated page transitions (Framer Motion)</text>
      </g>
    </g>

    <!-- Subsystem 1.4: Asset Management Back Office (Curator Portal) -->
    <g transform="translate(1860, 30)">
      <rect width="600" height="330" class="sub-box" />
      <rect width="600" height="32" fill="#f2f2f2" stroke="#000000" stroke-width="1.2" rx="3" />
      <text x="15" y="21" font-size="12.5" font-weight="700">1.4 CURATOR ASSET MANAGEMENT BACK OFFICE</text>
      <text x="585" y="21" font-size="11" font-weight="600" text-anchor="end" class="code">Auth: Bearer</text>

      <!-- Card 1 -->
      <g transform="translate(15, 42)">
        <rect width="570" height="50" class="inner-card" />
        <text x="12" y="20" font-size="11.5" font-weight="700">Heritage Ingestion Form (40+ Attributes)</text>
        <text x="12" y="37" font-size="10.5" fill="#444444">Descriptive, physical dimension, temporal epoch, provenance &amp; observer fields</text>
      </g>

      <!-- Card 2 -->
      <g transform="translate(15, 98)">
        <rect width="570" height="50" class="inner-card" />
        <text x="12" y="20" font-size="11.5" font-weight="700">Spatial Geometry Ingestion Interface</text>
        <text x="12" y="37" font-size="10.5" fill="#444444">GPS coordinate entry (lat/lng), accuracy metrics (m), elevation &amp; GeoJSON input</text>
      </g>

      <!-- Card 3 -->
      <g transform="translate(15, 154)">
        <rect width="570" height="50" class="inner-card" />
        <text x="12" y="20" font-size="11.5" font-weight="700">Bulk Media &amp; 3D Model Uploader</text>
        <text x="12" y="37" font-size="10.5" fill="#444444">Multipart file upload, image captioning, primary thumbnail selection &amp; sort order</text>
      </g>

      <!-- Card 4 -->
      <g transform="translate(15, 210)">
        <rect width="570" height="50" class="inner-card" />
        <text x="12" y="20" font-size="11.5" font-weight="700">Data Completeness &amp; Verification Workflow</text>
        <text x="12" y="37" font-size="10.5" fill="#444444">Field verification status tracking (Verified/Pending), Data completeness scoring</text>
      </g>

      <!-- Card 5 -->
      <g transform="translate(15, 266)">
        <rect width="570" height="48" class="inner-card" />
        <text x="12" y="19" font-size="11.5" font-weight="700">Curator Session &amp; Token Persistence</text>
        <text x="12" y="35" font-size="10.5" fill="#444444">Admin login dialog; stores HMAC token for Bearer Authorization headers</text>
      </g>
    </g>
  </g>


  <!-- ================================================================= -->
  <!-- INTER-TIER DATA FLOW (TIER 1 <-> TIER 2)                           -->
  <!-- ================================================================= -->
  <g transform="translate(60, 640)">
    <!-- Column 1 Flow: Public Parametric Search & GeoJSON Response -->
    <g transform="translate(315, 0)">
      <line x1="0" y1="0" x2="0" y2="135" class="flow-line" marker-end="url(#arrow)" marker-start="url(#arrow-start)" />
      <rect x="-180" y="42" width="360" height="50" class="flow-badge" />
      <text x="0" y="62" font-size="11" font-weight="700" text-anchor="middle">HTTP GET: /api/heritage-assets?...</text>
      <text x="0" y="80" font-size="10" fill="#444444" text-anchor="middle">Filters: search, era, category | Res: GeoJSON FeatureCollection</text>
    </g>

    <!-- Column 2 Flow: Spatial Layer Overlays -->
    <g transform="translate(925, 0)">
      <line x1="0" y1="0" x2="0" y2="135" class="flow-line" marker-end="url(#arrow)" marker-start="url(#arrow-start)" />
      <rect x="-170" y="42" width="340" height="50" class="flow-badge" />
      <text x="0" y="62" font-size="11" font-weight="700" text-anchor="middle">HTTP GET: /api/spatial-layers/*</text>
      <text x="0" y="80" font-size="10" fill="#444444" text-anchor="middle">Regions, Districts, Rivers, Roads GeoJSON layers</text>
    </g>

    <!-- Column 3 Flow: Static Upload Stream -->
    <g transform="translate(1540, 0)">
      <line x1="0" y1="0" x2="0" y2="135" class="flow-line-dashed" marker-end="url(#arrow-dashed)" marker-start="url(#arrow-dashed-start)" />
      <rect x="-160" y="42" width="320" height="50" class="flow-badge" />
      <text x="0" y="62" font-size="11" font-weight="700" text-anchor="middle">HTTP GET: /uploads/{fileName}</text>
      <text x="0" y="80" font-size="10" fill="#444444" text-anchor="middle">Static Streams: Images, 3D Models (.glb), Audio</text>
    </g>

    <!-- Column 4 Flow: Curator Ingestion & Mutations -->
    <g transform="translate(2160, 0)">
      <line x1="0" y1="0" x2="0" y2="135" class="flow-line" marker-end="url(#arrow)" marker-start="url(#arrow-start)" />
      <rect x="-200" y="42" width="400" height="50" class="flow-badge" />
      <text x="0" y="62" font-size="11" font-weight="700" text-anchor="middle">POST / PUT / DELETE [Auth: Bearer &lt;Token&gt;]</text>
      <text x="0" y="80" font-size="10" fill="#444444" text-anchor="middle">Multipart Ingest: Asset metadata + GeoJSON coords + Files</text>
    </g>
  </g>


  <!-- ================================================================= -->
  <!-- TIER 2: APPLICATION & API SERVICES TIER (NODE.JS + EXPRESS.JS)     -->
  <!-- ================================================================= -->
  <g transform="translate(60, 775)">
    <!-- Tier Boundary Container -->
    <rect width="2480" height="430" class="tier-box" rx="6" />

    <!-- Tier Header Badge -->
    <rect x="25" y="-15" width="730" height="30" fill="#000000" rx="4" />
    <text x="40" y="5" font-size="13" font-weight="800" class="text-white" letter-spacing="0.8">TIER 2: APPLICATION &amp; API SERVICES TIER (Node.js Runtime • Express.js REST API)</text>

    <!-- Module 2.1: HTTP Ingress, Security & Middleware Pipeline -->
    <g transform="translate(20, 30)">
      <rect width="590" height="380" class="sub-box" />
      <rect width="590" height="32" fill="#f2f2f2" stroke="#000000" stroke-width="1.2" rx="3" />
      <text x="15" y="21" font-size="12.5" font-weight="700">2.1 HTTP INGRESS, SECURITY &amp; MIDDLEWARE</text>
      <text x="575" y="21" font-size="11" font-weight="600" text-anchor="end" class="code">server/index.js</text>

      <!-- Card 1 -->
      <g transform="translate(15, 42)">
        <rect width="560" height="50" class="inner-card" />
        <text x="12" y="19" font-size="11.5" font-weight="700">Cross-Origin Resource Sharing (CORS)</text>
        <text x="12" y="36" font-size="10.5" fill="#444444"><tspan class="code">cors()</tspan> middleware configuring allowed HTTP origins, headers &amp; methods</text>
      </g>

      <!-- Card 2 -->
      <g transform="translate(15, 96)">
        <rect width="560" height="50" class="inner-card" />
        <text x="12" y="19" font-size="11.5" font-weight="700">Payload Parser &amp; Request Body Guard</text>
        <text x="12" y="36" font-size="10.5" fill="#444444"><tspan class="code">express.json({ limit: "1mb" })</tspan> — protects against oversized payloads</text>
      </g>

      <!-- Card 3 -->
      <g transform="translate(15, 150)">
        <rect width="560" height="54" class="inner-card" />
        <text x="12" y="18" font-size="11.5" font-weight="700">Timing-Safe HMAC-SHA256 Curator Auth Guard</text>
        <text x="12" y="34" font-size="10.5" fill="#444444"><tspan class="code">crypto.timingSafeEqual()</tspan> verification preventing side-channel timing attacks</text>
        <text x="12" y="47" font-size="10" fill="#666666">Gates all mutating routes (<tspan class="code">requireAdmin</tspan> middleware)</text>
      </g>

      <!-- Card 4 -->
      <g transform="translate(15, 208)">
        <rect width="560" height="54" class="inner-card" />
        <text x="12" y="18" font-size="11.5" font-weight="700">Multer Multipart Binary Upload Manager</text>
        <text x="12" y="34" font-size="10.5" fill="#444444">Cryptographic file renaming via <tspan class="code">crypto.randomBytes(16)</tspan></text>
        <text x="12" y="47" font-size="10" fill="#666666">MIME-type filtering for images, 3D GLTF models, audio &amp; PDF archives</text>
      </g>

      <!-- Card 5 -->
      <g transform="translate(15, 266)">
        <rect width="560" height="50" class="inner-card" />
        <text x="12" y="19" font-size="11.5" font-weight="700">Input Sanitization &amp; Identifier Validation</text>
        <text x="12" y="36" font-size="10.5" fill="#444444"><tspan class="code">sanitize-html</tspan> strip tags; regex pattern <tspan class="code">/^[A-Za-z0-9_-]{1,64}$/</tspan></text>
      </g>

      <!-- Card 6 -->
      <g transform="translate(15, 320)">
        <rect width="560" height="46" class="inner-card" />
        <text x="12" y="18" font-size="11.5" font-weight="700">Static File Directory Protection</text>
        <text x="12" y="33" font-size="10.5" fill="#444444"><tspan class="code">resolveUploadPath()</tspan> sandbox validation preventing directory traversal attacks</text>
      </g>
    </g>

    <!-- Module 2.2: REST API Route Controllers -->
    <g transform="translate(630, 30)">
      <rect width="590" height="380" class="sub-box" />
      <rect width="590" height="32" fill="#f2f2f2" stroke="#000000" stroke-width="1.2" rx="3" />
      <text x="15" y="21" font-size="12.5" font-weight="700">2.2 REST API ROUTE CONTROLLERS</text>
      <text x="575" y="21" font-size="11" font-weight="600" text-anchor="end" class="code">Express Routing</text>

      <!-- Card 1 -->
      <g transform="translate(15, 42)">
        <rect width="560" height="50" class="inner-card" />
        <text x="12" y="19" font-size="11.5" font-weight="700">Heritage Assets Collection Controller</text>
        <text x="12" y="36" font-size="10.5" class="code">GET /api/heritage-assets</text>
        <text x="210" y="36" font-size="10.5" fill="#444444">— Search, era, category, region &amp; pagination</text>
      </g>

      <!-- Card 2 -->
      <g transform="translate(15, 96)">
        <rect width="560" height="50" class="inner-card" />
        <text x="12" y="19" font-size="11.5" font-weight="700">Asset Dossier &amp; CRUD Handlers</text>
        <text x="12" y="36" font-size="10.5" class="code">GET / POST / PUT / DELETE /api/heritage-assets/:id</text>
      </g>

      <!-- Card 3 -->
      <g transform="translate(15, 150)">
        <rect width="560" height="54" class="inner-card" />
        <text x="12" y="18" font-size="11.5" font-weight="700">Media Ingestion &amp; Association Controller</text>
        <text x="12" y="34" font-size="10.5" class="code">POST /api/media | DELETE /api/media/:id</text>
        <text x="12" y="47" font-size="10" fill="#666666">Associates uploaded files to asset_id with caption, sort_order &amp; is_primary flag</text>
      </g>

      <!-- Card 4 -->
      <g transform="translate(15, 208)">
        <rect width="560" height="54" class="inner-card" />
        <text x="12" y="18" font-size="11.5" font-weight="700">Spatial Administrative Layers Endpoints</text>
        <text x="12" y="34" font-size="10.5" class="code">GET /api/spatial-layers/{regions, districts, rivers, roads}</text>
        <text x="12" y="47" font-size="10" fill="#666666">Returns serialized PostGIS boundaries as GeoJSON FeatureCollections</text>
      </g>

      <!-- Card 5 -->
      <g transform="translate(15, 266)">
        <rect width="560" height="50" class="inner-card" />
        <text x="12" y="19" font-size="11.5" font-weight="700">Curator Authentication Endpoint</text>
        <text x="12" y="36" font-size="10.5" class="code">POST /api/admin/login</text>
        <text x="175" y="36" font-size="10.5" fill="#444444">— Verifies curator secret, returns HMAC bearer token</text>
      </g>

      <!-- Card 6 -->
      <g transform="translate(15, 320)">
        <rect width="560" height="46" class="inner-card" />
        <text x="12" y="18" font-size="11.5" font-weight="700">System Telemetry &amp; Statistics</text>
        <text x="12" y="33" font-size="10.5" class="code">GET /api/stats | GET /api/health</text>
        <text x="235" y="33" font-size="10.5" fill="#444444">— Database connectivity &amp; record tallies</text>
      </g>
    </g>

    <!-- Module 2.3: Spatial Logic & Query Composition -->
    <g transform="translate(1240, 30)">
      <rect width="600" height="380" class="sub-box" />
      <rect width="600" height="32" fill="#f2f2f2" stroke="#000000" stroke-width="1.2" rx="3" />
      <text x="15" y="21" font-size="12.5" font-weight="700">2.3 SPATIAL LOGIC &amp; QUERY COMPOSITION</text>
      <text x="585" y="21" font-size="11" font-weight="600" text-anchor="end" class="code">PostGIS SQL</text>

      <!-- Card 1 -->
      <g transform="translate(15, 42)">
        <rect width="570" height="50" class="inner-card" />
        <text x="12" y="19" font-size="11.5" font-weight="700">Server-Side GeoJSON Serialization</text>
        <text x="12" y="36" font-size="10.5" class="code">ST_AsGeoJSON(geom)::json AS geometry</text>
      </g>

      <!-- Card 2 -->
      <g transform="translate(15, 96)">
        <rect width="570" height="50" class="inner-card" />
        <text x="12" y="19" font-size="11.5" font-weight="700">Spatial Geometry Ingestion &amp; SRID Binding</text>
        <text x="12" y="36" font-size="10.5" class="code">ST_SetSRID(ST_GeomFromGeoJSON($geom), 4326)</text>
      </g>

      <!-- Card 3 -->
      <g transform="translate(15, 150)">
        <rect width="570" height="54" class="inner-card" />
        <text x="12" y="18" font-size="11.5" font-weight="700">Full-Text Search Lexical Query Formatter</text>
        <text x="12" y="34" font-size="10.5" class="code">search_vector @@ plainto_tsquery(&apos;english&apos;, $query)</text>
        <text x="12" y="47" font-size="10" fill="#666666">Combines prefix matching (:*) with GIN indexed multi-field weighting</text>
      </g>

      <!-- Card 4 -->
      <g transform="translate(15, 208)">
        <rect width="570" height="54" class="inner-card" />
        <text x="12" y="18" font-size="11.5" font-weight="700">Temporal Period &amp; Epoch Boundary Matcher</text>
        <text x="12" y="34" font-size="10.5" fill="#444444">Evaluates year intervals against <tspan class="code">period_start</tspan> and <tspan class="code">period_end</tspan></text>
        <text x="12" y="47" font-size="10" fill="#666666">Handles uncertain dates, estimated ages, and era taxonomies</text>
      </g>

      <!-- Card 5 -->
      <g transform="translate(15, 266)">
        <rect width="570" height="50" class="inner-card" />
        <text x="12" y="19" font-size="11.5" font-weight="700">Parameterized SQL Injection Defense</text>
        <text x="12" y="36" font-size="10.5" fill="#444444">100% parameterized parameter binding (<tspan class="code">$1, $2, $3...</tspan>)</text>
      </g>

      <!-- Card 6 -->
      <g transform="translate(15, 320)">
        <rect width="570" height="46" class="inner-card" />
        <text x="12" y="18" font-size="11.5" font-weight="700">GeoJSON FeatureCollection Aggregation</text>
        <text x="12" y="33" font-size="10.5" class="code">json_build_object(&apos;type&apos;, &apos;FeatureCollection&apos;, &apos;features&apos;, ...)</text>
      </g>
    </g>

    <!-- Module 2.4: Data Access Pool & Media Disk Engine -->
    <g transform="translate(1860, 30)">
      <rect width="600" height="380" class="sub-box" />
      <rect width="600" height="32" fill="#f2f2f2" stroke="#000000" stroke-width="1.2" rx="3" />
      <text x="15" y="21" font-size="12.5" font-weight="700">2.4 DATA ACCESS POOL &amp; MEDIA DISK ENGINE</text>
      <text x="585" y="21" font-size="11" font-weight="600" text-anchor="end" class="code">server/db.js</text>

      <!-- Card 1 -->
      <g transform="translate(15, 42)">
        <rect width="570" height="50" class="inner-card" />
        <text x="12" y="19" font-size="11.5" font-weight="700">PostgreSQL Connection Pooling (<tspan class="code">pg.Pool</tspan>)</text>
        <text x="12" y="36" font-size="10.5" fill="#444444">Configured via <tspan class="code">DATABASE_URL</tspan> | Max: 20 clients | Idle timeout: 30s</text>
      </g>

      <!-- Card 2 -->
      <g transform="translate(15, 96)">
        <rect width="570" height="50" class="inner-card" />
        <text x="12" y="19" font-size="11.5" font-weight="700">Asynchronous Query Executor Helper</text>
        <text x="12" y="36" font-size="10.5" class="code">db.query(text, params) =&gt; Promise&lt;QueryResult&gt;</text>
      </g>

      <!-- Card 3 -->
      <g transform="translate(15, 150)">
        <rect width="570" height="54" class="inner-card" />
        <text x="12" y="18" font-size="11.5" font-weight="700">Local Disk Storage Pipeline (<tspan class="code">/uploads</tspan>)</text>
        <text x="12" y="34" font-size="10.5" fill="#444444">Direct disk filesystem writes via Node.js streams &amp; Multer engine</text>
        <text x="12" y="47" font-size="10" fill="#666666">Automated upload directory initialization (<tspan class="code">fs.mkdirSync</tspan>)</text>
      </g>

      <!-- Card 4 -->
      <g transform="translate(15, 208)">
        <rect width="570" height="54" class="inner-card" />
        <text x="12" y="18" font-size="11.5" font-weight="700">Static File Serving Middleware</text>
        <text x="12" y="34" font-size="10.5" class="code">app.use("/uploads", express.static(uploadRoot))</text>
        <text x="12" y="47" font-size="10" fill="#666666">High-throughput static media delivery with caching headers</text>
      </g>

      <!-- Card 5 -->
      <g transform="translate(15, 266)">
        <rect width="570" height="50" class="inner-card" />
        <text x="12" y="19" font-size="11.5" font-weight="700">Media Unlink &amp; File Cleanup Routine</text>
        <text x="12" y="36" font-size="10.5" fill="#444444">Synchronous / asynchronous file deletion on media entity removal</text>
      </g>

      <!-- Card 6 -->
      <g transform="translate(15, 320)">
        <rect width="570" height="46" class="inner-card" />
        <text x="12" y="18" font-size="11.5" font-weight="700">Environment Configuration Management</text>
        <text x="12" y="33" font-size="10.5" fill="#444444"><tspan class="code">dotenv.config()</tspan> — PORT, DATABASE_URL, ADMIN_PASSWORD</text>
      </g>
    </g>
  </g>


  <!-- ================================================================= -->
  <!-- INTER-TIER DATA FLOW (TIER 2 <-> TIER 3)                           -->
  <!-- ================================================================= -->
  <g transform="translate(60, 1205)">
    <!-- Flow Left: Database Connection & SQL Queries -->
    <g transform="translate(620, 0)">
      <line x1="0" y1="0" x2="0" y2="125" class="flow-line" marker-end="url(#arrow)" marker-start="url(#arrow-start)" />
      <rect x="-240" y="38" width="480" height="50" class="flow-badge" />
      <text x="0" y="58" font-size="11" font-weight="700" text-anchor="middle">TCP Connection Pool (Port 5432) • pg.Pool</text>
      <text x="0" y="76" font-size="10" fill="#444444" text-anchor="middle">Parameterized SQL Queries • ST_AsGeoJSON • ST_SetSRID • FTS @@</text>
    </g>

    <!-- Flow Center-Right: Database Results -->
    <g transform="translate(1260, 0)">
      <line x1="0" y1="0" x2="0" y2="125" class="flow-line" marker-end="url(#arrow)" marker-start="url(#arrow-start)" />
      <rect x="-220" y="38" width="440" height="50" class="flow-badge" />
      <text x="0" y="58" font-size="11" font-weight="700" text-anchor="middle">Query Result Sets &amp; GeoJSON Serialization</text>
      <text x="0" y="76" font-size="10" fill="#444444" text-anchor="middle">Relational Rows • Serialized Spatial Geometries • FTS Ranking</text>
    </g>

    <!-- Flow Right: File System Disk I/O -->
    <g transform="translate(2160, 0)">
      <line x1="0" y1="0" x2="0" y2="125" class="flow-line-dashed" marker-end="url(#arrow-dashed)" marker-start="url(#arrow-dashed-start)" />
      <rect x="-180" y="38" width="360" height="50" class="flow-badge" />
      <text x="0" y="58" font-size="11" font-weight="700" text-anchor="middle">Local File System Disk I/O (fs)</text>
      <text x="0" y="76" font-size="10" fill="#444444" text-anchor="middle">Multipart Binary Streams Write / Read (/uploads)</text>
    </g>
  </g>


  <!-- ================================================================= -->
  <!-- TIER 3: DATA PERSISTENCE & STORAGE TIER                            -->
  <!-- ================================================================= -->
  <g transform="translate(60, 1330)">
    <!-- Tier Boundary Container -->
    <rect width="2480" height="450" class="tier-box" rx="6" />

    <!-- Tier Header Badge -->
    <rect x="25" y="-15" width="790" height="30" fill="#000000" rx="4" />
    <text x="40" y="5" font-size="13" font-weight="800" class="text-white" letter-spacing="0.8">TIER 3: DATA PERSISTENCE &amp; SPATIAL ENGINE TIER (PostgreSQL 16 + PostGIS &amp; Disk Storage)</text>

    <!-- Subsystem 3A: PostgreSQL 16 + PostGIS Spatial Engine Container -->
    <g transform="translate(20, 30)">
      <rect width="1815" height="400" class="sub-box" stroke-width="1.8" />
      <!-- Header Banner with Database Cylinder symbol -->
      <rect width="1815" height="34" fill="#000000" rx="3" />
      <text x="20" y="22" font-size="13" font-weight="800" class="text-white" letter-spacing="0.8">POSTGRESQL 16 RELATIONAL DBMS + POSTGIS 3 SPATIAL EXTENSION</text>
      <text x="1795" y="22" font-size="11" font-weight="600" class="text-white code" text-anchor="end">schema.sql • node-pg-migrate</text>

      <!-- 3.1 PostGIS Spatial Engine -->
      <g transform="translate(15, 45)">
        <rect width="580" height="340" class="sub-box" />
        <rect width="580" height="28" fill="#f2f2f2" stroke="#000000" stroke-width="1" rx="2" />
        <text x="12" y="19" font-size="12" font-weight="700">3.1 POSTGIS SPATIAL ENGINE</text>
        <text x="565" y="19" font-size="10.5" font-weight="600" text-anchor="end" class="code">EPSG:4326</text>

        <!-- Card 1 -->
        <g transform="translate(12, 38)">
          <rect width="555" height="54" class="inner-card" />
          <text x="12" y="18" font-size="11" font-weight="700">Native Spatial Geometry Column</text>
          <text x="12" y="33" font-size="10" class="code">geom public.geometry(Geometry, 4326) NOT NULL</text>
          <text x="12" y="46" font-size="9.5" fill="#555555">Stores Point, Polygon &amp; MultiPolygon coordinates in WGS 84</text>
        </g>

        <!-- Card 2 -->
        <g transform="translate(12, 98)">
          <rect width="555" height="54" class="inner-card" />
          <text x="12" y="18" font-size="11" font-weight="700">Spatial Indexing: GiST R-Tree Index</text>
          <text x="12" y="33" font-size="10" class="code">CREATE INDEX idx_heritage_assets_geom ... USING GIST(geom)</text>
          <text x="12" y="46" font-size="9.5" fill="#555555">Generalized Search Tree index enabling sub-millisecond spatial bounding lookups</text>
        </g>

        <!-- Card 3 -->
        <g transform="translate(12, 158)">
          <rect width="555" height="54" class="inner-card" />
          <text x="12" y="18" font-size="11" font-weight="700">Spatial Serialization &amp; Ingestion Functions</text>
          <text x="12" y="33" font-size="10" class="code">ST_AsGeoJSON(geom)::json | ST_GeomFromGeoJSON($)</text>
          <text x="12" y="46" font-size="9.5" fill="#555555">Lossless conversion between PostGIS binary geometry and standard GeoJSON</text>
        </g>

        <!-- Card 4 -->
        <g transform="translate(12, 218)">
          <rect width="555" height="54" class="inner-card" />
          <text x="12" y="18" font-size="11" font-weight="700">Ghana Spatial Reference Vector Layers</text>
          <text x="12" y="33" font-size="10" class="code">map_districts, map_regions, map_rivers, map_roads</text>
          <text x="12" y="46" font-size="9.5" fill="#555555">Administrative base vectors enabling spatial overlay and geographic context</text>
        </g>

        <!-- Card 5 -->
        <g transform="translate(12, 278)">
          <rect width="555" height="48" class="inner-card" />
          <text x="12" y="18" font-size="11" font-weight="700">Protected Areas &amp; Conservation Geometries</text>
          <text x="12" y="34" font-size="9.5" class="code">map_protected_areas (MultiPolygon, 4326)</text>
        </g>
      </g>

      <!-- 3.2 Relational Entity Schema -->
      <g transform="translate(610, 45)">
        <rect width="590" height="340" class="sub-box" />
        <rect width="590" height="28" fill="#f2f2f2" stroke="#000000" stroke-width="1" rx="2" />
        <text x="12" y="19" font-size="12" font-weight="700">3.2 RELATIONAL ENTITY SCHEMA</text>
        <text x="575" y="19" font-size="10.5" font-weight="600" text-anchor="end" class="code">PostgreSQL 16</text>

        <!-- Card 1 -->
        <g transform="translate(12, 38)">
          <rect width="565" height="72" class="inner-card" />
          <text x="12" y="17" font-size="11" font-weight="700">Primary Entity: <tspan class="code">heritage_assets</tspan></text>
          <text x="12" y="32" font-size="9.5" fill="#444444">• Core: id (UUID), name, alternative_name, description, asset_category, cultural_group</text>
          <text x="12" y="46" font-size="9.5" fill="#444444">• Location: region, district, community, elevation_m, gps_accuracy_m</text>
          <text x="12" y="60" font-size="9.5" fill="#444444">• Dimensions &amp; State: height_m, width_m, material, condition, conservation_status</text>
        </g>

        <!-- Card 2 -->
        <g transform="translate(12, 116)">
          <rect width="565" height="54" class="inner-card" />
          <text x="12" y="17" font-size="11" font-weight="700">Temporal &amp; Provenance Attributes</text>
          <text x="12" y="32" font-size="9.5" fill="#444444">• Period: period, period_start, period_end, estimated_age</text>
          <text x="12" y="46" font-size="9.5" fill="#444444">• Provenance: origin_known, origin_location, current_location, ownership, observer</text>
        </g>

        <!-- Card 3 -->
        <g transform="translate(12, 176)">
          <rect width="565" height="54" class="inner-card" />
          <text x="12" y="17" font-size="11" font-weight="700">Related Entity: <tspan class="code">heritage_asset_media</tspan></text>
          <text x="12" y="32" font-size="9.5" fill="#444444">• Foreign Key: asset_id (1-to-Many relationship with cascade)</text>
          <text x="12" y="46" font-size="9.5" fill="#444444">• Attributes: media_type, file_path, caption, alt_text, sort_order, is_primary</text>
        </g>

        <!-- Card 4 -->
        <g transform="translate(12, 236)">
          <rect width="565" height="44" class="inner-card" />
          <text x="12" y="17" font-size="11" font-weight="700">Audit Trail &amp; Soft-Deletion Pattern</text>
          <text x="12" y="32" font-size="9.5" fill="#444444"><tspan class="code">created_at</tspan>, <tspan class="code">updated_at</tspan>, <tspan class="code">deleted_at IS NULL</tspan> filter on all active queries</text>
        </g>

        <!-- Card 5 -->
        <g transform="translate(12, 286)">
          <rect width="565" height="40" class="inner-card" />
          <text x="12" y="16" font-size="11" font-weight="700">Schema Migrations &amp; Controlled Domain Taxonomies</text>
          <text x="12" y="30" font-size="9" fill="#555555"><tspan class="code">node-pg-migrate</tspan> DDL scripts • Types: enum_asset_category, enum_condition, enum_conservation_status</text>
        </g>
      </g>

      <!-- 3.3 PostgreSQL Full-Text Search -->
      <g transform="translate(1215, 45)">
        <rect width="585" height="340" class="sub-box" />
        <rect width="585" height="28" fill="#f2f2f2" stroke="#000000" stroke-width="1" rx="2" />
        <text x="12" y="19" font-size="12" font-weight="700">3.3 POSTGRESQL FULL-TEXT SEARCH (FTS)</text>
        <text x="570" y="19" font-size="10.5" font-weight="600" text-anchor="end" class="code">tsvector / GIN</text>

        <!-- Card 1 -->
        <g transform="translate(12, 38)">
          <rect width="560" height="72" class="inner-card" />
          <text x="12" y="17" font-size="11" font-weight="700">Multi-Field Weighted Lexeme Vector (<tspan class="code">search_vector</tspan>)</text>
          <text x="12" y="32" font-size="9.5" fill="#444444">Generated stored tsvector indexing four priority tiers:</text>
          <text x="12" y="46" font-size="9.5" class="code">Weight A: name, alternative_name | Weight B: description</text>
          <text x="12" y="60" font-size="9.5" class="code">Weight C: region, district, category | Weight D: cultural_group</text>
        </g>

        <!-- Card 2 -->
        <g transform="translate(12, 116)">
          <rect width="560" height="54" class="inner-card" />
          <text x="12" y="17" font-size="11" font-weight="700">GIN Inverted Search Index (<tspan class="code">idx_heritage_assets_search</tspan>)</text>
          <text x="12" y="32" font-size="9.5" class="code">CREATE INDEX ... USING GIN(search_vector)</text>
          <text x="12" y="46" font-size="9.5" fill="#555555">Enables high-performance keyword queries across thousands of records</text>
        </g>

        <!-- Card 3 -->
        <g transform="translate(12, 176)">
          <rect width="560" height="54" class="inner-card" />
          <text x="12" y="17" font-size="11" font-weight="700">English Stemming &amp; Lexical Normalization</text>
          <text x="12" y="32" font-size="9.5" class="code">to_tsvector(&apos;english&apos;, coalesce(field, &apos;&apos;))</text>
          <text x="12" y="46" font-size="9.5" fill="#555555">Applies stopword filtering and morphological stemming on ingestion</text>
        </g>

        <!-- Card 4 -->
        <g transform="translate(12, 236)">
          <rect width="560" height="44" class="inner-card" />
          <text x="12" y="17" font-size="11" font-weight="700">Data Completeness &amp; Verification Metrics</text>
          <text x="12" y="32" font-size="9.5" fill="#444444"><tspan class="code">data_completeness_score</tspan> (0–100%) &amp; <tspan class="code">verification_status</tspan> audit</text>
        </g>

        <!-- Card 5 -->
        <g transform="translate(12, 286)">
          <rect width="560" height="40" class="inner-card" />
          <text x="12" y="16" font-size="11" font-weight="700">Prefix Search Query Execution</text>
          <text x="12" y="30" font-size="9" fill="#555555"><tspan class="code">plainto_tsquery()</tspan> with word boundary tokenization and prefix matching</text>
        </g>
      </g>
    </g>

    <!-- Subsystem 3B: Local File System Media Repository (/uploads/) -->
    <g transform="translate(1860, 30)">
      <rect width="600" height="400" class="sub-box" stroke-width="1.8" />
      <rect width="600" height="34" fill="#000000" rx="3" />
      <text x="20" y="22" font-size="13" font-weight="800" class="text-white" letter-spacing="0.8">LOCAL FILE SYSTEM MEDIA REPOSITORY (/uploads/)</text>
      <text x="585" y="22" font-size="11" font-weight="600" class="text-white code" text-anchor="end">Node.js fs</text>

      <!-- Card 1 -->
      <g transform="translate(15, 45)">
        <rect width="570" height="54" class="inner-card" />
        <text x="12" y="18" font-size="11.5" font-weight="700">High-Resolution Photographic Assets</text>
        <text x="12" y="34" font-size="10.5" fill="#444444">Field photography, artifact macros, aerial drone photos (.jpg, .png, .webp)</text>
        <text x="12" y="47" font-size="9.5" fill="#666666">Stored with cryptographic hash filenames to avoid filename collisions</text>
      </g>

      <!-- Card 2 -->
      <g transform="translate(15, 105)">
        <rect width="570" height="54" class="inner-card" />
        <text x="12" y="18" font-size="11.5" font-weight="700">3D Digitized Photogrammetric Meshes</text>
        <text x="12" y="34" font-size="10.5" fill="#444444">Binary glTF assets (.glb) &amp; embedded texture buffers</text>
        <text x="12" y="47" font-size="9.5" fill="#666666">Loaded directly by Three.js WebGL canvas for interactive 360° inspection</text>
      </g>

      <!-- Card 3 -->
      <g transform="translate(15, 165)">
        <rect width="570" height="54" class="inner-card" />
        <text x="12" y="18" font-size="11.5" font-weight="700">Oral History &amp; Audio Recordings</text>
        <text x="12" y="34" font-size="10.5" fill="#444444">Field interviews, traditional musical recordings (.mp3, .wav)</text>
        <text x="12" y="47" font-size="9.5" fill="#666666">Streamed to client browser HTML5 audio element</text>
      </g>

      <!-- Card 4 -->
      <g transform="translate(15, 225)">
        <rect width="570" height="54" class="inner-card" />
        <text x="12" y="18" font-size="11.5" font-weight="700">Archival Documents &amp; Survey Reports</text>
        <text x="12" y="34" font-size="10.5" fill="#444444">Historical maps, architectural blueprints &amp; thesis documentation (.pdf)</text>
        <text x="12" y="47" font-size="9.5" fill="#666666">Linked directly in asset dossier reference bibliography</text>
      </g>

      <!-- Card 5 -->
      <g transform="translate(15, 285)">
        <rect width="570" height="85" class="inner-card" />
        <text x="12" y="18" font-size="11.5" font-weight="700">Storage Security &amp; Path Traversal Protection</text>
        <text x="12" y="34" font-size="10" fill="#444444">• Strict root path enforcement: only files strictly inside uploadRoot are served</text>
        <text x="12" y="48" font-size="10" fill="#444444">• Path traversal sanitization: null return on directory traversal tokens (../)</text>
        <text x="12" y="62" font-size="10" fill="#444444">• Safe unlink on record deletion: preserves disk integrity without orphan leaks</text>
        <text x="12" y="76" font-size="10" fill="#444444">• Direct read stream piping via Express static file delivery</text>
      </g>
    </g>
  </g>


  <!-- ================================================================= -->
  <!-- BOTTOM NOTATION GUIDE & SYSTEM SUMMARY                             -->
  <!-- ================================================================= -->
  <g transform="translate(60, 1845)">
    <rect width="2480" height="48" fill="#ffffff" stroke="#000000" stroke-width="1.6" rx="3" />
    
    <text x="25" y="29" font-size="11.5" font-weight="800" letter-spacing="0.5">NOTATION GUIDE:</text>
    
    <!-- Legend 1: Solid Line -->
    <line x1="160" y1="24" x2="210" y2="24" stroke="#000000" stroke-width="2" marker-end="url(#arrow)" />
    <text x="220" y="28" font-size="11" font-weight="600">Synchronous API Request / DB Query</text>

    <!-- Legend 2: Dashed Line -->
    <line x1="490" y1="24" x2="540" y2="24" stroke="#333333" stroke-width="1.5" stroke-dasharray="5,4" marker-end="url(#arrow-dashed)" />
    <text x="550" y="28" font-size="11" font-weight="600">Static Stream / Tile Fetch / File I/O</text>

    <!-- Legend 3: Dashed Box -->
    <rect x="810" y="14" width="30" height="20" fill="none" stroke="#000000" stroke-width="1.5" stroke-dasharray="4,2" />
    <text x="850" y="28" font-size="11" font-weight="600">Architectural Tier Boundary</text>

    <!-- Legend 4: Solid Box -->
    <rect x="1070" y="14" width="30" height="20" fill="none" stroke="#000000" stroke-width="1.5" />
    <text x="1110" y="28" font-size="11" font-weight="600">Subsystem / Functional Module</text>

    <!-- Right-aligned System Summary -->
    <text x="2455" y="28" font-size="11" font-weight="700" text-anchor="end" fill="#222222">
      PROJECT EPOCH: GHANA SCHIS • REACT 18 + EXPRESS.JS + POSTGRESQL 16 / POSTGIS (EPSG:4326)
    </text>
  </g>

</svg>`;

  return out;
}

// 1. Generate SVG file
const svgContent = generateSystemArchitectureSVG();
const rootSvgPath = path.resolve(__dirname, '..', 'system_architecture.svg');
const docsSvgPath = path.resolve(__dirname, '..', 'docs', 'system_architecture.svg');

fs.writeFileSync(rootSvgPath, svgContent, 'utf-8');
console.log('Saved SVG to:', rootSvgPath);

fs.writeFileSync(docsSvgPath, svgContent, 'utf-8');
console.log('Saved SVG to:', docsSvgPath);

// 2. Render to PNG using Microsoft Edge headless
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const rootPngPath = path.resolve(__dirname, '..', 'system_architecture.png');
const docsPngPath = path.resolve(__dirname, '..', 'docs', 'system_architecture.png');

if (fs.existsSync(edgePath)) {
  console.log('Rendering PNG using Edge headless...');
  execFileSync(edgePath, [
    '--headless',
    '--disable-gpu',
    `--screenshot=${rootPngPath}`,
    '--window-size=2600,1920',
    `file:///${rootSvgPath.replace(/\\/g, '/')}`
  ]);
  console.log('PNG rendered successfully:', fs.existsSync(rootPngPath), 'Size:', fs.statSync(rootPngPath).size);

  // Copy to docs as well
  fs.copyFileSync(rootPngPath, docsPngPath);
  console.log('Copied PNG to docs directory');
} else {
  console.warn('Edge path not found:', edgePath);
}
