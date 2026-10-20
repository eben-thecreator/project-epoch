const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// ============================================================================
// 1. GENERATE CORRECTED WORKFLOW & MULTI-TIER DATA FLOW DIAGRAM (FIGURE 2)
// Direct, minimal, black-and-white correction of the flawed workflow diagram
// ============================================================================
function generateCorrectedWorkflowSVG() {
  const W = 2200;
  const H = 1500;

  const FONT_SANS = "'Segoe UI', -apple-system, BlinkMacSystemFont, Arial, sans-serif";
  const FONT_MONO = "'Consolas', 'Courier New', monospace";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="background-color: #ffffff;">
  <defs>
    <marker id="wf-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#000000" />
    </marker>
    <marker id="wf-arrow-dashed" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#333333" />
    </marker>
  </defs>

  <style>
    text {
      font-family: ${FONT_SANS};
      fill: #000000;
      -webkit-font-smoothing: antialiased;
    }
    .code { font-family: ${FONT_MONO}; }
    .tier-box {
      fill: #ffffff;
      stroke: #000000;
      stroke-width: 1.8;
      stroke-dasharray: 6, 4;
    }
    .comp-box {
      fill: #ffffff;
      stroke: #000000;
      stroke-width: 1.5;
      rx: 4;
      ry: 4;
    }
    .inner-box {
      fill: #ffffff;
      stroke: #333333;
      stroke-width: 1.1;
      rx: 3;
      ry: 3;
    }
    .step-badge {
      fill: #ffffff;
      stroke: #000000;
      stroke-width: 1.3;
      rx: 4;
    }
    .flow-line {
      stroke: #000000;
      stroke-width: 2;
      fill: none;
    }
    .flow-line-dashed {
      stroke: #333333;
      stroke-width: 1.5;
      stroke-dasharray: 5, 4;
      fill: none;
    }
    .text-white { fill: #ffffff !important; }
  </style>

  <!-- ================================================================= -->
  <!-- HEADER                                                            -->
  <!-- ================================================================= -->
  <g transform="translate(60, 40)">
    <rect width="2080" height="80" fill="#ffffff" stroke="#000000" stroke-width="2" rx="4" />
    <text x="30" y="36" font-size="21" font-weight="800" letter-spacing="0.8">PROJECT EPOCH — SYSTEM WORKFLOW &amp; MULTI-TIER DATA FLOW DIAGRAM</text>
    <text x="30" y="60" font-size="12.5" fill="#444444">Corrected Architectural Specification • Minimal Monochrome Black &amp; White Edition • Figure 2</text>
    
    <g transform="translate(1640, 22)">
      <rect width="410" height="36" fill="#000000" rx="3" />
      <text x="205" y="23" font-size="11" font-weight="700" class="text-white" text-anchor="middle" letter-spacing="0.5">3-TIER CLIENT-SERVER GIS ARCHITECTURE</text>
    </g>
  </g>

  <!-- ================================================================= -->
  <!-- TIER 1: CLIENT PRESENTATION TIER                                  -->
  <!-- ================================================================= -->
  <g transform="translate(60, 150)">
    <rect width="2080" height="280" class="tier-box" rx="6" />
    <rect x="25" y="-14" width="560" height="28" fill="#000000" rx="3" />
    <text x="35" y="5" font-size="12" font-weight="800" class="text-white" letter-spacing="0.6">TIER 1: CLIENT PRESENTATION TIER (Browser Runtime — React 18 + Leaflet)</text>

    <!-- Component 1A: Public Interactive GIS Atlas -->
    <g transform="translate(25, 25)">
      <rect width="1380" height="230" class="comp-box" />
      <rect width="1380" height="30" fill="#f4f4f4" stroke="#000000" stroke-width="1.2" rx="3" />
      <text x="15" y="20" font-size="12" font-weight="700">PUBLIC EXPLORER &amp; INTERACTIVE ATLAS VIEW (React SPA)</text>
      <text x="1365" y="20" font-size="10.5" font-weight="600" text-anchor="end" class="code">react-leaflet • Three.js</text>

      <!-- Subcard 1: Query & Search Controls -->
      <g transform="translate(20, 45)">
        <rect width="420" height="165" class="inner-box" />
        <text x="15" y="24" font-size="12" font-weight="700">Discovery &amp; Search Controls</text>
        <text x="15" y="48" font-size="10.5" fill="#333333">• Lexical Full-Text Search (⌘K / Ctrl+K)</text>
        <text x="15" y="70" font-size="10.5" fill="#333333">• Historical Era Slider (Pre-Colonial, Colonial, Modern)</text>
        <text x="15" y="92" font-size="10.5" fill="#333333">• Category Facets (Museums, Forts, Castles, Textiles)</text>
        <text x="15" y="114" font-size="10.5" fill="#333333">• Regional &amp; District Administrative Filters</text>
        <text x="15" y="136" font-size="10.5" fill="#333333">• GIS Exporters (GeoJSON, CSV, KML downloads)</text>
      </g>

      <!-- Subcard 2: Leaflet GIS Map Canvas -->
      <g transform="translate(460, 45)">
        <rect width="460" height="165" class="inner-box" />
        <text x="15" y="24" font-size="12" font-weight="700">Interactive Leaflet Map Canvas</text>
        <text x="15" y="48" font-size="10.5" fill="#333333">• Marker Clustering (<tspan class="code">leaflet.markercluster</tspan>)</text>
        <text x="15" y="70" font-size="10.5" fill="#333333">• Category Symbology &amp; Custom SVG Markers</text>
        <text x="15" y="92" font-size="10.5" fill="#333333">• Basemap Layers (Carto Light / Dark / Satellite Tiles)</text>
        <text x="15" y="114" font-size="10.5" fill="#333333">• Vector Overlays: Regions, Districts, Rivers, Roads</text>
        <text x="15" y="136" font-size="10.5" fill="#333333">• Client Bounding Box Viewport Tracking</text>
      </g>

      <!-- Subcard 3: Dossier Drawer & 3D Viewer -->
      <g transform="translate(940, 45)">
        <rect width="420" height="165" class="inner-box" />
        <text x="15" y="24" font-size="12" font-weight="700">Asset Dossier &amp; 3D Viewer</text>
        <text x="15" y="48" font-size="10.5" fill="#333333">• Detailed Slideout Metadata Dossier</text>
        <text x="15" y="70" font-size="10.5" fill="#333333">• Archival Media Carousel &amp; Audio Streamer</text>
        <text x="15" y="92" font-size="10.5" fill="#333333">• Three.js / WebGL Photogrammetric 3D Viewer</text>
        <text x="15" y="114" font-size="10.5" fill="#333333">• Conservation Status &amp; Completeness Rating</text>
        <text x="15" y="136" font-size="10.5" fill="#333333">• Coordinates, Elevation &amp; Accuracy Display</text>
      </g>
    </g>

    <!-- Component 1B: Admin / Curator Back Office View -->
    <g transform="translate(1430, 25)">
      <rect width="625" height="230" class="comp-box" />
      <rect width="625" height="30" fill="#f4f4f4" stroke="#000000" stroke-width="1.2" rx="3" />
      <text x="15" y="20" font-size="12" font-weight="700">ADMINISTRATOR / CURATOR PORTAL</text>
      <text x="610" y="20" font-size="10.5" font-weight="600" text-anchor="end" class="code">Auth: Bearer Token</text>

      <g transform="translate(20, 45)">
        <rect width="585" height="165" class="inner-box" />
        <text x="15" y="24" font-size="12" font-weight="700">Asset Ingestion &amp; Media Management</text>
        <text x="15" y="48" font-size="10.5" fill="#333333">• 40+ Attribute Metadata Entry (Dimensions, Epoch, Materials)</text>
        <text x="15" y="70" font-size="10.5" fill="#333333">• Native Spatial Coordinate Entry &amp; GeoJSON Ingestion</text>
        <text x="15" y="92" font-size="10.5" fill="#333333">• Bulk Media Uploader (Images, 3D Models .glb, Audio, Documents)</text>
        <text x="15" y="114" font-size="10.5" fill="#333333">• Verification Workflow Review (Verified / Pending / Inferred)</text>
        <text x="15" y="136" font-size="10.5" fill="#333333">• Bearer Token Session Management (<tspan class="code">Authorization: Bearer &lt;token&gt;</tspan>)</text>
      </g>
    </g>
  </g>

  <!-- ================================================================= -->
  <!-- STEP 1 & STEP 4 FLOWS (TIER 1 <-> TIER 2)                         -->
  <!-- ================================================================= -->
  <!-- Step 1: Public Atlas Request (Down Arrow) -->
  <path d="M 290 430 L 290 538" class="flow-line" marker-end="url(#wf-arrow)" />
  <g transform="translate(100, 460)">
    <rect width="380" height="48" class="step-badge" />
    <text x="15" y="20" font-size="11" font-weight="800">1. PUBLIC ATLAS REQUEST</text>
    <text x="15" y="36" font-size="10" fill="#444444" class="code">GET /api/heritage-assets?search=...&amp;era=...</text>
  </g>

  <!-- Step 4: GeoJSON Feature Rendering & Clustering (Up Arrow) -->
  <path d="M 690 540 L 690 432" class="flow-line" marker-end="url(#wf-arrow)" />
  <g transform="translate(500, 460)">
    <rect width="380" height="48" class="step-badge" />
    <text x="15" y="20" font-size="11" font-weight="800">4. GEOJSON FEATURE RENDERING &amp; CLUSTERING</text>
    <text x="15" y="36" font-size="10" fill="#444444">Leaflet parses FeatureCollection; renders markers &amp; clusters</text>
  </g>

  <!-- Step 5 (Curator Ingestion Down Arrow) -->
  <path d="M 1740 430 L 1740 538" class="flow-line" marker-end="url(#wf-arrow)" />
  <g transform="translate(1500, 460)">
    <rect width="480" height="48" class="step-badge" />
    <text x="15" y="20" font-size="11" font-weight="800">5. ADMIN INGESTION PIPELINE (AUTHENTICATED)</text>
    <text x="15" y="36" font-size="10" fill="#444444" class="code">POST / PUT / DELETE [Authorization: Bearer &lt;Token&gt;]</text>
  </g>

  <!-- ================================================================= -->
  <!-- TIER 2: APPLICATION & API SERVICES TIER                           -->
  <!-- ================================================================= -->
  <g transform="translate(60, 540)">
    <rect width="2080" height="260" class="tier-box" rx="6" />
    <rect x="25" y="-14" width="560" height="28" fill="#000000" rx="3" />
    <text x="35" y="5" font-size="12" font-weight="800" class="text-white" letter-spacing="0.6">TIER 2: APPLICATION &amp; API SERVICES TIER (Node.js — Express.js REST API)</text>

    <!-- Subsystem 2A: Express Route Handling & Query Formulation -->
    <g transform="translate(25, 25)">
      <rect width="1380" height="210" class="comp-box" />
      <rect width="1380" height="30" fill="#f4f4f4" stroke="#000000" stroke-width="1.2" rx="3" />
      <text x="15" y="20" font-size="12" font-weight="700">EXPRESS REST API SERVER &amp; ROUTE DISPATCHER (server/index.js)</text>
      <text x="1365" y="20" font-size="10.5" font-weight="600" text-anchor="end" class="code">Node.js • Express 5 • CORS</text>

      <g transform="translate(20, 45)">
        <rect width="420" height="145" class="inner-box" />
        <text x="15" y="22" font-size="11.5" font-weight="700">Request Validation &amp; Sanitization</text>
        <text x="15" y="44" font-size="10.5" fill="#333333">• Input sanitization via <tspan class="code">sanitize-html</tspan></text>
        <text x="15" y="66" font-size="10.5" fill="#333333">• Regex identifier pattern validation</text>
        <text x="15" y="88" font-size="10.5" fill="#333333">• JSON body limit enforcement (1MB limit)</text>
        <text x="15" y="110" font-size="10.5" fill="#333333">• CORS origin &amp; header filtering</text>
      </g>

      <g transform="translate(460, 45)">
        <rect width="460" height="145" class="inner-box" />
        <text x="15" y="22" font-size="11.5" font-weight="700">Query Formulation &amp; Spatial Pre-Processing</text>
        <text x="15" y="44" font-size="10.5" fill="#333333">• FTS query binding: <tspan class="code">plainto_tsquery('english', $)</tspan></text>
        <text x="15" y="66" font-size="10.5" fill="#333333">• Spatial serialization request: <tspan class="code">ST_AsGeoJSON(geom)</tspan></text>
        <text x="15" y="88" font-size="10.5" fill="#333333">• Temporal interval parsing (<tspan class="code">period_start</tspan> / <tspan class="code">period_end</tspan>)</text>
        <text x="15" y="110" font-size="10.5" fill="#333333">• 100% parameterized SQL bindings ($1, $2, $3...)</text>
      </g>

      <g transform="translate(940, 45)">
        <rect width="420" height="145" class="inner-box" />
        <text x="15" y="22" font-size="11.5" font-weight="700">Connection Pool &amp; Static Serving</text>
        <text x="15" y="44" font-size="10.5" fill="#333333">• PostgreSQL client pool: <tspan class="code">pg.Pool</tspan> (max 20 clients)</text>
        <text x="15" y="66" font-size="10.5" fill="#333333">• Async query execution helper (<tspan class="code">db.query</tspan>)</text>
        <text x="15" y="88" font-size="10.5" fill="#333333">• Static media delivery: <tspan class="code">express.static('/uploads')</tspan></text>
        <text x="15" y="110" font-size="10.5" fill="#333333">• Path traversal sandbox guard (<tspan class="code">resolveUploadPath</tspan>)</text>
      </g>
    </g>

    <!-- Subsystem 2B: Admin Write Security & Multipart Ingestion -->
    <g transform="translate(1430, 25)">
      <rect width="625" height="210" class="comp-box" />
      <rect width="625" height="30" fill="#f4f4f4" stroke="#000000" stroke-width="1.2" rx="3" />
      <text x="15" y="20" font-size="12" font-weight="700">ADMIN WRITE SECURITY &amp; MULTIPART INGESTION</text>
      <text x="610" y="20" font-size="10.5" font-weight="600" text-anchor="end" class="code">Multer • HMAC-SHA256</text>

      <g transform="translate(20, 45)">
        <rect width="585" height="145" class="inner-box" />
        <text x="15" y="22" font-size="11.5" font-weight="700">Security Gate &amp; Storage Processing</text>
        <text x="15" y="44" font-size="10.5" fill="#333333">• Timing-safe HMAC-SHA256 authentication: <tspan class="code">crypto.timingSafeEqual()</tspan></text>
        <text x="15" y="66" font-size="10.5" fill="#333333">• <tspan class="code">requireAdmin</tspan> middleware intercepting all mutating routes</text>
        <text x="15" y="88" font-size="10.5" fill="#333333">• Multer multipart file upload handling with cryptographic file hashing</text>
        <text x="15" y="110" font-size="10.5" fill="#333333">• Prepares geometry binding: <tspan class="code">ST_SetSRID(ST_GeomFromGeoJSON($), 4326)</tspan></text>
      </g>
    </g>
  </g>

  <!-- ================================================================= -->
  <!-- STEP 2 & STEP 3 FLOWS (TIER 2 <-> TIER 3)                         -->
  <!-- ================================================================= -->
  <!-- Step 2: Express Route Handling & Query Formulation (Down Arrow) -->
  <path d="M 450 800 L 450 908" class="flow-line" marker-end="url(#wf-arrow)" />
  <g transform="translate(260, 830)">
    <rect width="380" height="48" class="step-badge" />
    <text x="15" y="20" font-size="11" font-weight="800">2. EXPRESS ROUTE HANDLING &amp; QUERY</text>
    <text x="15" y="36" font-size="10" fill="#444444">Parameterized SQL Query Formulation via pg.Pool (Port 5432)</text>
  </g>

  <!-- Step 3: PostGIS ST_AsGeoJSON Data Fetch (Up Arrow) -->
  <path d="M 850 910 L 850 802" class="flow-line" marker-end="url(#wf-arrow)" />
  <g transform="translate(670, 830)">
    <rect width="360" height="48" class="step-badge" />
    <text x="15" y="20" font-size="11" font-weight="800">3. POSTGIS ST_AsGeoJSON DATA FETCH</text>
    <text x="15" y="36" font-size="10" fill="#444444">PostGIS serializes spatial records to GeoJSON directly</text>
  </g>

  <!-- Admin Write to Database (Down Arrow) -->
  <path d="M 1580 800 L 1580 908" class="flow-line" marker-end="url(#wf-arrow)" />
  <g transform="translate(1410, 830)">
    <rect width="340" height="48" class="step-badge" />
    <text x="15" y="20" font-size="11" font-weight="800">5A. SPATIAL GEOMETRY &amp; METADATA WRITE</text>
    <text x="15" y="36" font-size="10" fill="#444444" class="code">ST_SetSRID(ST_GeomFromGeoJSON($), 4326)</text>
  </g>

  <!-- Admin Media Write to Uploads (Down Arrow) -->
  <path d="M 1940 800 L 1940 908" class="flow-line-dashed" marker-end="url(#wf-arrow-dashed)" />
  <g transform="translate(1780, 830)">
    <rect width="320" height="48" class="step-badge" />
    <text x="15" y="20" font-size="11" font-weight="800">5B. BINARY FILE PERSISTENCE</text>
    <text x="15" y="36" font-size="10" fill="#444444">Multipart disk stream write to /uploads/</text>
  </g>

  <!-- ================================================================= -->
  <!-- TIER 3: DATA PERSISTENCE & STORAGE TIER                           -->
  <!-- ================================================================= -->
  <g transform="translate(60, 910)">
    <rect width="2080" height="340" class="tier-box" rx="6" />
    <rect x="25" y="-14" width="750" height="28" fill="#000000" rx="3" />
    <text x="35" y="5" font-size="12" font-weight="800" class="text-white" letter-spacing="0.6">TIER 3: DATA PERSISTENCE &amp; STORAGE TIER (PostgreSQL 16 + PostGIS &amp; Local Disk Storage)</text>

    <!-- Subsystem 3A: PostgreSQL 16 + PostGIS Spatial Database -->
    <g transform="translate(25, 25)">
      <rect width="1480" height="290" class="comp-box" />
      <rect width="1480" height="32" fill="#000000" rx="3" />
      <text x="15" y="21" font-size="12.5" font-weight="800" class="text-white" letter-spacing="0.8">POSTGRESQL 16 RELATIONAL DATABASE MANAGEMENT SYSTEM + POSTGIS 3 SPATIAL EXTENSION</text>
      <text x="1465" y="21" font-size="11" font-weight="600" class="text-white code" text-anchor="end">EPSG:4326 (WGS 84)</text>

      <!-- PostGIS Spatial Engine Container -->
      <g transform="translate(20, 48)">
        <rect width="460" height="222" class="inner-box" />
        <text x="15" y="24" font-size="12" font-weight="700">PostGIS Spatial Data Engine</text>
        <text x="15" y="48" font-size="10.5" fill="#333333">• Spatial Column: <tspan class="code">geom public.geometry(Geometry, 4326)</tspan></text>
        <text x="15" y="70" font-size="10.5" fill="#333333">• Spatial Index: <tspan class="code">GiST R-Tree Index (idx_heritage_assets_geom)</tspan></text>
        <text x="15" y="92" font-size="10.5" fill="#333333">• Serialization: <tspan class="code">ST_AsGeoJSON(geom)::json</tspan></text>
        <text x="15" y="114" font-size="10.5" fill="#333333">• Ingestion Binding: <tspan class="code">ST_SetSRID(ST_GeomFromGeoJSON($), 4326)</tspan></text>
        <text x="15" y="136" font-size="10.5" fill="#333333">• Spatial Layers: <tspan class="code">map_districts, map_regions, map_rivers, map_roads</tspan></text>
        <text x="15" y="158" font-size="10" fill="#666666">* Note: PostGIS is an internal extension in Tier 3, not an external 4th tier</text>
      </g>

      <!-- Relational Schema & Tables -->
      <g transform="translate(500, 48)">
        <rect width="460" height="222" class="inner-box" />
        <text x="15" y="24" font-size="12" font-weight="700">Relational Heritage Entities</text>
        <text x="15" y="48" font-size="10.5" fill="#333333">• Primary Entity: <tspan class="code">heritage_assets</tspan> (40+ metadata attributes)</text>
        <text x="15" y="70" font-size="10.5" fill="#333333">• Media Table: <tspan class="code">heritage_asset_media</tspan> (1-to-many foreign key)</text>
        <text x="15" y="92" font-size="10.5" fill="#333333">• Soft-Deletion: <tspan class="code">deleted_at IS NULL</tspan> audit preserving integrity</text>
        <text x="15" y="114" font-size="10.5" fill="#333333">• Domain Taxonomies: <tspan class="code">enum_asset_category, enum_condition...</tspan></text>
        <text x="15" y="136" font-size="10.5" fill="#333333">• Schema Migrations: Managed via <tspan class="code">node-pg-migrate</tspan></text>
      </g>

      <!-- Full-Text Search Engine -->
      <g transform="translate(980, 48)">
        <rect width="480" height="222" class="inner-box" />
        <text x="15" y="24" font-size="12" font-weight="700">PostgreSQL Full-Text Search (FTS)</text>
        <text x="15" y="48" font-size="10.5" fill="#333333">• Generated Lexeme Vector: <tspan class="code">search_vector tsvector</tspan></text>
        <text x="15" y="70" font-size="10.5" fill="#333333">• Priority Weighting: A (Name), B (Desc), C (Region/Category), D (Culture)</text>
        <text x="15" y="92" font-size="10.5" fill="#333333">• Inverted Search Index: <tspan class="code">GIN (idx_heritage_assets_search)</tspan></text>
        <text x="15" y="114" font-size="10.5" fill="#333333">• Query Execution: <tspan class="code">search_vector @@ plainto_tsquery('english', $)</tspan></text>
        <text x="15" y="136" font-size="10.5" fill="#333333">• Sub-second lexical retrieval across all heritage records</text>
      </g>
    </g>

    <!-- Subsystem 3B: Local File System Uploads (/uploads/) -->
    <g transform="translate(1530, 25)">
      <rect width="525" height="290" class="comp-box" />
      <rect width="525" height="32" fill="#000000" rx="3" />
      <text x="15" y="21" font-size="12" font-weight="800" class="text-white" letter-spacing="0.8">LOCAL FILE STORAGE (/uploads/)</text>
      <text x="510" y="21" font-size="10.5" font-weight="600" class="text-white code" text-anchor="end">Node.js fs</text>

      <g transform="translate(20, 48)">
        <rect width="485" height="222" class="inner-box" />
        <text x="15" y="24" font-size="12" font-weight="700">Persistent Media Artifacts</text>
        <text x="15" y="48" font-size="10.5" fill="#333333">• High-Res Photographs (.jpg, .png, .webp)</text>
        <text x="15" y="70" font-size="10.5" fill="#333333">• 3D Photogrammetric Models (.glb, .gltf)</text>
        <text x="15" y="92" font-size="10.5" fill="#333333">• Oral History &amp; Field Audio Recordings (.mp3, .wav)</text>
        <text x="15" y="114" font-size="10.5" fill="#333333">• Archival Documents &amp; Survey Reports (.pdf)</text>
        <text x="15" y="136" font-size="10.5" fill="#333333">• Cryptographic hash filenames preventing collisions</text>
        <text x="15" y="158" font-size="10.5" fill="#333333">• Served statically via <tspan class="code">express.static()</tspan> with sandbox check</text>
      </g>
    </g>
  </g>

  <!-- ================================================================= -->
  <!-- CLARIFICATION FOOTER: SPATIAL QUERY ASSESSMENT                    -->
  <!-- ================================================================= -->
  <g transform="translate(60, 1270)">
    <rect width="2080" height="175" fill="#ffffff" stroke="#000000" stroke-width="1.5" rx="4" />
    <rect width="2080" height="28" fill="#f4f4f4" stroke="#000000" stroke-width="1.2" rx="3" />
    <text x="20" y="19" font-size="11.5" font-weight="800" letter-spacing="0.5">ARCHITECTURAL VERIFICATION &amp; SPATIAL QUERY ASSESSMENT (REF: THESIS SYSTEM SPECIFICATION)</text>

    <!-- Left Box: Spatial Clarification -->
    <g transform="translate(20, 40)">
      <text x="0" y="18" font-size="11" font-weight="700">1. Spatial Engine Placement:</text>
      <text x="0" y="36" font-size="10.5" fill="#444444">PostGIS is not a separate external tier (as incorrectly drawn in legacy draft diagrams), but an embedded extension inside PostgreSQL (Tier 3).</text>
      
      <text x="0" y="62" font-size="11" font-weight="700">2. Spatial Querying vs Storage:</text>
      <text x="0" y="80" font-size="10.5" fill="#444444">The system utilizes PostGIS for native spatial storage (EPSG:4326), GiST indexing, and server-side GeoJSON conversion via ST_AsGeoJSON. Bounding box viewport</text>
      <text x="0" y="96" font-size="10.5" fill="#444444">filtering and clustering are performed dynamically in Leaflet on the client (Tier 1). The server does not perform spatial distance/intersection queries.</text>
    </g>

    <!-- Right Box: Flow Sequence Correction -->
    <g transform="translate(1080, 40)">
      <text x="0" y="18" font-size="11" font-weight="700">3. Verified 5-Phase End-to-End Data Flow:</text>
      <text x="0" y="36" font-size="10.5" fill="#444444"><tspan font-weight="700">[Phase 1]</tspan> Client dispatches search/era query -&gt; <tspan font-weight="700">[Phase 2]</tspan> Express parses &amp; binds SQL parameters -&gt; <tspan font-weight="700">[Phase 3]</tspan> PostGIS serializes geometry via ST_AsGeoJSON -&gt;</text>
      <text x="0" y="56" font-size="10.5" fill="#444444"><tspan font-weight="700">[Phase 4]</tspan> Leaflet renders markers &amp; clusters -&gt; <tspan font-weight="700">[Phase 5]</tspan> Admin ingests records via ST_SetSRID(ST_GeomFromGeoJSON(...), 4326) and persists files to /uploads/.</text>
      
      <text x="0" y="84" font-size="10" font-weight="600" fill="#222222">Notation: Solid lines = Synchronous API / Database queries • Dashed lines = Binary file streams • Minimal Black &amp; White Edition</text>
    </g>
  </g>

</svg>`;
}

// Write the corrected workflow diagram SVG
const correctedWfSvg = generateCorrectedWorkflowSVG();
const wfSvgPath = path.resolve(__dirname, '..', 'workflow_diagram.svg');
const docsWfSvgPath = path.resolve(__dirname, '..', 'docs', 'workflow_diagram.svg');

fs.writeFileSync(wfSvgPath, correctedWfSvg, 'utf-8');
console.log('Saved corrected workflow SVG to:', wfSvgPath);

fs.writeFileSync(docsWfSvgPath, correctedWfSvg, 'utf-8');
console.log('Saved corrected workflow SVG to docs:', docsWfSvgPath);

// Render to PNG using Microsoft Edge headless
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const wfPngPath = path.resolve(__dirname, '..', 'workflow_diagram.png');
const docsWfPngPath = path.resolve(__dirname, '..', 'docs', 'workflow_diagram.png');
const docsWfJpgPath = path.resolve(__dirname, '..', 'docs', 'workflow_diagram.jpg');

if (fs.existsSync(edgePath)) {
  console.log('Rendering corrected workflow PNG via Edge headless...');
  execFileSync(edgePath, [
    '--headless',
    '--disable-gpu',
    `--screenshot=${wfPngPath}`,
    '--window-size=2200,1500',
    `file:///${wfSvgPath.replace(/\\/g, '/')}`
  ]);
  console.log('Workflow PNG rendered:', fs.existsSync(wfPngPath), 'Size:', fs.statSync(wfPngPath).size);
  fs.copyFileSync(wfPngPath, docsWfPngPath);
  fs.copyFileSync(wfPngPath, docsWfJpgPath);
  console.log('Updated docs/workflow_diagram.png and docs/workflow_diagram.jpg');
}
