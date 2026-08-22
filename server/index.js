import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

import db from "./db.js";

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadRoot = path.resolve(__dirname, "../uploads");

if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

// ---------------------------------------------------------------------------
// Admin authentication (shared-secret token)
// ---------------------------------------------------------------------------
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
  console.warn(
    "WARNING: ADMIN_PASSWORD is not set (or shorter than 8 chars). " +
      "All admin/write endpoints will REJECT every request until it is configured."
  );
}

const timingSafeEqual = (a, b) => {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) {
    // Still perform a comparison to keep timing uniform.
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
};

const issueAdminToken = () =>
  crypto.createHmac("sha256", String(ADMIN_PASSWORD)).update("project-epoch-admin-v1").digest("hex");

const isValidAdminToken = (token) => {
  if (!ADMIN_PASSWORD || !isNonEmptyString(token)) return false;
  return timingSafeEqual(token, issueAdminToken());
};

/** Gates every mutating route. Clients send: Authorization: Bearer <token> */
const requireAdmin = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!isValidAdminToken(token)) {
    return res.status(401).json({ error: "Unauthorized. Admin authentication required." });
  }
  next();
};

// ---------------------------------------------------------------------------
// Upload path safety
// ---------------------------------------------------------------------------

/** Resolves a stored /uploads/... path inside uploadRoot; returns null on escape attempts. */
const resolveUploadPath = (storedPath) => {
  if (!isNonEmptyString(storedPath)) return null;
  const relative = storedPath.replace(/^\/?uploads\//, "");
  const resolved = path.resolve(uploadRoot, relative);
  if (resolved !== uploadRoot && !resolved.startsWith(uploadRoot + path.sep)) {
    return null;
  }
  return resolved;
};

const ASSET_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;


// Enable CORS and parsing of JSON payloads
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(uploadRoot));

app.post("/api/admin/login", (req, res) => {
  const { password } = req.body || {};
  if (!ADMIN_PASSWORD) {
    return res.status(503).json({ error: "Admin access is not configured on this server." });
  }
  if (!isNonEmptyString(password) || !timingSafeEqual(password, ADMIN_PASSWORD)) {
    return res.status(401).json({ error: "Invalid credentials." });
  }
  res.json({ success: true, token: issueAdminToken() });
});

const createMediaTypeFromMime = (mimeType = "") => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "file";
};

const createMediaTypeFromFile = (file = {}) => {
  const extension = path.extname(file.originalname || file.filename || "").toLowerCase();

  if (extension === ".glb" || extension === ".gltf" || file.mimetype === "model/gltf-binary" || file.mimetype === "model/gltf+json") {
    return "model";
  }

  return createMediaTypeFromMime(file.mimetype || "");
};

const buildMediaUrl = (relativePath) => `/uploads/${relativePath.replace(/\\/g, "/")}`;

const mediaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const assetId = req.params.id;
    if (!ASSET_ID_PATTERN.test(String(assetId))) {
      return cb(new Error("Invalid asset id."));
    }
    const targetDir = path.join(uploadRoot, "media", String(assetId));
    if (!targetDir.startsWith(uploadRoot + path.sep)) {
      return cb(new Error("Invalid upload destination."));
    }
    fs.mkdirSync(targetDir, { recursive: true });
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const safeBaseName = path
      .basename(file.originalname)
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/-+/g, "-");
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    cb(null, `${Date.now()}-${randomSuffix}-${safeBaseName}`);
  },
});

const MAX_FILE_SIZE_GENERAL = 50 * 1024 * 1024;
const MAX_FILE_SIZE_MODEL = 500 * 1024 * 1024;

const isModelFile = (filename = "") => {
  const ext = path.extname(filename).toLowerCase();
  return ext === ".glb" || ext === ".gltf";
};

/** Whitelist of accepted upload types (heritage media only). */
const ALLOWED_UPLOAD_EXTENSIONS = new Set([
  ".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif",
  ".mp4", ".webm",
  ".mp3", ".wav", ".ogg", ".m4a",
  ".glb", ".gltf",
  ".pdf",
]);

const uploadMediaFiles = multer({
  storage: mediaStorage,
  limits: {
    fileSize: MAX_FILE_SIZE_MODEL,
    files: 20,
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    if (!ALLOWED_UPLOAD_EXTENSIONS.has(ext)) {
      return cb(new multer.MulterError("LIMIT_UNACCEPTABLE_TYPE", file));
    }
    cb(null, true);
  },
});

