const fs = require('fs');
const path = require('path');

function generateCleanERD() {
  const W = 2800;
  const H = 1950;

  // Colors and Typography
  const FONT_FAMILY = "'Times New Roman', Times, serif";
  const STROKE_COLOR = "#000000";
  const BG_COLOR = "#ffffff";

  let out = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="background-color: #ffffff;">
  <style>
    text {
      font-family: ${FONT_FAMILY};
      fill: ${STROKE_COLOR};
    }
    .entity-title {
      font-size: 16px;
      font-weight: bold;
      letter-spacing: 0.5px;
    }
    .rel-title {
      font-size: 12px;
      font-weight: bold;
      letter-spacing: 0.5px;
    }
    .card-label {
      font-size: 16px;
      font-weight: bold;
      font-style: italic;
    }
    .attr-text {
      font-size: 13.5px;
    }
    .attr-pk {
      font-size: 13.5px;
      font-weight: bold;
      text-decoration: underline;
    }
    .attr-fk {
      font-size: 13.5px;
      font-style: italic;
    }
    .line-solid {
      stroke: ${STROKE_COLOR};
      stroke-width: 1.4;
      fill: none;
    }
    .shape-rect {
      fill: ${BG_COLOR};
      stroke: ${STROKE_COLOR};
      stroke-width: 2;
    }
    .shape-rect-double {
      fill: ${BG_COLOR};
      stroke: ${STROKE_COLOR};
      stroke-width: 1.5;
    }
    .shape-diamond {
      fill: ${BG_COLOR};
      stroke: ${STROKE_COLOR};
      stroke-width: 1.6;
    }
    .shape-oval {
      fill: ${BG_COLOR};
      stroke: ${STROKE_COLOR};
      stroke-width: 1.3;
    }
    .shape-oval-dashed {
      fill: ${BG_COLOR};
      stroke: ${STROKE_COLOR};
      stroke-width: 1.3;
      stroke-dasharray: 4, 3;
    }
    .legend-title {
      font-size: 15px;
      font-weight: bold;
      letter-spacing: 0.5px;
    }
    .legend-text {
      font-size: 13.5px;
    }
  </style>

  <!-- Solid white background -->
  <rect width="${W}" height="${H}" fill="${BG_COLOR}" />

  <!-- ================================================================= -->
  <!-- 1. RELATIONSHIP CONNECTORS (ORTHOGONAL / CLEAN STEPPED PATHS)     -->
  <!-- ================================================================= -->
  <g id="relationship-lines">
    <!-- R1: HERITAGE_ASSETS (bottom 920, 930) to HAS_MEDIA (920, 1080) to HERITAGE_ASSET_MEDIA (920, 1260) -->
    <line x1="920" y1="930" x2="920" y2="1045" class="line-solid" />
    <line x1="920" y1="1115" x2="920" y2="1254" class="line-solid" />

    <!-- R2: MAP_REGIONS (2040, 360) to CONTAINS_DISTRICT (2040, 480) to MAP_DISTRICTS (2040, 600) -->
    <line x1="2040" y1="360" x2="2040" y2="445" class="line-solid" />
    <line x1="2040" y1="515" x2="2040" y2="600" class="line-solid" />

    <!-- R3: HERITAGE_ASSETS (1080, 770) to LOCATED_IN_REGION (1530, 320) to MAP_REGIONS (1920, 320) -->
    <path d="M 1080 770 L 1260 770 L 1260 320 L 1420 320" class="line-solid" />
    <line x1="1640" y1="320" x2="1920" y2="320" class="line-solid" />

    <!-- R4: HERITAGE_ASSETS (1080, 810) to LOCATED_IN_DISTRICT (1530, 640) to MAP_DISTRICTS (1920, 640) -->
    <path d="M 1080 810 L 1310 810 L 1310 640 L 1420 640" class="line-solid" />
    <line x1="1640" y1="640" x2="1920" y2="640" class="line-solid" />

    <!-- R5: HERITAGE_ASSETS (1080, 850) to WITHIN_PROTECTED_AREA (1530, 960) to MAP_PROTECTED_AREAS (1920, 960) -->
    <path d="M 1080 850 L 1310 850 L 1310 960 L 1410 960" class="line-solid" />
    <line x1="1650" y1="960" x2="1920" y2="960" class="line-solid" />

    <!-- R6: HERITAGE_ASSETS (1080, 890) to NEAR_RIVER (1530, 1260) to MAP_RIVERS (1920, 1260) -->
    <path d="M 1080 890 L 1260 890 L 1260 1260 L 1435 1260" class="line-solid" />
    <line x1="1625" y1="1260" x2="1920" y2="1260" class="line-solid" />

    <!-- R7: HERITAGE_ASSETS (920, 930) to ACCESSIBLE_BY_ROAD (1530, 1540) to MAP_ROADS (1920, 1540) -->
    <path d="M 980 930 L 980 1540 L 1420 1540" class="line-solid" />
    <line x1="1640" y1="1540" x2="1920" y2="1540" class="line-solid" />
  </g>

  <!-- Cardinalities -->
  <g id="cardinality-labels">
    <!-- R1: HERITAGE_ASSETS (1) -- HAS_MEDIA -- (N) HERITAGE_ASSET_MEDIA -->
    <text x="935" y="965" class="card-label">1</text>
    <text x="935" y="1235" class="card-label">N</text>

    <!-- R2: MAP_REGIONS (1) -- CONTAINS_DISTRICT -- (N) MAP_DISTRICTS -->
    <text x="2055" y="395" class="card-label">1</text>
    <text x="2055" y="580" class="card-label">N</text>

    <!-- R3: HERITAGE_ASSETS (N) -- LOCATED_IN_REGION -- (1) MAP_REGIONS -->
    <text x="1100" y="760" class="card-label">N</text>
    <text x="1890" y="310" class="card-label">1</text>

    <!-- R4: HERITAGE_ASSETS (N) -- LOCATED_IN_DISTRICT -- (1) MAP_DISTRICTS -->
    <text x="1100" y="800" class="card-label">N</text>
    <text x="1890" y="630" class="card-label">1</text>

    <!-- R5: HERITAGE_ASSETS (M) -- WITHIN_PROTECTED_AREA -- (N) MAP_PROTECTED_AREAS -->
    <text x="1100" y="840" class="card-label">M</text>
    <text x="1890" y="950" class="card-label">N</text>

    <!-- R6: HERITAGE_ASSETS (M) -- NEAR_RIVER -- (N) MAP_RIVERS -->
    <text x="1100" y="880" class="card-label">M</text>
    <text x="1890" y="1250" class="card-label">N</text>

    <!-- R7: HERITAGE_ASSETS (M) -- ACCESSIBLE_BY_ROAD -- (N) MAP_ROADS -->
    <text x="995" y="965" class="card-label">M</text>
    <text x="1890" y="1530" class="card-label">N</text>
  </g>

  <!-- ================================================================= -->
  <!-- 2. RELATIONSHIP DIAMONDS                                          -->
  <!-- ================================================================= -->
  <g id="relationship-diamonds">
    <!-- R1: HAS_MEDIA (cx=920, cy=1080) -->
    <polygon points="920,1045 1005,1080 920,1115 835,1080" class="shape-diamond" />
    <text x="920" y="1084" text-anchor="middle" class="rel-title">HAS_MEDIA</text>

    <!-- R2: CONTAINS_DISTRICT (cx=2040, cy=480) -->
    <polygon points="2040,445 2140,480 2040,515 1940,480" class="shape-diamond" />
    <text x="2040" y="484" text-anchor="middle" class="rel-title">CONTAINS_DISTRICT</text>

    <!-- R3: LOCATED_IN_REGION (cx=1530, cy=320) -->
    <polygon points="1530,285 1640,320 1530,355 1420,320" class="shape-diamond" />
    <text x="1530" y="324" text-anchor="middle" class="rel-title">LOCATED_IN_REGION</text>

    <!-- R4: LOCATED_IN_DISTRICT (cx=1530, cy=640) -->
    <polygon points="1530,605 1640,640 1530,675 1420,640" class="shape-diamond" />
    <text x="1530" y="644" text-anchor="middle" class="rel-title">LOCATED_IN_DISTRICT</text>

    <!-- R5: WITHIN_PROTECTED_AREA (cx=1530, cy=960) -->
    <polygon points="1530,925 1650,960 1530,995 1410,960" class="shape-diamond" />
    <text x="1530" y="964" text-anchor="middle" class="rel-title">WITHIN_PROTECTED_AREA</text>

    <!-- R6: NEAR_RIVER (cx=1530, cy=1260) -->
    <polygon points="1530,1225 1625,1260 1530,1295 1435,1260" class="shape-diamond" />
    <text x="1530" y="1264" text-anchor="middle" class="rel-title">NEAR_RIVER</text>

    <!-- R7: ACCESSIBLE_BY_ROAD (cx=1530, cy=1540) -->
    <polygon points="1530,1505 1640,1540 1530,1575 1420,1540" class="shape-diamond" />
    <text x="1530" y="1544" text-anchor="middle" class="rel-title">ACCESSIBLE_BY_ROAD</text>
  </g>

  <!-- ================================================================= -->
  <!-- 3. ENTITY: HERITAGE_ASSETS (Main Entity)                          -->
  <!-- Box: x=760, y=730, w=320, h=200                                   -->
  <!-- ================================================================= -->
  <g id="entity-heritage-assets">
    <!-- Attribute Lines -->
    <!-- Top Attributes: name, id, geom -->
    <line x1="820" y1="730" x2="780" y2="675" class="line-solid" />
    <line x1="920" y1="730" x2="920" y2="655" class="line-solid" />
    <line x1="1020" y1="730" x2="1060" y2="675" class="line-solid" />

    <!-- Left Column 1 lines from box left edge (x=760) to cx=580 -->
    <line x1="760" y1="745" x2="650" y2="520" class="line-solid" />
    <line x1="760" y1="760" x2="650" y2="570" class="line-solid" />
    <line x1="760" y1="775" x2="650" y2="620" class="line-solid" />
    <line x1="760" y1="790" x2="650" y2="670" class="line-solid" />
    <line x1="760" y1="805" x2="650" y2="720" class="line-solid" />
    <line x1="760" y1="820" x2="650" y2="770" class="line-solid" />
    <line x1="760" y1="835" x2="650" y2="820" class="line-solid" />
    <line x1="760" y1="850" x2="650" y2="870" class="line-solid" />
    <line x1="760" y1="865" x2="650" y2="920" class="line-solid" />
    <line x1="760" y1="880" x2="650" y2="970" class="line-solid" />
    <line x1="760" y1="895" x2="650" y2="1020" class="line-solid" />
    <line x1="760" y1="910" x2="650" y2="1070" class="line-solid" />

    <!-- Left Column 2 lines from cx=580 left edge (x=510) to cx=320 -->
    <line x1="510" y1="520" x2="395" y2="520" class="line-solid" />
    <line x1="510" y1="570" x2="395" y2="570" class="line-solid" />
    <line x1="510" y1="620" x2="395" y2="620" class="line-solid" />
    <line x1="510" y1="670" x2="395" y2="670" class="line-solid" />
    <line x1="510" y1="720" x2="395" y2="720" class="line-solid" />
    <line x1="510" y1="770" x2="395" y2="770" class="line-solid" />
    <line x1="510" y1="820" x2="395" y2="820" class="line-solid" />
    <line x1="510" y1="870" x2="395" y2="870" class="line-solid" />
    <line x1="510" y1="920" x2="395" y2="920" class="line-solid" />
    <line x1="510" y1="970" x2="395" y2="970" class="line-solid" />
    <line x1="510" y1="1020" x2="395" y2="1020" class="line-solid" />
    <line x1="510" y1="1070" x2="395" y2="1070" class="line-solid" />

    <!-- Far Left Column 3 lines from cx=320 left edge (x=245) to cx=100 -->
    <line x1="245" y1="670" x2="160" y2="670" class="line-solid" />
    <line x1="245" y1="720" x2="160" y2="720" class="line-solid" />
    <line x1="245" y1="770" x2="160" y2="770" class="line-solid" />
    <line x1="245" y1="820" x2="160" y2="820" class="line-solid" />
    <line x1="245" y1="870" x2="160" y2="870" class="line-solid" />
    <line x1="245" y1="920" x2="160" y2="920" class="line-solid" />

    <!-- Entity Rectangle -->
    <rect x="760" y="730" width="320" height="200" class="shape-rect" />
    <text x="920" y="835" text-anchor="middle" class="entity-title">HERITAGE_ASSETS</text>

    <!-- Top Ovals -->
    <ellipse cx="780" cy="660" rx="55" ry="17" class="shape-oval" />
    <text x="780" y="664" text-anchor="middle" class="attr-text">name</text>

    <ellipse cx="920" cy="638" rx="55" ry="17" class="shape-oval" />
    <text x="920" y="642" text-anchor="middle" class="attr-pk">id</text>

    <ellipse cx="1060" cy="660" rx="55" ry="17" class="shape-oval" />
    <text x="1060" y="664" text-anchor="middle" class="attr-text">geom</text>

    <!-- Column 1 (cx=580) -->
    <g>
      <ellipse cx="580" cy="520" rx="68" ry="16" class="shape-oval" />
      <text x="580" y="524" text-anchor="middle" class="attr-text">alternative_name</text>

      <ellipse cx="580" cy="570" rx="68" ry="16" class="shape-oval" />
      <text x="580" y="574" text-anchor="middle" class="attr-text">description</text>

      <ellipse cx="580" cy="620" rx="68" ry="16" class="shape-oval" />
      <text x="580" y="624" text-anchor="middle" class="attr-text">asset_type</text>

      <ellipse cx="580" cy="670" rx="68" ry="16" class="shape-oval" />
      <text x="580" y="674" text-anchor="middle" class="attr-text">asset_category</text>

      <ellipse cx="580" cy="720" rx="68" ry="16" class="shape-oval" />
      <text x="580" y="724" text-anchor="middle" class="attr-text">cultural_group</text>

      <ellipse cx="580" cy="770" rx="68" ry="16" class="shape-oval" />
      <text x="580" y="774" text-anchor="middle" class="attr-text">location_accuracy</text>

      <ellipse cx="580" cy="820" rx="68" ry="16" class="shape-oval" />
      <text x="580" y="824" text-anchor="middle" class="attr-text">elevation_m</text>

      <ellipse cx="580" cy="870" rx="68" ry="16" class="shape-oval" />
      <text x="580" y="874" text-anchor="middle" class="attr-text">gps_accuracy_m</text>

      <ellipse cx="580" cy="920" rx="68" ry="16" class="shape-oval" />
      <text x="580" y="924" text-anchor="middle" class="attr-text">region</text>

      <ellipse cx="580" cy="970" rx="68" ry="16" class="shape-oval" />
      <text x="580" y="974" text-anchor="middle" class="attr-text">district</text>

      <ellipse cx="580" cy="1020" rx="68" ry="16" class="shape-oval" />
      <text x="580" y="1024" text-anchor="middle" class="attr-text">community</text>

      <ellipse cx="580" cy="1070" rx="68" ry="16" class="shape-oval" />
      <text x="580" y="1074" text-anchor="middle" class="attr-text">location_description</text>
    </g>

    <!-- Column 2 (cx=320) -->
    <g>
      <ellipse cx="320" cy="520" rx="72" ry="16" class="shape-oval" />
      <text x="320" y="524" text-anchor="middle" class="attr-text">height_m</text>

      <ellipse cx="320" cy="570" rx="72" ry="16" class="shape-oval" />
      <text x="320" y="574" text-anchor="middle" class="attr-text">width_m</text>

      <ellipse cx="320" cy="620" rx="72" ry="16" class="shape-oval" />
      <text x="320" y="624" text-anchor="middle" class="attr-text">length_m</text>

      <ellipse cx="320" cy="670" rx="72" ry="16" class="shape-oval" />
      <text x="320" y="674" text-anchor="middle" class="attr-text">material</text>

      <ellipse cx="320" cy="720" rx="72" ry="16" class="shape-oval" />
      <text x="320" y="724" text-anchor="middle" class="attr-text">secondary_material</text>

      <ellipse cx="320" cy="770" rx="72" ry="16" class="shape-oval" />
      <text x="320" y="774" text-anchor="middle" class="attr-text">technique</text>

      <ellipse cx="320" cy="820" rx="72" ry="16" class="shape-oval" />
      <text x="320" y="824" text-anchor="middle" class="attr-text">condition</text>

      <ellipse cx="320" cy="870" rx="72" ry="16" class="shape-oval" />
      <text x="320" y="874" text-anchor="middle" class="attr-text">damage_type</text>

      <ellipse cx="320" cy="920" rx="72" ry="16" class="shape-oval" />
      <text x="320" y="924" text-anchor="middle" class="attr-text">conservation_status</text>

      <ellipse cx="320" cy="970" rx="72" ry="16" class="shape-oval" />
      <text x="320" y="974" text-anchor="middle" class="attr-text">period</text>

      <ellipse cx="320" cy="1020" rx="72" ry="16" class="shape-oval" />
      <text x="320" y="1024" text-anchor="middle" class="attr-text">period_start</text>

      <ellipse cx="320" cy="1070" rx="72" ry="16" class="shape-oval" />
      <text x="320" y="1074" text-anchor="middle" class="attr-text">period_end</text>
    </g>

    <!-- Column 3 (cx=100) -->
    <g>
      <ellipse cx="100" cy="670" rx="60" ry="16" class="shape-oval" />
      <text x="100" y="674" text-anchor="middle" class="attr-text">origin_location</text>

      <ellipse cx="100" cy="720" rx="60" ry="16" class="shape-oval" />
      <text x="100" y="724" text-anchor="middle" class="attr-text">ownership</text>

      <ellipse cx="100" cy="770" rx="60" ry="16" class="shape-oval" />
      <text x="100" y="774" text-anchor="middle" class="attr-text">verification_status</text>

      <ellipse cx="100" cy="820" rx="60" ry="16" class="shape-oval" />
      <text x="100" y="824" text-anchor="middle" class="attr-text">data_source</text>

      <ellipse cx="100" cy="870" rx="60" ry="16" class="shape-oval" />
      <text x="100" y="874" text-anchor="middle" class="attr-text">observer</text>

      <ellipse cx="100" cy="920" rx="60" ry="16" class="shape-oval" />
      <text x="100" y="924" text-anchor="middle" class="attr-text">survey_method</text>
    </g>
  </g>

  <!-- ================================================================= -->
  <!-- 4. ENTITY: HERITAGE_ASSET_MEDIA (Weak Entity)                     -->
  <!-- Box: x=760, y=1260, w=320, h=150                                  -->
  <!-- ================================================================= -->
  <g id="entity-heritage-asset-media">
    <!-- Attribute Lines -->
    <line x1="760" y1="1280" x2="630" y2="1200" class="line-solid" />
    <line x1="760" y1="1300" x2="630" y2="1245" class="line-solid" />
    <line x1="760" y1="1320" x2="630" y2="1290" class="line-solid" />
    <line x1="760" y1="1340" x2="630" y2="1335" class="line-solid" />
    <line x1="760" y1="1360" x2="630" y2="1380" class="line-solid" />
    <line x1="760" y1="1380" x2="630" y2="1425" class="line-solid" />
    <line x1="760" y1="1395" x2="630" y2="1470" class="line-solid" />
    <line x1="760" y1="1405" x2="630" y2="1515" class="line-solid" />

    <!-- Double border rectangle for Weak Entity -->
    <rect x="754" y="1254" width="332" height="162" class="shape-rect-double" />
    <rect x="760" y="1260" width="320" height="150" class="shape-rect-double" />
    <text x="920" y="1340" text-anchor="middle" class="entity-title">HERITAGE_ASSET_MEDIA</text>

    <!-- Ovals (cx=570) -->
    <g>
      <ellipse cx="570" cy="1200" rx="55" ry="16" class="shape-oval" />
      <text x="570" y="1204" text-anchor="middle" class="attr-pk">id</text>

      <ellipse cx="570" cy="1245" rx="55" ry="16" class="shape-oval-dashed" />
      <text x="570" y="1249" text-anchor="middle" class="attr-fk">asset_id</text>

      <ellipse cx="570" cy="1290" rx="55" ry="16" class="shape-oval" />
      <text x="570" y="1294" text-anchor="middle" class="attr-text">media_type</text>

      <ellipse cx="570" cy="1335" rx="55" ry="16" class="shape-oval" />
      <text x="570" y="1339" text-anchor="middle" class="attr-text">file_path</text>

      <ellipse cx="570" cy="1380" rx="55" ry="16" class="shape-oval" />
      <text x="570" y="1384" text-anchor="middle" class="attr-text">file_name</text>

      <ellipse cx="570" cy="1425" rx="55" ry="16" class="shape-oval" />
      <text x="570" y="1429" text-anchor="middle" class="attr-text">caption</text>

      <ellipse cx="570" cy="1470" rx="55" ry="16" class="shape-oval" />
      <text x="570" y="1474" text-anchor="middle" class="attr-text">alt_text</text>

      <ellipse cx="570" cy="1515" rx="55" ry="16" class="shape-oval" />
      <text x="570" y="1519" text-anchor="middle" class="attr-text">is_primary</text>
    </g>
  </g>

  <!-- ================================================================= -->
  <!-- 5. SPATIAL ENTITIES (Right Side)                                  -->
  <!-- ================================================================= -->
  <!-- MAP_REGIONS (x=1920, y=280, w=240, h=80) -->
  <g id="entity-map-regions">
    <line x1="2160" y1="295" x2="2275" y2="240" class="line-solid" />
    <line x1="2160" y1="310" x2="2275" y2="285" class="line-solid" />
    <line x1="2160" y1="330" x2="2275" y2="330" class="line-solid" />
    <line x1="2160" y1="350" x2="2275" y2="375" class="line-solid" />

    <rect x="1920" y="280" width="240" height="80" class="shape-rect" />
    <text x="2040" y="326" text-anchor="middle" class="entity-title">MAP_REGIONS</text>

    <ellipse cx="2325" cy="240" rx="50" ry="16" class="shape-oval" />
    <text x="2325" y="244" text-anchor="middle" class="attr-pk">id</text>

    <ellipse cx="2325" cy="285" rx="50" ry="16" class="shape-oval" />
    <text x="2325" y="289" text-anchor="middle" class="attr-text">name</text>

    <ellipse cx="2325" cy="330" rx="50" ry="16" class="shape-oval" />
    <text x="2325" y="334" text-anchor="middle" class="attr-text">name_en</text>

    <ellipse cx="2325" cy="375" rx="50" ry="16" class="shape-oval" />
    <text x="2325" y="379" text-anchor="middle" class="attr-text">geom</text>
  </g>

  <!-- MAP_DISTRICTS (x=1920, y=600, w=240, h=80) -->
  <g id="entity-map-districts">
    <line x1="2160" y1="615" x2="2275" y2="560" class="line-solid" />
    <line x1="2160" y1="630" x2="2275" y2="605" class="line-solid" />
    <line x1="2160" y1="650" x2="2275" y2="650" class="line-solid" />
    <line x1="2160" y1="670" x2="2275" y2="695" class="line-solid" />

    <rect x="1920" y="600" width="240" height="80" class="shape-rect" />
    <text x="2040" y="646" text-anchor="middle" class="entity-title">MAP_DISTRICTS</text>

    <ellipse cx="2325" cy="560" rx="50" ry="16" class="shape-oval" />
    <text x="2325" y="564" text-anchor="middle" class="attr-pk">id</text>

    <ellipse cx="2325" cy="605" rx="50" ry="16" class="shape-oval" />
    <text x="2325" y="609" text-anchor="middle" class="attr-text">name</text>

    <ellipse cx="2325" cy="650" rx="50" ry="16" class="shape-oval" />
    <text x="2325" y="654" text-anchor="middle" class="attr-text">label</text>

    <ellipse cx="2325" cy="695" rx="50" ry="16" class="shape-oval" />
    <text x="2325" y="699" text-anchor="middle" class="attr-text">geom</text>
  </g>

  <!-- MAP_PROTECTED_AREAS (x=1920, y=920, w=240, h=80) -->
  <g id="entity-map-protected-areas">
    <line x1="2160" y1="940" x2="2275" y2="900" class="line-solid" />
    <line x1="2160" y1="960" x2="2275" y2="960" class="line-solid" />
    <line x1="2160" y1="980" x2="2275" y2="1020" class="line-solid" />

    <rect x="1920" y="920" width="240" height="80" class="shape-rect" />
    <text x="2040" y="966" text-anchor="middle" class="entity-title">MAP_PROTECTED_AREAS</text>

    <ellipse cx="2325" cy="900" rx="50" ry="16" class="shape-oval" />
    <text x="2325" y="904" text-anchor="middle" class="attr-pk">id</text>

    <ellipse cx="2325" cy="960" rx="50" ry="16" class="shape-oval" />
    <text x="2325" y="964" text-anchor="middle" class="attr-text">name</text>

    <ellipse cx="2325" cy="1020" rx="50" ry="16" class="shape-oval" />
    <text x="2325" y="1024" text-anchor="middle" class="attr-text">geom</text>
  </g>

  <!-- MAP_RIVERS (x=1920, y=1220, w=240, h=80) -->
  <g id="entity-map-rivers">
    <line x1="2160" y1="1240" x2="2275" y2="1200" class="line-solid" />
    <line x1="2160" y1="1260" x2="2275" y2="1260" class="line-solid" />
    <line x1="2160" y1="1280" x2="2275" y2="1320" class="line-solid" />

    <rect x="1920" y="1220" width="240" height="80" class="shape-rect" />
    <text x="2040" y="1266" text-anchor="middle" class="entity-title">MAP_RIVERS</text>

    <ellipse cx="2325" cy="1200" rx="50" ry="16" class="shape-oval" />
    <text x="2325" y="1204" text-anchor="middle" class="attr-pk">id</text>

    <ellipse cx="2325" cy="1260" rx="50" ry="16" class="shape-oval" />
    <text x="2325" y="1264" text-anchor="middle" class="attr-text">name</text>

    <ellipse cx="2325" cy="1320" rx="50" ry="16" class="shape-oval" />
    <text x="2325" y="1324" text-anchor="middle" class="attr-text">geom</text>
  </g>

  <!-- MAP_ROADS (x=1920, y=1500, w=240, h=80) -->
  <g id="entity-map-roads">
    <line x1="2160" y1="1520" x2="2275" y2="1480" class="line-solid" />
    <line x1="2160" y1="1540" x2="2275" y2="1540" class="line-solid" />
    <line x1="2160" y1="1560" x2="2275" y2="1600" class="line-solid" />

    <rect x="1920" y="1500" width="240" height="80" class="shape-rect" />
    <text x="2040" y="1546" text-anchor="middle" class="entity-title">MAP_ROADS</text>

    <ellipse cx="2325" cy="1480" rx="50" ry="16" class="shape-oval" />
    <text x="2325" y="1484" text-anchor="middle" class="attr-pk">id</text>

    <ellipse cx="2325" cy="1540" rx="50" ry="16" class="shape-oval" />
    <text x="2325" y="1544" text-anchor="middle" class="attr-text">name</text>

    <ellipse cx="2325" cy="1600" rx="50" ry="16" class="shape-oval" />
    <text x="2325" y="1604" text-anchor="middle" class="attr-text">geom</text>
  </g>

  <!-- ================================================================= -->
  <!-- 6. LEGEND (BOTTOM)                                                -->
  <!-- ================================================================= -->
  <g id="legend" transform="translate(100, 1750)">
    <rect x="0" y="0" width="2600" height="120" class="shape-rect" stroke-width="1.2" />
    <text x="30" y="32" class="legend-title">LEGEND</text>

    <!-- Item 1: Entity -->
    <g transform="translate(180, 20)">
      <rect x="0" y="25" width="80" height="34" class="shape-rect" stroke-width="1.5" />
      <text x="40" y="47" text-anchor="middle" class="attr-text" font-weight="bold">Entity</text>
      <text x="40" y="80" text-anchor="middle" class="legend-text">Entity</text>
    </g>

    <!-- Item 2: Weak Entity -->
    <g transform="translate(420, 20)">
      <rect x="-3" y="22" width="86" height="40" class="shape-rect-double" />
      <rect x="0" y="25" width="80" height="34" class="shape-rect-double" />
      <text x="40" y="47" text-anchor="middle" class="attr-text" font-weight="bold">Weak</text>
      <text x="40" y="80" text-anchor="middle" class="legend-text">Weak Entity</text>
    </g>

    <!-- Item 3: Relationship -->
    <g transform="translate(680, 20)">
      <polygon points="50,22 100,42 50,62 0,42" class="shape-diamond" stroke-width="1.5" />
      <text x="50" y="46" text-anchor="middle" class="attr-text" font-weight="bold">Rel</text>
      <text x="50" y="80" text-anchor="middle" class="legend-text">Relationship</text>
    </g>

    <!-- Item 4: Attribute -->
    <g transform="translate(940, 20)">
      <ellipse cx="50" cy="42" rx="45" ry="16" class="shape-oval" />
      <text x="50" y="46" text-anchor="middle" class="attr-text">attribute</text>
      <text x="50" y="80" text-anchor="middle" class="legend-text">Attribute</text>
    </g>

    <!-- Item 5: Primary Key -->
    <g transform="translate(1180, 20)">
      <ellipse cx="50" cy="42" rx="45" ry="16" class="shape-oval" />
      <text x="50" y="46" text-anchor="middle" class="attr-pk">id</text>
      <text x="50" y="80" text-anchor="middle" class="legend-text">Primary Key</text>
    </g>

    <!-- Item 6: Foreign Key -->
    <g transform="translate(1420, 20)">
      <ellipse cx="50" cy="42" rx="45" ry="16" class="shape-oval-dashed" />
      <text x="50" y="46" text-anchor="middle" class="attr-fk">ref_id</text>
      <text x="50" y="80" text-anchor="middle" class="legend-text">Foreign Key</text>
    </g>

    <!-- Item 7: Cardinality -->
    <g transform="translate(1680, 20)">
      <line x1="0" y1="42" x2="100" y2="42" class="line-solid" />
      <text x="15" y="35" class="card-label">1</text>
      <text x="80" y="35" class="card-label">N</text>
      <text x="50" y="80" text-anchor="middle" class="legend-text">Cardinality (1:N, M:N)</text>
    </g>
  </g>

</svg>`;

  return out;
}

const outputPath = path.join(__dirname, '..', 'database_erd.svg');
fs.writeFileSync(outputPath, generateCleanERD(), 'utf8');
console.log('Successfully generated clean orthogonal ERD at:', outputPath);
