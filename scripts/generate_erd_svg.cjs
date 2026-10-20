const fs = require('fs');
const path = require('path');

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

function generateERDSVG() {
  const W = 3200;
  const H = 2150;

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif">
  <defs>
    <!-- Background Grid Pattern -->
    <pattern id="erd-grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.025)" stroke-width="1" />
    </pattern>

    <!-- Gradients -->
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0d1322" />
      <stop offset="50%" stop-color="#0a0e1a" />
      <stop offset="100%" stop-color="#070a12" />
    </linearGradient>

    <linearGradient id="headerGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#2563eb" />
    </linearGradient>

    <linearGradient id="weakHeaderGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#7e22ce" />
      <stop offset="100%" stop-color="#9333ea" />
    </linearGradient>

    <linearGradient id="relGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#065f46" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>

    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.5" />
    </filter>
  </defs>

  <!-- Background Layer -->
  <rect width="${W}" height="${H}" fill="url(#bgGrad)" />
  <rect width="${W}" height="${H}" fill="url(#erd-grid)" />

  <!-- ================================================================= -->
  <!-- TOP HEADER BANNER                                                 -->
  <!-- ================================================================= -->
  <g transform="translate(60, 40)" filter="url(#shadow)">
    <rect width="3080" height="90" rx="12" fill="#111827" stroke="#1f2937" stroke-width="2" />
    
    <!-- Icon -->
    <rect x="25" y="20" width="50" height="50" rx="10" fill="#0369a1" />
    <polygon points="50,28 65,45 50,62 35,45" fill="#38bdf8" />

    <text x="95" y="44" font-size="24" font-weight="800" fill="#ffffff" letter-spacing="1">
      PROJECT EPOCH <tspan fill="#38bdf8">— DATABASE ENTITY RELATIONSHIP DIAGRAM (ERD)</tspan>
    </text>
    <text x="95" y="68" font-size="13.5" font-weight="400" fill="#9ca3af">
      Conforms to Peter Chen ERD Modeling Rules (Rectangles = Entities • Diamonds = Relationships • Ovals = Attributes) &amp; Martin Crow&apos;s Foot Cardinalities
    </text>

    <!-- Right Badge -->
    <g transform="translate(2680, 24)">
      <rect width="370" height="42" rx="8" fill="#1f2937" stroke="#374151" />
      <circle cx="20" cy="21" r="6" fill="#10b981" />
      <text x="36" y="26" font-family="'Consolas', 'Courier New', monospace" font-size="12" font-weight="700" fill="#e5e7eb">POSTGRESQL 16 + POSTGIS SPATIAL</text>
    </g>
  </g>

  <!-- ================================================================= -->
  <!-- NOTATION GUIDE AND CARDINALITY LEGEND PANEL (TOP RIGHT)              -->
  <!-- ================================================================= -->
  <g transform="translate(2100, 150)" filter="url(#shadow)">
    <rect width="1040" height="270" rx="12" fill="#111827" stroke="#374151" stroke-width="1.5" />
    
    <text x="25" y="32" font-size="15" font-weight="800" fill="#ffffff" letter-spacing="0.8">
      ERD SPECIFICATION &amp; CARDINALITY GUIDE (SLIDE RULES)
    </text>
    <line x1="25" y1="44" x2="1015" y2="44" stroke="#374151" stroke-width="1" />

    <!-- Notation Shapes Row -->
    <!-- Entity -->
    <g transform="translate(30, 62)">
      <rect width="115" height="42" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
      <rect width="115" height="15" rx="6" fill="#0284c7" />
      <rect width="115" height="5" y="10" fill="#0284c7" />
      <text x="57" y="12" font-size="9.5" font-weight="800" fill="#ffffff" text-anchor="middle">ENTITY</text>
      <text x="57" y="31" font-size="10" font-weight="600" fill="#cbd5e1" text-anchor="middle">Rectangle</text>
    </g>

    <!-- Weak Entity -->
    <g transform="translate(165, 62)">
      <rect x="-3" y="-3" width="121" height="48" rx="8" fill="none" stroke="#c084fc" stroke-width="1.5" />
      <rect width="115" height="42" rx="6" fill="#2e1065" stroke="#a855f7" stroke-width="2" />
      <rect width="115" height="15" rx="6" fill="#7e22ce" />
      <rect width="115" height="5" y="10" fill="#7e22ce" />
      <text x="57" y="12" font-size="9.5" font-weight="800" fill="#ffffff" text-anchor="middle">WEAK ENTITY</text>
      <text x="57" y="31" font-size="10" font-weight="600" fill="#cbd5e1" text-anchor="middle">Double Border</text>
    </g>

    <!-- Relationship Diamond -->
    <g transform="translate(315, 62)">
      <polygon points="55,0 110,21 55,42 0,21" fill="#064e3b" stroke="#10b981" stroke-width="2" />
      <text x="55" y="25" font-family="'Consolas', monospace" font-size="9.5" font-weight="700" fill="#ecfdf5" text-anchor="middle">RELATION</text>
    </g>

    <!-- Attributes -->
    <g transform="translate(450, 62)">
      <ellipse cx="50" cy="21" rx="48" ry="18" fill="#431407" stroke="#f97316" stroke-width="2" />
      <text x="50" y="25" font-family="'Consolas', monospace" font-size="10" font-weight="700" fill="#fed7aa" text-anchor="middle" text-decoration="underline">id [PK]</text>
    </g>

    <g transform="translate(565, 62)">
      <ellipse cx="50" cy="21" rx="48" ry="18" fill="#1e1b4b" stroke="#818cf8" stroke-width="1.5" />
      <text x="50" y="25" font-family="'Consolas', monospace" font-size="10" font-weight="600" fill="#e0e7ff" text-anchor="middle">attribute</text>
    </g>

    <g transform="translate(680, 62)">
      <ellipse cx="50" cy="21" rx="48" ry="18" fill="#3b0764" stroke="#e879f9" stroke-width="1.5" stroke-dasharray="3 2" />
      <text x="50" y="25" font-family="'Consolas', monospace" font-size="10" font-weight="600" fill="#f5d0fe" text-anchor="middle">ref_id [FK]</text>
    </g>

    <g transform="translate(795, 62)">
      <ellipse cx="50" cy="21" rx="48" ry="18" fill="#083344" stroke="#06b6d4" stroke-width="1.8" />
      <text x="50" y="25" font-family="'Consolas', monospace" font-size="10" font-weight="600" fill="#67e8f9" text-anchor="middle">geom (GIS)</text>
    </g>

    <!-- Cardinality Guide (Rule 6 in slide) -->
    <line x1="25" y1="125" x2="1015" y2="125" stroke="#374151" stroke-width="1" />
    <text x="25" y="148" font-size="12.5" font-weight="700" fill="#f3f4f6">
      CARDINALITY FORMATS (Martin / Crow&apos;s Foot Notation &amp; Slide Example):
    </text>

    <!-- Badges Row -->
    <g transform="translate(25, 165)">
      <!-- 1,1 -->
      <rect width="52" height="24" rx="4" fill="#1f2937" stroke="#f59e0b" stroke-width="1.5" />
      <text x="26" y="16" font-family="'Consolas', monospace" font-size="11" font-weight="700" fill="#fbbf24" text-anchor="middle">(1,1)</text>
      <text x="62" y="16" font-size="11" fill="#cbd5e1">One and only one (Mandatory, 1)</text>

      <!-- 0,1 -->
      <g transform="translate(280, 0)">
        <rect width="52" height="24" rx="4" fill="#1f2937" stroke="#f59e0b" stroke-width="1.5" />
        <text x="26" y="16" font-family="'Consolas', monospace" font-size="11" font-weight="700" fill="#fbbf24" text-anchor="middle">(0,1)</text>
        <text x="62" y="16" font-size="11" fill="#cbd5e1">Zero or one (Optional, 0..1)</text>
      </g>

      <!-- 0,n -->
      <g transform="translate(560, 0)">
        <rect width="52" height="24" rx="4" fill="#1f2937" stroke="#f59e0b" stroke-width="1.5" />
        <text x="26" y="16" font-family="'Consolas', monospace" font-size="11" font-weight="700" fill="#fbbf24" text-anchor="middle">(0,n)</text>
        <text x="62" y="16" font-size="11" fill="#cbd5e1">Zero or many (Optional, 0..*)</text>
      </g>

      <!-- 1,n -->
      <g transform="translate(800, 0)">
        <rect width="52" height="24" rx="4" fill="#1f2937" stroke="#f59e0b" stroke-width="1.5" />
        <text x="26" y="16" font-family="'Consolas', monospace" font-size="11" font-weight="700" fill="#fbbf24" text-anchor="middle">(1,n)</text>
        <text x="62" y="16" font-size="11" fill="#cbd5e1">One or more (1..*)</text>
      </g>
    </g>

    <!-- Slide Example line -->
    <g transform="translate(25, 205)">
      <rect width="990" height="45" rx="6" fill="#0f172a" stroke="#1e293b" />
      <text x="15" y="27" font-size="11.5" fill="#94a3b8">
        <tspan font-weight="700" fill="#38bdf8">Guide Slide Pattern:</tspan> Entity <tspan font-family="'Consolas', monospace" fill="#fbbf24">— (1,1) — ◇ RELATION ◇ — (0,n) —</tspan> Entity • Rectangles for entities, Diamonds on connectors, Ovals for attributes.
      </text>
    </g>
  </g>
`;

  // Helper for Relationship Diamond
  function drawDiamond(cx, cy, w, h, name, subtext) {
    const hw = w / 2;
    const hh = h / 2;
    return `
    <g transform="translate(${cx}, ${cy})" filter="url(#shadow)">
      <polygon points="0,-${hh} ${hw},0 0,${hh} -${hw},0" fill="url(#relGrad)" stroke="#10b981" stroke-width="2.5" />
      <text y="-3" font-family="'Consolas', monospace" font-size="12" font-weight="700" fill="#ecfdf5" text-anchor="middle">${escapeXml(name)}</text>
      ${subtext ? `<text y="15" font-size="10" font-weight="500" fill="#a7f3d0" text-anchor="middle">${escapeXml(subtext)}</text>` : ''}
    </g>`;
  }

  // Helper for Cardinality Badge
  function drawBadge(cx, cy, label) {
    return `
    <g transform="translate(${cx}, ${cy})">
      <rect x="-26" y="-12" width="52" height="24" rx="4" fill="#0f172a" stroke="#f59e0b" stroke-width="1.5" />
      <text y="5" font-family="'Consolas', monospace" font-size="11.5" font-weight="700" fill="#fbbf24" text-anchor="middle">${escapeXml(label)}</text>
    </g>`;
  }

  // =========================================================================
  // CONNECTOR LINES (Draw before boxes)
  // =========================================================================
  svg += `
  <g id="connectors">
    <!-- 1. HERITAGE_ASSETS to HAS_MEDIA to HERITAGE_ASSET_MEDIA -->
    <line x1="1080" y1="1140" x2="1080" y2="1310" stroke="#10b981" stroke-width="2.5" />
    <line x1="1080" y1="1410" x2="1080" y2="1580" stroke="#10b981" stroke-width="2.5" />

    <!-- 2. MAP_REGIONS to CONTAINS_DISTRICT to MAP_DISTRICTS -->
    <line x1="2400" y1="695" x2="2400" y2="765" stroke="#10b981" stroke-width="2.5" />
    <line x1="2400" y1="855" x2="2400" y2="920" stroke="#10b981" stroke-width="2.5" />

    <!-- 3. HERITAGE_ASSETS to LOCATED_IN_REGION to MAP_REGIONS -->
    <path d="M 1280 930 C 1450 860, 1580 620, 1640 620" fill="none" stroke="#10b981" stroke-width="2.5" />
    <line x1="1820" y1="620" x2="2220" y2="620" stroke="#10b981" stroke-width="2.5" />

    <!-- 4. HERITAGE_ASSETS to LOCATED_IN_DISTRICT to MAP_DISTRICTS -->
    <path d="M 1280 1000 C 1450 990, 1550 980, 1630 980" fill="none" stroke="#10b981" stroke-width="2.5" />
    <line x1="1830" y1="980" x2="2220" y2="980" stroke="#10b981" stroke-width="2.5" />

    <!-- 5. HERITAGE_ASSETS to WITHIN_PROTECTED_AREA to MAP_PROTECTED_AREAS -->
    <path d="M 1280 1070 C 1450 1140, 1550 1260, 1610 1260" fill="none" stroke="#10b981" stroke-width="2.5" />
    <line x1="1850" y1="1260" x2="2220" y2="1260" stroke="#10b981" stroke-width="2.5" />

    <!-- 6. HERITAGE_ASSETS to NEAR_RIVER to MAP_RIVERS -->
    <path d="M 1220 1140 C 1350 1300, 1550 1500, 1645 1500" fill="none" stroke="#10b981" stroke-width="2.5" />
    <line x1="1815" y1="1500" x2="2220" y2="1500" stroke="#10b981" stroke-width="2.5" />

    <!-- 7. HERITAGE_ASSETS to ACCESSIBLE_BY_ROAD to MAP_ROADS -->
    <path d="M 1160 1140 C 1260 1400, 1500 1740, 1625 1740" fill="none" stroke="#10b981" stroke-width="2.5" />
    <line x1="1835" y1="1740" x2="2220" y2="1740" stroke="#10b981" stroke-width="2.5" />
  </g>
`;

  // =========================================================================
  // RELATIONSHIP DIAMONDS & CARDINALITIES
  // =========================================================================
  svg += `
  <g id="diamonds-and-cardinalities">
    <!-- R1: HAS_MEDIA -->
    ${drawDiamond(1080, 1360, 170, 80, 'HAS_MEDIA', '1-to-Many Media')}
    ${drawBadge(1080, 1180, '(1,1)')}
    ${drawBadge(1080, 1540, '(0,n)')}

    <!-- R2: CONTAINS_DISTRICT -->
    ${drawDiamond(2400, 810, 190, 80, 'CONTAINS_DISTRICT', 'ST_Contains')}
    ${drawBadge(2400, 725, '(1,1)')}
    ${drawBadge(2400, 895, '(0,n)')}

    <!-- R3: LOCATED_IN_REGION -->
    ${drawDiamond(1730, 620, 180, 76, 'LOCATED_IN_REGION', 'Administrative / Spatial')}
    ${drawBadge(1330, 900, '(0,n)')}
    ${drawBadge(2160, 620, '(0,1)')}

    <!-- R4: LOCATED_IN_DISTRICT -->
    ${drawDiamond(1730, 980, 190, 76, 'LOCATED_IN_DISTRICT', 'Administrative / Spatial')}
    ${drawBadge(1340, 1000, '(0,n)')}
    ${drawBadge(2160, 980, '(0,1)')}

    <!-- R5: WITHIN_PROTECTED_AREA -->
    ${drawDiamond(1730, 1260, 220, 76, 'WITHIN_PROTECTED_AREA', 'ST_Intersects (M:N)')}
    ${drawBadge(1350, 1100, '(0,n)')}
    ${drawBadge(2160, 1260, '(0,n)')}

    <!-- R6: NEAR_RIVER -->
    ${drawDiamond(1730, 1500, 170, 76, 'NEAR_RIVER', 'ST_DWithin (M:N)')}
    ${drawBadge(1310, 1220, '(0,n)')}
    ${drawBadge(2160, 1500, '(0,n)')}

    <!-- R7: ACCESSIBLE_BY_ROAD -->
    ${drawDiamond(1730, 1740, 190, 76, 'ACCESSIBLE_BY_ROAD', 'ST_DWithin (M:N)')}
    ${drawBadge(1240, 1300, '(0,n)')}
    ${drawBadge(2160, 1740, '(0,n)')}
  </g>
`;

  // Helper for Attribute Oval
  function drawOval(cx, cy, label, type = 'normal', rx = 65, ry = 20) {
    let fill = '#111827';
    let stroke = '#6b7280';
    let textColor = '#f3f4f6';
    let dash = 'none';
    let underline = false;

    if (type === 'pk') {
      fill = '#431407';
      stroke = '#f97316';
      textColor = '#fed7aa';
      underline = true;
    } else if (type === 'fk') {
      fill = '#3b0764';
      stroke = '#c084fc';
      textColor = '#f5d0fe';
      dash = '3 2';
    } else if (type === 'geom') {
      fill = '#083344';
      stroke = '#06b6d4';
      textColor = '#67e8f9';
    }

    return `
    <g transform="translate(${cx}, ${cy})">
      <ellipse cx="0" cy="0" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="1.8" stroke-dasharray="${dash}" />
      <text y="4" font-family="'Consolas', monospace" font-size="11" font-weight="${type === 'pk' ? '700' : '500'}" fill="${textColor}" text-anchor="middle" ${underline ? 'text-decoration="underline"' : ''}>${escapeXml(label)}</text>
    </g>`;
  }

  // =========================================================================
  // ENTITY 1: HERITAGE_ASSETS (Main Entity)
  // Box: X = 880, Y = 900, W = 400, H = 240
  // =========================================================================
  svg += `
  <g id="entity-heritage-assets">
    <!-- Connectors to Left Column 1 (x=660) -->
    <line x1="880" y1="920" x2="725" y2="700" stroke="#374151" stroke-width="1.5" />
    <line x1="880" y1="940" x2="725" y2="750" stroke="#374151" stroke-width="1.5" />
    <line x1="880" y1="960" x2="725" y2="800" stroke="#374151" stroke-width="1.5" />
    <line x1="880" y1="980" x2="725" y2="850" stroke="#374151" stroke-width="1.5" />
    <line x1="880" y1="1000" x2="725" y2="900" stroke="#374151" stroke-width="1.5" />
    <line x1="880" y1="1020" x2="725" y2="950" stroke="#374151" stroke-width="1.5" />
    <line x1="880" y1="1040" x2="725" y2="1000" stroke="#374151" stroke-width="1.5" />
    <line x1="880" y1="1060" x2="725" y2="1050" stroke="#374151" stroke-width="1.5" />
    <line x1="880" y1="1080" x2="725" y2="1100" stroke="#374151" stroke-width="1.5" />
    <line x1="880" y1="1100" x2="725" y2="1150" stroke="#374151" stroke-width="1.5" />

    <!-- Connectors to Far Left Column 2 (x=380) -->
    <line x1="595" y1="700" x2="455" y2="700" stroke="#374151" stroke-width="1.2" />
    <line x1="595" y1="750" x2="455" y2="750" stroke="#374151" stroke-width="1.2" />
    <line x1="595" y1="800" x2="455" y2="800" stroke="#374151" stroke-width="1.2" />
    <line x1="595" y1="850" x2="455" y2="850" stroke="#374151" stroke-width="1.2" />
    <line x1="595" y1="900" x2="455" y2="900" stroke="#374151" stroke-width="1.2" />
    <line x1="595" y1="950" x2="455" y2="950" stroke="#374151" stroke-width="1.2" />
    <line x1="595" y1="1000" x2="455" y2="1000" stroke="#374151" stroke-width="1.2" />
    <line x1="595" y1="1050" x2="455" y2="1050" stroke="#374151" stroke-width="1.2" />
    <line x1="595" y1="1100" x2="455" y2="1100" stroke="#374151" stroke-width="1.2" />
    <line x1="595" y1="1150" x2="455" y2="1150" stroke="#374151" stroke-width="1.2" />

    <!-- Connectors to Top Attributes -->
    <line x1="970" y1="900" x2="880" y2="800" stroke="#374151" stroke-width="1.5" />
    <line x1="1080" y1="900" x2="1080" y2="790" stroke="#374151" stroke-width="1.8" />
    <line x1="1190" y1="900" x2="1280" y2="800" stroke="#374151" stroke-width="1.8" />

    <!-- Entity Rectangle -->
    <g filter="url(#shadow)">
      <rect x="880" y="900" width="400" height="240" rx="10" fill="#111827" stroke="#38bdf8" stroke-width="2.5" />
      <rect x="880" y="900" width="400" height="52" rx="10" fill="url(#headerGrad)" />
      <rect x="880" y="942" width="400" height="10" fill="url(#headerGrad)" />
      <text x="1080" y="932" font-size="18" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="1">HERITAGE_ASSETS</text>
      <text x="1080" y="946" font-family="'Consolas', monospace" font-size="10.5" font-weight="600" fill="#e0f2fe" text-anchor="middle">PRIMARY SYSTEM ENTITY</text>
      
      <!-- Internal attributes overview for high-level readability -->
      <g transform="translate(905, 975)">
        <text x="0" y="16" font-family="'Consolas', monospace" font-size="11" font-weight="700" fill="#f97316">PK: id (text / UUID)</text>
        <text x="0" y="34" font-family="'Consolas', monospace" font-size="11" font-weight="600" fill="#38bdf8">Spatial: geom (Geometry, 4326)</text>
        <text x="0" y="52" font-family="'Consolas', monospace" font-size="11" fill="#e2e8f0">Classification: type, category, culture</text>
        <text x="0" y="70" font-family="'Consolas', monospace" font-size="11" fill="#cbd5e1">Location: region, district, community</text>
        <text x="0" y="88" font-family="'Consolas', monospace" font-size="11" fill="#cbd5e1">Physical: dimensions, material, condition</text>
        <text x="0" y="106" font-family="'Consolas', monospace" font-size="11" fill="#9ca3af">History: period, dates, origin, provenance</text>
        <text x="0" y="124" font-family="'Consolas', monospace" font-size="11" fill="#9ca3af">Scores: completeness_score, status</text>
        <text x="0" y="142" font-family="'Consolas', monospace" font-size="10" fill="#6b7280">Audit: observer, method, created_at</text>
      </g>
    </g>

    <!-- Top Attributes -->
    ${drawOval(880, 800, 'name', 'normal', 55, 19)}
    ${drawOval(1080, 790, 'id [PK]', 'pk', 65, 21)}
    ${drawOval(1280, 800, 'geom [PostGIS]', 'geom', 75, 21)}

    <!-- Left Column 1 (x=660) -->
    ${drawOval(660, 700, 'alternative_name', 'normal', 65, 18)}
    ${drawOval(660, 750, 'asset_type', 'normal', 65, 18)}
    ${drawOval(660, 800, 'asset_category', 'normal', 65, 18)}
    ${drawOval(660, 850, 'cultural_group', 'normal', 65, 18)}
    ${drawOval(660, 900, 'elevation_m', 'normal', 65, 18)}
    ${drawOval(660, 950, 'gps_accuracy_m', 'normal', 65, 18)}
    ${drawOval(660, 1000, 'location_accuracy', 'normal', 65, 18)}
    ${drawOval(660, 1050, 'region (name)', 'normal', 65, 18)}
    ${drawOval(660, 1100, 'district (name)', 'normal', 65, 18)}
    ${drawOval(660, 1150, 'community', 'normal', 65, 18)}

    <!-- Far Left Column 2 (x=380) -->
    ${drawOval(380, 700, 'location_description', 'normal', 75, 18)}
    ${drawOval(380, 750, 'dimensions (h,w,l)', 'normal', 75, 18)}
    ${drawOval(380, 800, 'material & technique', 'normal', 75, 18)}
    ${drawOval(380, 850, 'secondary_material', 'normal', 75, 18)}
    ${drawOval(380, 900, 'condition', 'normal', 75, 18)}
    ${drawOval(380, 950, 'damage_type', 'normal', 75, 18)}
    ${drawOval(380, 1000, 'conservation_status', 'normal', 75, 18)}
    ${drawOval(380, 1050, 'period & dates', 'normal', 75, 18)}
    ${drawOval(380, 1100, 'origin & ownership', 'normal', 75, 18)}
    ${drawOval(380, 1150, 'verification_status', 'normal', 75, 18)}
  </g>
`;

  // =========================================================================
  // ENTITY 2: HERITAGE_ASSET_MEDIA (Weak Entity)
  // Box: X = 880, Y = 1580, W = 400, H = 200
  // =========================================================================
  svg += `
  <g id="entity-asset-media">
    <!-- Attribute connectors -->
    <line x1="880" y1="1620" x2="725" y2="1520" stroke="#374151" stroke-width="1.5" />
    <line x1="880" y1="1640" x2="725" y2="1570" stroke="#374151" stroke-width="1.5" />
    <line x1="880" y1="1660" x2="725" y2="1620" stroke="#374151" stroke-width="1.5" />
    <line x1="880" y1="1680" x2="725" y2="1670" stroke="#374151" stroke-width="1.5" />
    <line x1="880" y1="1700" x2="725" y2="1720" stroke="#374151" stroke-width="1.5" />
    <line x1="880" y1="1720" x2="725" y2="1770" stroke="#374151" stroke-width="1.5" />
    <line x1="880" y1="1740" x2="725" y2="1820" stroke="#374151" stroke-width="1.5" />
    <line x1="880" y1="1760" x2="725" y2="1870" stroke="#374151" stroke-width="1.5" />

    <!-- Double Border for Weak Entity -->
    <g filter="url(#shadow)">
      <rect x="874" y="1574" width="412" height="212" rx="12" fill="none" stroke="#c084fc" stroke-width="1.8" />
      <rect x="880" y="1580" width="400" height="200" rx="8" fill="#1e1035" stroke="#a855f7" stroke-width="2.5" />
      <rect x="880" y="1580" width="400" height="48" rx="8" fill="url(#weakHeaderGrad)" />
      <rect x="880" y="1620" width="400" height="8" fill="url(#weakHeaderGrad)" />
      <text x="1080" y="1610" font-size="18" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="1">HERITAGE_ASSET_MEDIA</text>
      <text x="1080" y="1624" font-family="'Consolas', monospace" font-size="10.5" font-weight="600" fill="#f5d0fe" text-anchor="middle">WEAK ENTITY • CASCADE ON DELETE</text>

      <g transform="translate(905, 1650)">
        <text x="0" y="16" font-family="'Consolas', monospace" font-size="11" font-weight="700" fill="#f472b6">PK: id (text / UUID)</text>
        <text x="0" y="34" font-family="'Consolas', monospace" font-size="11" font-weight="700" fill="#e879f9">FK: asset_id &gt;&gt; heritage_assets.id</text>
        <text x="0" y="52" font-family="'Consolas', monospace" font-size="11" fill="#e2e8f0">Storage: file_path, file_name, media_type</text>
        <text x="0" y="70" font-family="'Consolas', monospace" font-size="11" fill="#cbd5e1">Presentation: caption, alt_text, sort_order</text>
        <text x="0" y="88" font-family="'Consolas', monospace" font-size="11" fill="#9ca3af">Flags: is_primary (boolean)</text>
        <text x="0" y="106" font-family="'Consolas', monospace" font-size="10" fill="#6b7280">Audit: created_at, updated_at</text>
      </g>
    </g>

    <!-- Attributes Left Column -->
    ${drawOval(660, 1520, 'id [PK]', 'pk', 65, 19)}
    ${drawOval(660, 1570, 'asset_id [FK]', 'fk', 65, 19)}
    ${drawOval(660, 1620, 'media_type', 'normal', 65, 18)}
    ${drawOval(660, 1670, 'file_path', 'normal', 65, 18)}
    ${drawOval(660, 1720, 'file_name', 'normal', 65, 18)}
    ${drawOval(660, 1770, 'caption', 'normal', 65, 18)}
    ${drawOval(660, 1820, 'alt_text', 'normal', 65, 18)}
    ${drawOval(660, 1870, 'is_primary', 'normal', 65, 18)}
  </g>
`;

  // Helper for Spatial Entities on Right
  function drawSpatialEntity(y, name, subtitle, cols, attrs) {
    const x = 2220;
    const w = 360;
    const h = 135;
    let out = `
    <!-- Connectors -->
    <line x1="${x + w}" y1="${y + 30}" x2="${x + w + 110}" y2="${y + 15}" stroke="#374151" stroke-width="1.5" />
    <line x1="${x + w}" y1="${y + 60}" x2="${x + w + 110}" y2="${y + 55}" stroke="#374151" stroke-width="1.5" />
    <line x1="${x + w}" y1="${y + 90}" x2="${x + w + 110}" y2="${y + 95}" stroke="#374151" stroke-width="1.5" />
    ${attrs.length > 3 ? `<line x1="${x + w}" y1="${y + 115}" x2="${x + w + 110}" y2="${y + 135}" stroke="#374151" stroke-width="1.5" />` : ''}

    <g filter="url(#shadow)">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#111827" stroke="#38bdf8" stroke-width="2" />
      <rect x="${x}" y="${y}" width="${w}" height="42" rx="8" fill="url(#headerGrad)" />
      <rect x="${x}" y="${y + 34}" width="${w}" height="8" fill="url(#headerGrad)" />
      <text x="${x + w / 2}" y="${y + 26}" font-size="16" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="0.8">${escapeXml(name)}</text>
      <text x="${x + w / 2}" y="${y + 38}" font-family="'Consolas', monospace" font-size="9.5" font-weight="600" fill="#e0f2fe" text-anchor="middle">${escapeXml(subtitle)}</text>

      <g transform="translate(${x + 20}, ${y + 58})">
        ${cols.map((col, idx) => `<text x="0" y="${idx * 18 + 14}" font-family="'Consolas', monospace" font-size="10.5" fill="${col.color || '#cbd5e1'}">${escapeXml(col.text)}</text>`).join('\n')}
      </g>
    </g>

    <!-- Attributes -->
    ${attrs.map((attr, idx) => drawOval(x + w + 110, y + 15 + idx * 40, attr.label, attr.type, attr.rx || 55, 18)).join('\n')}
    `;
    return out;
  }

  // =========================================================================
  // SPATIAL ENTITIES 3 to 7
  // =========================================================================
  svg += `
  <g id="spatial-entities">
    <!-- ENTITY 3: MAP_REGIONS -->
    ${drawSpatialEntity(
      560,
      'MAP_REGIONS',
      'SPATIAL ADMINISTRATIVE REGIONS',
      [
        { text: 'PK: id (integer, serial)', color: '#f97316' },
        { text: 'Spatial: geom (MultiPolygon, 4326)', color: '#06b6d4' },
        { text: 'Attributes: name, name_en', color: '#e2e8f0' }
      ],
      [
        { label: 'id [PK]', type: 'pk', rx: 55 },
        { label: 'name', type: 'normal', rx: 55 },
        { label: 'name_en', type: 'normal', rx: 55 },
        { label: 'geom [PostGIS]', type: 'geom', rx: 70 }
      ]
    )}

    <!-- ENTITY 4: MAP_DISTRICTS -->
    ${drawSpatialEntity(
      910,
      'MAP_DISTRICTS',
      'SPATIAL ADMINISTRATIVE DISTRICTS',
      [
        { text: 'PK: id (integer, serial)', color: '#f97316' },
        { text: 'Spatial: geom (MultiPolygon, 4326)', color: '#06b6d4' },
        { text: 'Attributes: name, label', color: '#e2e8f0' }
      ],
      [
        { label: 'id [PK]', type: 'pk', rx: 55 },
        { label: 'name', type: 'normal', rx: 55 },
        { label: 'label', type: 'normal', rx: 55 },
        { label: 'geom [PostGIS]', type: 'geom', rx: 70 }
      ]
    )}

    <!-- ENTITY 5: MAP_PROTECTED_AREAS -->
    ${drawSpatialEntity(
      1200,
      'MAP_PROTECTED_AREAS',
      'CONSERVATION RESERVES & PARKS',
      [
        { text: 'PK: id (integer, serial)', color: '#f97316' },
        { text: 'Spatial: geom (MultiPolygon, 4326)', color: '#06b6d4' },
        { text: 'Attributes: name', color: '#e2e8f0' }
      ],
      [
        { label: 'id [PK]', type: 'pk', rx: 55 },
        { label: 'name', type: 'normal', rx: 55 },
        { label: 'geom [PostGIS]', type: 'geom', rx: 70 }
      ]
    )}

    <!-- ENTITY 6: MAP_RIVERS -->
    ${drawSpatialEntity(
      1440,
      'MAP_RIVERS',
      'HYDROLOGICAL NETWORK (WATERWAYS)',
      [
        { text: 'PK: id (integer, serial)', color: '#f97316' },
        { text: 'Spatial: geom (LineString, 4326)', color: '#06b6d4' },
        { text: 'Attributes: name', color: '#e2e8f0' }
      ],
      [
        { label: 'id [PK]', type: 'pk', rx: 55 },
        { label: 'name', type: 'normal', rx: 55 },
        { label: 'geom [PostGIS]', type: 'geom', rx: 70 }
      ]
    )}

    <!-- ENTITY 7: MAP_ROADS -->
    ${drawSpatialEntity(
      1680,
      'MAP_ROADS',
      'TRANSPORTATION & ACCESS ROADS',
      [
        { text: 'PK: id (integer, serial)', color: '#f97316' },
        { text: 'Spatial: geom (LineString, 4326)', color: '#06b6d4' },
        { text: 'Attributes: name', color: '#e2e8f0' }
      ],
      [
        { label: 'id [PK]', type: 'pk', rx: 55 },
        { label: 'name', type: 'normal', rx: 55 },
        { label: 'geom [PostGIS]', type: 'geom', rx: 70 }
      ]
    )}
  </g>
`;

  // =========================================================================
  // FOOTER & RELATIONSHIP MATRIX SUMMARY (BOTTOM)
  // =========================================================================
  svg += `
  <g transform="translate(60, 1940)" filter="url(#shadow)">
    <rect width="3080" height="160" rx="12" fill="#111827" stroke="#1f2937" stroke-width="1.5" />
    
    <text x="30" y="32" font-size="14" font-weight="800" fill="#ffffff" letter-spacing="0.8">
      SCHEMA INTEGRITY &amp; SPATIAL TOPOLOGY SPECIFICATION
    </text>
    <line x1="30" y1="42" x2="3050" y2="42" stroke="#374151" stroke-width="1" />

    <!-- Matrix Rows -->
    <g transform="translate(30, 65)">
      <!-- Col 1 -->
      <text x="0" y="0" font-family="'Consolas', monospace" font-size="11.5" font-weight="700" fill="#38bdf8">1. [HERITAGE_ASSETS] -(1,1)-&lt;&gt; HAS_MEDIA &lt;&gt;-(0,n)- [HERITAGE_ASSET_MEDIA]</text>
      <text x="0" y="18" font-size="10.5" fill="#9ca3af">Relational FK Constraint: <tspan font-family="'Consolas', monospace" fill="#cbd5e1">heritage_asset_media.asset_id = heritage_assets.id (ON DELETE CASCADE)</tspan></text>
      <text x="0" y="42" font-family="'Consolas', monospace" font-size="11.5" font-weight="700" fill="#38bdf8">2. [MAP_REGIONS] -(1,1)-&lt;&gt; CONTAINS_DISTRICT &lt;&gt;-(0,n)- [MAP_DISTRICTS]</text>
      <text x="0" y="60" font-size="10.5" fill="#9ca3af">Spatial Containment: <tspan font-family="'Consolas', monospace" fill="#cbd5e1">ST_Contains(map_regions.geom, map_districts.geom)</tspan></text>

      <!-- Col 2 -->
      <g transform="translate(1000, 0)">
        <text x="0" y="0" font-family="'Consolas', monospace" font-size="11.5" font-weight="700" fill="#38bdf8">3. [HERITAGE_ASSETS] -(0,n)-&lt;&gt; LOCATED_IN_REGION &lt;&gt;-(0,1)- [MAP_REGIONS]</text>
        <text x="0" y="18" font-size="10.5" fill="#9ca3af">Administrative / Spatial Containment: <tspan font-family="'Consolas', monospace" fill="#cbd5e1">ST_Contains(map_regions.geom, heritage_assets.geom)</tspan></text>
        <text x="0" y="42" font-family="'Consolas', monospace" font-size="11.5" font-weight="700" fill="#38bdf8">4. [HERITAGE_ASSETS] -(0,n)-&lt;&gt; LOCATED_IN_DISTRICT &lt;&gt;-(0,1)- [MAP_DISTRICTS]</text>
        <text x="0" y="60" font-size="10.5" fill="#9ca3af">Administrative / Spatial Containment: <tspan font-family="'Consolas', monospace" fill="#cbd5e1">ST_Contains(map_districts.geom, heritage_assets.geom)</tspan></text>
      </g>

      <!-- Col 3 -->
      <g transform="translate(2000, 0)">
        <text x="0" y="0" font-family="'Consolas', monospace" font-size="11.5" font-weight="700" fill="#38bdf8">5. [HERITAGE_ASSETS] -(0,n)-&lt;&gt; WITHIN_PROTECTED_AREA &lt;&gt;-(0,n)- [MAP_PROTECTED_AREAS]</text>
        <text x="0" y="18" font-size="10.5" fill="#9ca3af">Spatial Topology: <tspan font-family="'Consolas', monospace" fill="#cbd5e1">ST_Intersects(heritage_assets.geom, map_protected_areas.geom)</tspan></text>
        <text x="0" y="42" font-family="'Consolas', monospace" font-size="11.5" font-weight="700" fill="#38bdf8">6. [HERITAGE_ASSETS] -(0,n)-&lt;&gt; NEAR_RIVER / ROAD &lt;&gt;-(0,n)- [RIVERS / ROADS]</text>
        <text x="0" y="60" font-size="10.5" fill="#9ca3af">Spatial Proximity: <tspan font-family="'Consolas', monospace" fill="#cbd5e1">ST_DWithin(heritage_assets.geom, {geom}, tolerance_meters)</tspan></text>
      </g>
    </g>
  </g>
`;

  svg += `</svg>`;
  return svg;
}

const outputPath = path.join(__dirname, '..', 'database_erd.svg');
fs.writeFileSync(outputPath, generateERDSVG(), 'utf8');
console.log('Successfully generated database_erd.svg at:', outputPath);