const enforceFileSizeLimits = (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();
  const oversized = req.files.filter((f) => {
    const maxSize = isModelFile(f.originalname) ? MAX_FILE_SIZE_MODEL : MAX_FILE_SIZE_GENERAL;
    return f.size > maxSize;
  });
  if (oversized.length > 0) {
    oversized.forEach((f) => {
      try { fs.unlinkSync(f.path); } catch {}
    });
    const names = oversized.map((f) => f.originalname).join(", ");
    return res.status(413).json({ error: `File(s) too large: ${names}. 3D models up to 500 MB, other files up to 50 MB.` });
  }
  next();
};

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const stripHtml = (str) => {
  if (typeof str !== "string") return str;
  return str
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const normalizeMediaItem = (item, fallbackSortOrder = 0) => {
  if (!item || typeof item !== "object") {
    throw new Error("Each media item must be an object.");
  }

  const filePath = item.filePath || item.path || item.url || item.src;

  if (!isNonEmptyString(filePath)) {
    throw new Error("Each media item must include a filePath, path, url, or src value.");
  }

  const normalizedPath = filePath.trim();
  if (!/^\/uploads\/[A-Za-z0-9._\-/]+$/.test(normalizedPath) || normalizedPath.includes("..")) {
    throw new Error("Each media item filePath must reference an uploaded file under /uploads/."); 
  }

  return {
    mediaType: isNonEmptyString(item.mediaType) ? item.mediaType.trim() : isNonEmptyString(item.type) ? item.type.trim() : "image",
    filePath: normalizedPath,
    fileName: isNonEmptyString(item.fileName) ? item.fileName.trim() : isNonEmptyString(item.name) ? item.name.trim() : null,
    caption: isNonEmptyString(item.caption) ? item.caption.trim() : null,
    altText: isNonEmptyString(item.altText) ? item.altText.trim() : null,
    sortOrder: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : fallbackSortOrder,
    isPrimary: Boolean(item.isPrimary),
  };
};

const collectionFilters = {
  artifacts: `(
    ha.asset_type = 'Object (Physical Artifact)'
    OR ha.asset_category IN ('Artifact', 'Jewelry / Beadwork')
  )
  AND ha.asset_category IS DISTINCT FROM 'Textile (Kente, etc.)'`,
  museums: `(
    ha.asset_type = 'Site (Geography / Ruins)'
    OR ha.asset_category IN ('Museum', 'Fort', 'Castle', 'Monument')
  )`,
  textiles: `(ha.asset_category = 'Textile (Kente, etc.)')`,
  documents: `(
    ha.asset_type = 'Document (Photo, Map, Archive)'
    OR ha.asset_category IN ('Photograph / Digital Media', 'Audio / Music')
  )`,
  needs_review: `(
    ha.asset_type IS NULL
    OR ha.asset_category IS NULL
  )`,
};

const collectionDisplayNames = {
  artifacts: "Artifacts",
  museums: "Museums & Monuments",
  textiles: "Textiles & Fabrics",
  documents: "Documents & Digital Media",
  needs_review: "Needs Review",
};

const buildCollectionWhereClause = (collectionKey) => {
  const filter = collectionFilters[collectionKey];
  return filter ? `WHERE ${filter}` : "";
};

// API Status Route - Verifies DB and PostGIS version
app.get("/api/status", async (req, res) => {
  try {
    const dbTest = await db.query("SELECT NOW()");
    const dbNameQuery = await db.query("SELECT current_database() AS database_name");

    let postgisVersion = "Not Installed";
    try {
      const pgVersionQuery = await db.query("SELECT postgis_full_version()");
      postgisVersion = pgVersionQuery.rows[0].postgis_full_version;
    } catch (e) {
      console.warn("PostGIS extension query failed:", e.message);
    }

    // Check if heritage_assets table exists
    const tableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'heritage_assets'
      )
    `);

    const mediaTableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'heritage_asset_media'
      )
    `);

    res.json({
      status: "online",
      database: "connected",
      databaseName: dbNameQuery.rows[0].database_name,
      dbTime: dbTest.rows[0].now,
      postgis: postgisVersion,
      heritageAssetsTableExists: tableCheck.rows[0].exists,
      heritageAssetMediaTableExists: mediaTableCheck.rows[0].exists,
    });
  } catch (err) {
    console.error("API status check failed:", err.message);
    res.status(500).json({
      status: "error",
      database: "disconnected",
      error: "Failed to check API status.",
    });
  }
});

// GET /api/heritage-assets - Queries the actual heritage_assets table and returns GeoJSON geometries
app.get("/api/heritage-assets", async (req, res) => {
  try {
    const collection = typeof req.query.collection === "string" ? req.query.collection : "";
    const conditions = ["ha.deleted_at IS NULL"];
    const values = [];
    let paramIndex = 1;

    const collectionFilter = collectionFilters[collection];
    if (collectionFilter) {
      conditions.push(collectionFilter);
    }

    const addArrayFilter = (field, param) => {
      if (isNonEmptyString(param)) {
        const items = param.split(",").map(s => s.trim()).filter(Boolean);
        if (items.length > 0) {
          conditions.push(`LOWER(ha.${field}) = ANY($${paramIndex}::text[])`);
          values.push(items.map(i => i.toLowerCase()));
          paramIndex++;
        }
      }
    };

    const addTextSearch = (param) => {
      if (isNonEmptyString(param)) {
        // Prefix-tolerant FTS: "kum" matches "Kumasi". Words are sanitised and
        // combined with AND so every term must match, each as a prefix.
        const sanitized = param.trim().replace(/[^\p{L}\p{N}\s]/gu, " ").trim();
        if (!sanitized) return;
        const tsQuery = sanitized
          .split(/\s+/)
          .map((w) => `${w}:*`)
          .join(" & ");
        conditions.push(`search_vector @@ to_tsquery('english', $${paramIndex})`);
        values.push(tsQuery);
        paramIndex++;
      }
    };

    addTextSearch(req.query.search);
    addArrayFilter("asset_category", req.query.asset_category);
    addArrayFilter("asset_type", req.query.asset_type);
    addArrayFilter("period", req.query.period);
    addArrayFilter("condition", req.query.condition);
    addArrayFilter("ownership", req.query.ownership);
    addArrayFilter("cultural_group", req.query.cultural_group);
    addArrayFilter("material", req.query.material);
    addArrayFilter("region", req.query.region);
    addArrayFilter("district", req.query.district);
    addArrayFilter("conservation_status", req.query.conservation_status);

    // Temporal range filter: an asset matches when its period overlaps [start, end].
    const periodStart = parseInt(req.query.period_start, 10);
    const periodEnd = parseInt(req.query.period_end, 10);
    if (Number.isFinite(periodStart)) {
      conditions.push(`COALESCE(ha.period_end, ha.period_start) >= $${paramIndex}`);
      values.push(periodStart);
      paramIndex++;
    }
    if (Number.isFinite(periodEnd)) {
      conditions.push(`COALESCE(ha.period_start, ha.period_end) <= $${paramIndex}`);
      values.push(periodEnd);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;
    const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const offset = (pageNum - 1) * pageSize;

    const result = await db.query(`
      SELECT
        ha.id,
        ha.name,
        ha.alternative_name,
        ha.description,
        ha.asset_type,
        ha.asset_category,
        ha.cultural_group,
        ST_AsGeoJSON(ha.geom)::json AS geometry,
        ha.location_accuracy,
        ha.elevation_m,
        ha.gps_accuracy_m,
        ha.region,
        ha.district,
        ha.community,
        ha.location_description,
        ha.height_m,
        ha.width_m,
        ha.length_m,
        ha.diameter_m,
        ha.weight_kg,
        ha.material,
        ha.secondary_material,
        ha.technique,
        ha.condition,
        ha.damage_type,
        ha.conservation_status,
        ha.period,
        ha.period_start,
        ha.period_end,
        ha.estimated_age,
        ha.discovered_date,
        ha.recorded_date,
        ha.origin_known,
        ha.origin_location,
        ha.current_location,
        ha.ownership,
        ha.data_completeness_score,
        ha.verification_status,
        ha.data_source,
        ha.notes,
        ha.observer,
        ha.survey_method,
        ha.created_at,
        ha.updated_at,
        COALESCE(media.media, '[]'::json) AS media
      FROM heritage_assets ha
      LEFT JOIN LATERAL (
        SELECT json_agg(
          json_build_object(
            'id', m.id,
            'assetId', m.asset_id,
            'mediaType', m.media_type,
            'filePath', m.file_path,
            'fileName', m.file_name,
            'caption', m.caption,
            'altText', m.alt_text,
            'sortOrder', m.sort_order,
            'isPrimary', m.is_primary,
            'createdAt', m.created_at,
            'updatedAt', m.updated_at
          )
          ORDER BY m.is_primary DESC, m.sort_order ASC, m.created_at ASC
        ) AS media
        FROM heritage_asset_media m
        WHERE m.asset_id = ha.id
      ) media ON TRUE
      ${whereClause}
      ORDER BY ha.created_at DESC
      ${hasPagination ? `LIMIT $${paramIndex} OFFSET $${paramIndex + 1}` : ""}
    `, hasPagination ? [...values, pageSize, offset] : values);
    const assets = result.rows.map((row) => ({
      ...row,
      description: stripHtml(row.description),
    }));
    if (hasPagination) {
      const countResult = await db.query(`
        SELECT COUNT(*)::int AS total
        FROM heritage_assets ha
        ${whereClause}
      `, values);
      res.json({
        data: assets,
        pagination: {
          page: pageNum,
          limit: pageSize,
          total: countResult.rows[0].total,
          totalPages: Math.ceil(countResult.rows[0].total / pageSize),
        },
      });
    } else {
      res.json(assets);
    }
  } catch (err) {
    console.error("Error querying heritage_assets:", err.message);
    res.status(500).json({
      error: "Failed to load heritage assets.",
      hint: "Make sure you have created the heritage_assets table in database 'project_epoch'."
    });
  }
});

// GET /api/heritage-assets/period-range - Returns the min/max year from period_start/period_end
app.get("/api/heritage-assets/period-range", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        MIN(period_start) AS min_year,
        MAX(COALESCE(period_end, period_start)) AS max_year
      FROM heritage_assets
      WHERE period_start IS NOT NULL
    `);
    const minYear = result.rows[0].min_year || 1100;
    const maxYear = result.rows[0].max_year || 2026;
    res.json({ min_year: Number(minYear), max_year: Number(maxYear) });
  } catch (err) {
    console.error("Error querying period range:", err.message);
    res.status(500).json({ error: "Failed to query period range." });
  }
});

// GET /api/catalogue/summary - Collection counts for the catalogue landing page
app.get("/api/catalogue/summary", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE ${collectionFilters.artifacts})::int AS artifacts,
        COUNT(*) FILTER (WHERE ${collectionFilters.museums})::int AS museums,
        COUNT(*) FILTER (WHERE ${collectionFilters.textiles})::int AS textiles,
        COUNT(*) FILTER (WHERE ${collectionFilters.documents})::int AS documents,
        COUNT(*) FILTER (WHERE ${collectionFilters.needs_review})::int AS needs_review
      FROM heritage_assets ha
    `);

    res.json({
      ...result.rows[0],
      collectionNames: collectionDisplayNames,
    });
  } catch (err) {
    console.error("Error querying catalogue summary:", err.message);
    res.status(500).json({ error: "Failed to load catalogue summary." });
  }
});

// GET /api/heritage-assets/export - Download the active selection as GeoJSON or CSV
app.get("/api/heritage-assets/export", async (req, res) => {
  try {
    const format = (req.query.format || "geojson").toLowerCase();
    if (!["geojson", "csv"].includes(format)) {
      return res.status(400).json({ error: "Unsupported format. Use geojson or csv." });
    }

    // Reuse the same filter builder as the list endpoint via a subrequest-free approach:
    // build conditions directly here.
    const conditions = ["ha.deleted_at IS NULL"];
    const values = [];
    let paramIndex = 1;

    const addArrayFilter = (field, param) => {
      if (isNonEmptyString(param)) {
        const items = param.split(",").map((s) => s.trim()).filter(Boolean);
        if (items.length > 0) {
          conditions.push(`LOWER(ha.${field}) = ANY($${paramIndex}::text[])`);
          values.push(items.map((i) => i.toLowerCase()));
          paramIndex++;
        }
      }
    };
    const addTextSearch = (param) => {
      if (isNonEmptyString(param)) {
        const sanitized = param.trim().replace(/[^\p{L}\p{N}\s]/gu, " ").trim();
        if (!sanitized) return;
        const tsQuery = sanitized
          .split(/\s+/)
          .map((w) => `${w}:*`)
          .join(" & ");
        conditions.push(`search_vector @@ to_tsquery('english', $${paramIndex})`);
        values.push(tsQuery);
        paramIndex++;
      }
    };

    addTextSearch(req.query.search);
    addArrayFilter("asset_category", req.query.asset_category);
    addArrayFilter("asset_type", req.query.asset_type);
    addArrayFilter("period", req.query.period);
    addArrayFilter("condition", req.query.condition);
    addArrayFilter("ownership", req.query.ownership);
    addArrayFilter("cultural_group", req.query.cultural_group);
    addArrayFilter("material", req.query.material);
    addArrayFilter("region", req.query.region);
    addArrayFilter("district", req.query.district);
    addArrayFilter("conservation_status", req.query.conservation_status);

    const periodStart = parseInt(req.query.period_start, 10);
    const periodEnd = parseInt(req.query.period_end, 10);
    if (Number.isFinite(periodStart)) {
      conditions.push(`COALESCE(ha.period_end, ha.period_start) >= $${paramIndex}`);
      values.push(periodStart);
      paramIndex++;
    }
    if (Number.isFinite(periodEnd)) {
      conditions.push(`COALESCE(ha.period_start, ha.period_end) <= $${paramIndex}`);
      values.push(periodEnd);
      paramIndex++;
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    if (format === "geojson") {
      const result = await db.query(`
        SELECT json_build_object(
          'type', 'FeatureCollection',
          'name', 'project_epoch_heritage_assets',
          'features', COALESCE(json_agg(
            json_build_object(
              'type', 'Feature',
              'geometry', ST_AsGeoJSON(ha.geom)::json,
              'properties', json_build_object(
                'id', ha.id,
                'name', ha.name,
                'alternative_name', ha.alternative_name,
                'asset_type', ha.asset_type,
                'asset_category', ha.asset_category,
                'cultural_group', ha.cultural_group,
                'region', ha.region,
                'district', ha.district,
                'community', ha.community,
                'condition', ha.condition,
                'conservation_status', ha.conservation_status,
                'period', ha.period,
                'period_start', ha.period_start,
                'period_end', ha.period_end,
                'material', ha.material,
                'ownership', ha.ownership,
                'elevation_m', ha.elevation_m,
                'gps_accuracy_m', ha.gps_accuracy_m,
                'location_accuracy', ha.location_accuracy,
                'data_source', ha.data_source,
                'data_completeness_score', ha.data_completeness_score,
                'verification_status', ha.verification_status
              )
            )
          ), '[]'::json)
        ) AS geojson
        FROM heritage_assets ha
        ${whereClause}
      `, values);

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="heritage-assets-${new Date().toISOString().slice(0, 10)}.geojson"`
      );
      return res.type("application/geo+json").send(JSON.stringify(result.rows[0].geojson));
    }

    // CSV export (geometry as WKT for GIS round-tripping)
    const result = await db.query(`
      SELECT
        ha.id,
        ha.name,
        ha.alternative_name,
        ha.asset_type,
        ha.asset_category,
        ha.cultural_group,
        ha.region,
        ha.district,
        ha.community,
        ha.condition,
        ha.conservation_status,
        ha.period,
        ha.period_start,
        ha.period_end,
        ha.material,
        ha.ownership,
        ha.elevation_m,
        ha.gps_accuracy_m,
        ha.location_accuracy,
        ha.data_source,
        ha.data_completeness_score,
        ha.verification_status,
        ST_AsText(ha.geom) AS wkt_geom
      FROM heritage_assets ha
      ${whereClause}
      ORDER BY ha.id
    `, values);

    const columns = Object.keys(result.rows[0] || { id: null });
    const escapeCsv = (value) => {
      if (value === null || value === undefined) return "";
      const str = String(value);
      return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };
    const csv = [
      columns.join(","),
      ...result.rows.map((row) => columns.map((c) => escapeCsv(row[c])).join(",")),
    ].join("\n");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="heritage-assets-${new Date().toISOString().slice(0, 10)}.csv"`
    );
    return res.type("text/csv").send(csv);
  } catch (err) {
    console.error("Error exporting heritage assets:", err.message);
    res.status(500).json({ error: "Failed to export heritage assets." });
  }
});

// GET /api/heritage-assets/summary - Lightweight diagnostic counts for the admin page
app.get("/api/heritage-assets/summary", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        COUNT(*)::int AS total_assets,
        COUNT(*) FILTER (WHERE geom IS NOT NULL)::int AS assets_with_geometry,
        COUNT(*) FILTER (WHERE ST_GeometryType(geom) = 'ST_Point')::int AS point_assets,
        COUNT(*) FILTER (WHERE ST_GeometryType(geom) = 'ST_LineString')::int AS line_assets,
        COUNT(*) FILTER (WHERE ST_GeometryType(geom) IN ('ST_Polygon', 'ST_MultiPolygon'))::int AS polygon_assets,
        MAX(created_at) AS newest_created_at,
        MAX(updated_at) AS newest_updated_at
      FROM heritage_assets
    `);

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error querying heritage_assets summary:", err.message);
    res.status(500).json({ error: "Failed to load asset summary." });
  }
});

// GET /api/heritage-assets/:id - Fetch a single heritage asset by ID with its media
app.get("/api/heritage-assets/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT
        ha.id,
        ha.name,
        ha.alternative_name,
        ha.description,
        ha.asset_type,
        ha.asset_category,
        ha.cultural_group,
        ST_AsGeoJSON(ha.geom)::json AS geometry,
        ha.location_accuracy,
        ha.elevation_m,
        ha.gps_accuracy_m,
        ha.region,
        ha.district,
        ha.community,
        ha.location_description,
        ha.height_m,
        ha.width_m,
        ha.length_m,
        ha.diameter_m,
        ha.weight_kg,
        ha.material,
        ha.secondary_material,
        ha.technique,
        ha.condition,
        ha.damage_type,
        ha.conservation_status,
        ha.period,
        ha.period_start,
        ha.period_end,
        ha.estimated_age,
        ha.discovered_date,
        ha.recorded_date,
        ha.origin_known,
        ha.origin_location,
        ha.current_location,
        ha.ownership,
        ha.data_completeness_score,
        ha.verification_status,
        ha.data_source,
        ha.notes,
        ha.observer,
        ha.survey_method,
        ha.created_at,
        ha.updated_at,
        COALESCE(media.media, '[]'::json) AS media
      FROM heritage_assets ha
      LEFT JOIN LATERAL (
        SELECT json_agg(
          json_build_object(
            'id', m.id,
            'assetId', m.asset_id,
            'mediaType', m.media_type,
            'filePath', m.file_path,
            'fileName', m.file_name,
            'caption', m.caption,
            'altText', m.alt_text,
            'sortOrder', m.sort_order,
            'isPrimary', m.is_primary,
            'createdAt', m.created_at,
            'updatedAt', m.updated_at
          )
          ORDER BY m.is_primary DESC, m.sort_order ASC, m.created_at ASC
        ) AS media
        FROM heritage_asset_media m
        WHERE m.asset_id = ha.id
      ) media ON TRUE
      WHERE ha.id = $1 AND ha.deleted_at IS NULL
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Heritage asset not found" });
    }

    const asset = { ...result.rows[0], description: stripHtml(result.rows[0].description) };
    res.json(asset);
  } catch (err) {
    console.error("Error querying heritage asset by id:", err.message);
    res.status(500).json({ error: "Failed to load heritage asset." });
  }
});

// GET /api/map/reference/:layerKey - Returns GeoJSON for reference layers stored in PostGIS tables
const referenceLayerTables = {
  regions: "map_regions",
  districts: "map_districts",
  roads: "map_roads",
  rivers: "map_rivers",
  protected_areas: "map_protected_areas",
};

app.get("/api/map/reference/:layerKey", async (req, res) => {
  try {
    const { layerKey } = req.params;
    const tableName = referenceLayerTables[layerKey];
    if (!tableName) {
      return res.status(400).json({ error: `Unknown layer: ${layerKey}. Valid layers: ${Object.keys(referenceLayerTables).join(", ")}` });
    }

    const tableExists = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = $1
      )
    `, [tableName]);

    if (!tableExists.rows[0].exists) {
      return res.status(404).json({ error: `Layer table '${tableName}' does not exist in the database.` });
    }

    const colResult = await db.query(
      `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`,
      [tableName]
    );
    const columns = colResult.rows.map((r) => r.column_name);

    const nameExpr = columns.includes("name") ? "name" : (columns.includes("label") ? "label" : "''");
    const nameEnExpr = columns.includes("name_en") ? "name_en" : (columns.includes("name") ? "name" : (columns.includes("label") ? "label" : "''"));

    const result = await db.query(`
      SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', COALESCE(
          json_agg(
            json_build_object(
              'type', 'Feature',
              'geometry', ST_AsGeoJSON(geom)::json,
              'properties', json_build_object(
                'id', id,
                'name', COALESCE(${nameExpr}, ''),
                'name_en', COALESCE(${nameEnExpr}, '')
              )
            )
          ),
          '[]'::json
        )
      ) AS geojson
      FROM ${tableName}
      WHERE geom IS NOT NULL
    `);

    res.json(result.rows[0].geojson);
  } catch (err) {
    console.error("Error querying reference layer:", err.message);
    res.status(500).json({ error: "Failed to load reference layer." });
  }
});

// Alias GET /api/monuments to /api/heritage-assets for backward compatibility
app.get("/api/monuments", async (req, res) => {
  const queryString = req.url.includes("?") ? req.url.substring(req.url.indexOf("?")) : "";
  res.redirect(301, `/api/heritage-assets${queryString}`);
});

// POST /api/heritage-assets - Add a new heritage asset (e.g. from the web interface)
app.post("/api/heritage-assets", requireAdmin, async (req, res) => {
  const {
    name, alternative_name, description, asset_type, asset_category, cultural_group,
    geometry, location_accuracy, elevation_m, gps_accuracy_m, region, district, community,
    location_description, height_m, width_m, length_m, diameter_m, weight_kg,
    material, secondary_material, technique, condition, damage_type, conservation_status,
    period, period_start, period_end, estimated_age, discovered_date, recorded_date,
    origin_known, origin_location, current_location, ownership, data_completeness_score,
    verification_status, data_source, notes, observer, survey_method,
    mediaItems = []
  } = req.body;

  try {
    // Check if geometry is valid JSON
    if (!geometry || !geometry.type || !geometry.coordinates) {
      return res.status(400).json({ error: "Missing or invalid GeoJSON geometry object." });
    }

    let normalizedMediaItems = [];
    try {
      normalizedMediaItems = Array.isArray(mediaItems)
        ? mediaItems.map((item, index) => normalizeMediaItem(item, index))
        : [];
    } catch (mediaError) {
      return res.status(400).json({ error: mediaError.message });
    }

    const client = await db.pool.connect();

    try {
      await client.query("BEGIN");

      const queryText = `
        INSERT INTO heritage_assets (
          name, alternative_name, description, asset_type, asset_category, cultural_group,
          geom, location_accuracy, elevation_m, gps_accuracy_m, region, district, community,
          location_description, height_m, width_m, length_m, diameter_m, weight_kg,
          material, secondary_material, technique, condition, damage_type, conservation_status,
          period, period_start, period_end, estimated_age, discovered_date, recorded_date,
          origin_known, origin_location, current_location, ownership, data_completeness_score,
          verification_status, data_source, notes, observer, survey_method
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          ST_SetSRID(ST_GeomFromGeoJSON($7), 4326), 
          $8, $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18, $19,
          $20, $21, $22, $23, $24, $25,
          $26, $27, $28, $29, $30, $31,
          $32, $33, $34, $35, $36,
          $37, $38, $39, $40, $41
        ) RETURNING id, created_at;
      `;

      const values = [
        name, alternative_name, description, asset_type, asset_category, cultural_group,
        JSON.stringify(geometry), location_accuracy, elevation_m, gps_accuracy_m, region, district, community,
        location_description, height_m, width_m, length_m, diameter_m, weight_kg,
        material, secondary_material, technique, condition, damage_type, conservation_status,
        period, period_start, period_end, estimated_age, discovered_date, recorded_date,
        origin_known !== undefined ? origin_known : true, origin_location, current_location, ownership, data_completeness_score,
        verification_status, data_source, notes, observer, survey_method
      ];

      const result = await client.query(queryText, values);
      const assetId = result.rows[0].id;

      if (normalizedMediaItems.length > 0) {
        const mediaInsert = `
          INSERT INTO heritage_asset_media (
            asset_id, media_type, file_path, file_name, caption, alt_text, sort_order, is_primary
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;

        for (const mediaItem of normalizedMediaItems) {
          await client.query(mediaInsert, [
            assetId,
            mediaItem.mediaType,
            mediaItem.filePath,
            mediaItem.fileName,
            mediaItem.caption,
            mediaItem.altText,
            mediaItem.sortOrder,
            mediaItem.isPrimary,
          ]);
        }
      }

      await client.query("COMMIT");

      res.status(201).json({
        success: true,
        message: "Heritage asset added successfully!",
        id: assetId,
        created_at: result.rows[0].created_at,
        mediaCount: normalizedMediaItems.length,
      });
    } catch (transactionError) {
      await client.query("ROLLBACK");
      throw transactionError;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Failed to insert heritage asset:", err.message);
    res.status(500).json({ error: "Failed to create heritage asset." });
  }
});

// GET /api/heritage-assets/:id/media - Fetch all media for one asset
app.get("/api/heritage-assets/:id/media", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT
        id,
        asset_id AS "assetId",
        media_type AS "mediaType",
        file_path AS "filePath",
        file_name AS "fileName",
        caption,
        alt_text AS "altText",
        sort_order AS "sortOrder",
        is_primary AS "isPrimary",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM heritage_asset_media
      WHERE asset_id = $1
      ORDER BY is_primary DESC, sort_order ASC, created_at ASC`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error querying heritage_asset_media:", err.message);
    res.status(500).json({ error: "Failed to load media records." });
  }
});

// POST /api/heritage-assets/:id/media - Add one or more media records to an existing asset
app.post("/api/heritage-assets/:id/media", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const mediaItems = Array.isArray(req.body?.mediaItems)
      ? req.body.mediaItems
      : Array.isArray(req.body)
        ? req.body
        : [req.body];

    let normalizedMediaItems = [];
    try {
      normalizedMediaItems = mediaItems.map((item, index) => normalizeMediaItem(item, index));
    } catch (mediaError) {
      return res.status(400).json({ error: mediaError.message });
    }
    const client = await db.pool.connect();

    try {
      await client.query("BEGIN");

      const assetExists = await client.query(
        "SELECT id FROM heritage_assets WHERE id = $1 AND deleted_at IS NULL",
        [id]
      );

      if (assetExists.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Heritage asset not found." });
      }

      const insertMedia = `
        INSERT INTO heritage_asset_media (
          asset_id, media_type, file_path, file_name, caption, alt_text, sort_order, is_primary
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING
          id,
          asset_id AS "assetId",
          media_type AS "mediaType",
          file_path AS "filePath",
          file_name AS "fileName",
          caption,
          alt_text AS "altText",
          sort_order AS "sortOrder",
          is_primary AS "isPrimary",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
      `;

      const insertedMedia = [];
      for (const mediaItem of normalizedMediaItems) {
        const mediaResult = await client.query(insertMedia, [
          id,
          mediaItem.mediaType,
          mediaItem.filePath,
          mediaItem.fileName,
          mediaItem.caption,
          mediaItem.altText,
          mediaItem.sortOrder,
          mediaItem.isPrimary,
        ]);
        insertedMedia.push(mediaResult.rows[0]);
      }

      await client.query("COMMIT");
      res.status(201).json({
        success: true,
        mediaCount: insertedMedia.length,
        media: insertedMedia,
      });
    } catch (transactionError) {
      await client.query("ROLLBACK");
      throw transactionError;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Failed to insert heritage asset media:", err.message);
    res.status(500).json({ error: "Failed to add media records." });
  }
});

// POST /api/heritage-assets/:id/media/upload - Upload files and create media records
app.post("/api/heritage-assets/:id/media/upload", requireAdmin, uploadMediaFiles.array("files", 20), enforceFileSizeLimits, async (req, res) => {
  const { id } = req.params;

  try {
    const assetExists = await db.query("SELECT id FROM heritage_assets WHERE id = $1 AND deleted_at IS NULL", [id]);
    if (assetExists.rowCount === 0) {
      if (req.files?.length) {
        await Promise.all(req.files.map((file) => fs.promises.unlink(file.path).catch(() => { })));
      }
      return res.status(404).json({ error: "Heritage asset not found." });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files were uploaded." });
    }

    const caption = isNonEmptyString(req.body?.caption) ? req.body.caption.trim() : null;
    const markFirstAsPrimary = req.body?.markFirstAsPrimary === "true" || req.body?.markFirstAsPrimary === true;

    let client;
    try {
      client = await db.pool.connect();
    } catch (connectErr) {
      console.error("Failed to get database connection:", connectErr.message);
      if (req.files?.length) {
        await Promise.all(req.files.map((file) => fs.promises.unlink(file.path).catch(() => { })));
      }
      return res.status(500).json({ error: "Failed to connect to database." });
    }

    try {
      await client.query("BEGIN");

      const insertMedia = `
        INSERT INTO heritage_asset_media (
          asset_id, media_type, file_path, file_name, caption, alt_text, sort_order, is_primary
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING
          id,
          asset_id AS "assetId",
          media_type AS "mediaType",
          file_path AS "filePath",
          file_name AS "fileName",
          caption,
          alt_text AS "altText",
          sort_order AS "sortOrder",
          is_primary AS "isPrimary",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
      `;

      if (markFirstAsPrimary) {
        await client.query(
          "UPDATE heritage_asset_media SET is_primary = false WHERE asset_id = $1",
          [id]
        );
      }

      const insertedMedia = [];
      for (const [index, file] of req.files.entries()) {
        const mediaType = createMediaTypeFromFile(file);
        const isFirst = index === 0;
        const shouldMarkPrimary = markFirstAsPrimary && isFirst && mediaType === "image";
        const mediaResult = await client.query(insertMedia, [
          id,
          mediaType,
          buildMediaUrl(path.relative(uploadRoot, file.path)),
          file.originalname,
          caption || file.originalname,
          null,
          index,
          shouldMarkPrimary,
        ]);
        insertedMedia.push(mediaResult.rows[0]);
      }

      await client.query("COMMIT");
      res.status(201).json({
        success: true,
        mediaCount: insertedMedia.length,
        media: insertedMedia,
      });
    } catch (transactionError) {
      await client.query("ROLLBACK");
      if (req.files?.length) {
        await Promise.all(req.files.map((file) => fs.promises.unlink(file.path).catch(() => { })));
      }
      throw transactionError;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Failed to upload heritage asset media:", err.message);
    res.status(500).json({ error: "Failed to upload media files." });
  }
});

// PUT /api/heritage-assets/:id - Update an existing heritage asset
app.put("/api/heritage-assets/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const {
    name, alternative_name, description, asset_type, asset_category, cultural_group,
    geometry, location_accuracy, elevation_m, gps_accuracy_m, region, district, community,
    location_description, height_m, width_m, length_m, diameter_m, weight_kg,
    material, secondary_material, technique, condition, damage_type, conservation_status,
    period, period_start, period_end, estimated_age, discovered_date, recorded_date,
    origin_known, origin_location, current_location, ownership, data_completeness_score,
    verification_status, data_source, notes, observer, survey_method
  } = req.body;

  try {
    const existing = await db.query("SELECT id FROM heritage_assets WHERE id = $1 AND deleted_at IS NULL", [id]);
    if (existing.rowCount === 0) {
      return res.status(404).json({ error: "Heritage asset not found." });
    }

    const geomClause = geometry && geometry.type && geometry.coordinates
      ? ", geom = ST_SetSRID(ST_GeomFromGeoJSON($1), 4326)"
      : "";
    const geomValue = geometry && geometry.type && geometry.coordinates ? JSON.stringify(geometry) : null;

    const fields = [
      ["name", name], ["alternative_name", alternative_name], ["description", description],
      ["asset_type", asset_type], ["asset_category", asset_category], ["cultural_group", cultural_group],
      ["location_accuracy", location_accuracy], ["elevation_m", elevation_m], ["gps_accuracy_m", gps_accuracy_m],
      ["region", region], ["district", district], ["community", community],
      ["location_description", location_description], ["height_m", height_m], ["width_m", width_m],
      ["length_m", length_m], ["diameter_m", diameter_m], ["weight_kg", weight_kg],
      ["material", material], ["secondary_material", secondary_material], ["technique", technique],
      ["condition", condition], ["damage_type", damage_type], ["conservation_status", conservation_status],
      ["period", period], ["period_start", period_start], ["period_end", period_end],
      ["estimated_age", estimated_age], ["discovered_date", discovered_date], ["recorded_date", recorded_date],
      ["origin_known", origin_known], ["origin_location", origin_location], ["current_location", current_location],
      ["ownership", ownership], ["data_completeness_score", data_completeness_score],
      ["verification_status", verification_status], ["data_source", data_source],
      ["notes", notes], ["observer", observer], ["survey_method", survey_method]
    ];

    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    if (geomValue) {
      setClauses.push(`geom = ST_SetSRID(ST_GeomFromGeoJSON($${paramIndex}), 4326)`);
      values.push(geomValue);
      paramIndex++;
    }

    for (const [field, value] of fields) {
      if (value !== undefined) {
        setClauses.push(`${field} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: "No fields to update." });
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(id);

    const result = await db.query(
      `UPDATE heritage_assets SET ${setClauses.join(", ")} WHERE id = $${paramIndex} RETURNING id, updated_at`,
      values
    );

    res.json({ success: true, id: result.rows[0].id, updated_at: result.rows[0].updated_at });
  } catch (err) {
    console.error("Failed to update heritage asset:", err.message);
    res.status(500).json({ error: "Failed to update heritage asset." });
  }
});

// DELETE /api/heritage-assets/:id - Soft-delete a heritage asset
app.delete("/api/heritage-assets/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await db.query(
      "SELECT id FROM heritage_assets WHERE id = $1 AND deleted_at IS NULL",
      [id]
    );
    if (existing.rowCount === 0) {
      return res.status(404).json({ error: "Heritage asset not found." });
    }

    await db.query(
      "UPDATE heritage_assets SET deleted_at = NOW() WHERE id = $1",
      [id]
    );

    res.json({ success: true, message: "Heritage asset deleted." });
  } catch (err) {
    console.error("Failed to delete heritage asset:", err.message);
    res.status(500).json({ error: "Failed to delete heritage asset." });
  }
});

// DELETE /api/heritage-assets/:id/media/:mediaId - Delete a media record and its file
app.delete("/api/heritage-assets/:id/media/:mediaId", requireAdmin, async (req, res) => {
  const { id, mediaId } = req.params;

  try {
    const assetCheck = await db.query(
      "SELECT id FROM heritage_assets WHERE id = $1 AND deleted_at IS NULL",
      [id]
    );
    if (assetCheck.rowCount === 0) {
      return res.status(404).json({ error: "Heritage asset not found." });
    }

    const existing = await db.query(
      "SELECT id, file_path FROM heritage_asset_media WHERE id = $1 AND asset_id = $2",
      [mediaId, id]
    );

    if (existing.rowCount === 0) {
      return res.status(404).json({ error: "Media record not found." });
    }

    await db.query("DELETE FROM heritage_asset_media WHERE id = $1", [mediaId]);

    const fullPath = resolveUploadPath(existing.rows[0].file_path);
    if (fullPath) {
      await fs.promises.unlink(fullPath).catch(() => { });
    }

    res.json({ success: true, message: "Media deleted." });
  } catch (err) {
    console.error("Failed to delete media:", err.message);
    res.status(500).json({ error: "Failed to delete media." });
  }
});

// PATCH /api/heritage-assets/:id/media/:mediaId - Update media record (caption, isPrimary, sortOrder)
app.patch("/api/heritage-assets/:id/media/:mediaId", requireAdmin, async (req, res) => {
  const { id, mediaId } = req.params;
  const { caption, isPrimary, sortOrder } = req.body;

  try {
    const assetCheck = await db.query(
      "SELECT id FROM heritage_assets WHERE id = $1 AND deleted_at IS NULL",
      [id]
    );
    if (assetCheck.rowCount === 0) {
      return res.status(404).json({ error: "Heritage asset not found." });
    }

    const existing = await db.query(
      "SELECT id, media_type FROM heritage_asset_media WHERE id = $1 AND asset_id = $2",
      [mediaId, id]
    );

    if (existing.rowCount === 0) {
      return res.status(404).json({ error: "Media record not found." });
    }

    if (isPrimary && existing.rows[0].media_type !== "image") {
      return res.status(400).json({ error: "Only image files can be set as primary." });
    }

    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    if (caption !== undefined) {
      setClauses.push(`caption = $${paramIndex}`);
      values.push(caption);
      paramIndex++;
    }
    if (isPrimary !== undefined) {
      if (isPrimary) {
        await db.query(
          "UPDATE heritage_asset_media SET is_primary = false WHERE asset_id = $1",
          [id]
        );
      }
      setClauses.push(`is_primary = $${paramIndex}`);
      values.push(isPrimary);
      paramIndex++;
    }
    if (sortOrder !== undefined) {
      setClauses.push(`sort_order = $${paramIndex}`);
      values.push(sortOrder);
      paramIndex++;
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: "No fields to update." });
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(mediaId);

    const result = await db.query(
      `UPDATE heritage_asset_media SET ${setClauses.join(", ")} WHERE id = $${paramIndex}
       RETURNING id, asset_id AS "assetId", media_type AS "mediaType", file_path AS "filePath",
       file_name AS "fileName", caption, alt_text AS "altText", sort_order AS "sortOrder",
       is_primary AS "isPrimary", created_at AS "createdAt", updated_at AS "updatedAt"`,
      values
    );

    res.json({ success: true, media: result.rows[0] });
  } catch (err) {
    console.error("Failed to update media:", err.message);
    res.status(500).json({ error: "Failed to update media." });
  }
});

// POST /api/heritage-assets/:id/media/reorder - Atomically persist a sort order
app.post("/api/heritage-assets/:id/media/reorder", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { order } = req.body;

  if (!Array.isArray(order) || order.length === 0 ||
      !order.every((entry) => entry && isNonEmptyString(entry.id) && Number.isFinite(Number(entry.sortOrder)))) {
    return res.status(400).json({ error: "Provide an array of { id, sortOrder } entries." });
  }

  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");
    for (const entry of order) {
      await client.query(
        "UPDATE heritage_asset_media SET sort_order = $1, updated_at = NOW() WHERE id = $2 AND asset_id = $3",
        [Number(entry.sortOrder), entry.id, id]
      );
    }
    await client.query("COMMIT");
    res.json({ success: true, updated: order.length });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => { });
    console.error("Failed to reorder media:", err.message);
    res.status(500).json({ error: "Failed to reorder media." });
  } finally {
    client.release();
  }
});

// POST /api/heritage-assets/bulk-delete - Soft-delete multiple heritage assets
app.post("/api/heritage-assets/bulk-delete", requireAdmin, async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "Provide an array of asset IDs to delete." });
  }

  try {
    const result = await db.query(
      "UPDATE heritage_assets SET deleted_at = NOW() WHERE id = ANY($1::text[]) AND deleted_at IS NULL",
      [ids]
    );

    res.json({ success: true, deleted: result.rowCount });
  } catch (err) {
    console.error("Failed to bulk delete heritage assets:", err.message);
    res.status(500).json({ error: "Failed to delete assets." });
  }
});

// POST /api/heritage-assets/:id/restore - Restore a soft-deleted heritage asset
app.post("/api/heritage-assets/:id/restore", requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      "UPDATE heritage_assets SET deleted_at = NULL WHERE id = $1 AND deleted_at IS NOT NULL RETURNING id",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Heritage asset not found or not deleted." });
    }

    res.json({ success: true, message: "Heritage asset restored." });
  } catch (err) {
    console.error("Failed to restore heritage asset:", err.message);
    res.status(500).json({ error: "Failed to restore heritage asset." });
  }
});

// DELETE /api/heritage-assets/:id/permanent - Permanently delete a heritage asset (admin only)
app.delete("/api/heritage-assets/:id/permanent", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const client = await db.pool.connect();

  try {
    await client.query("BEGIN");

    const existing = await client.query("SELECT id FROM heritage_assets WHERE id = $1", [id]);
    if (existing.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Heritage asset not found." });
    }

    const mediaFiles = await client.query(
      "SELECT file_path FROM heritage_asset_media WHERE asset_id = $1",
      [id]
    );

    await client.query("DELETE FROM heritage_asset_media WHERE asset_id = $1", [id]);
    await client.query("DELETE FROM heritage_assets WHERE id = $1", [id]);

    await client.query("COMMIT");

    for (const row of mediaFiles.rows) {
      const fullPath = resolveUploadPath(row.file_path);
      if (fullPath) {
        await fs.promises.unlink(fullPath).catch(() => { });
      }
    }

    res.json({ success: true, message: "Heritage asset permanently deleted." });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => { });
    console.error("Failed to permanently delete heritage asset:", err.message);
    res.status(500).json({ error: "Failed to permanently delete heritage asset." });
  } finally {
    client.release();
  }
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found.` });
});

// Global error-handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE: "File is too large. 3D models up to 500 MB, other files up to 50 MB.",
      LIMIT_UNACCEPTABLE_TYPE: "File type not allowed.",
      LIMIT_FILE_COUNT: "Too many files. A maximum of 20 files can be uploaded at once.",
    };
    return res.status(400).json({ error: messages[err.code] || `Upload error: ${err.code}` });
  }
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Internal server error." });
});

// Start listening for requests
const startServer = () => {
  if (!ADMIN_PASSWORD) {
    console.warn("⚠ Set ADMIN_PASSWORD in .env to enable admin write access.");
  }

  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 Node.js Express server running on port ${PORT}`);
    console.log(`👉 API status check: http://localhost:${PORT}/api/status`);
    console.log(`👉 Get Assets API: http://localhost:${PORT}/api/heritage-assets`);
    console.log(`==================================================`);
  });
};

startServer();
