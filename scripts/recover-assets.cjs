const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { Pool } = require("pg");

const RECOVERY_NOTE =
  "Recovered record re-created from uploads/media on 2026-08-23 after the original database row was lost. Placeholder coordinates - update the real location via the admin back office.";
const DATA_SOURCE = "Recovery script";

const ASSETS = [
  {
    id: "MAT-001_1",
    name: "Ohene Kente Cloth",
    description:
      "Kente textile photographed as 'ohene.jpg'. Original asset record was lost; re-registered from the surviving image in uploads/media/MAT-001_1.",
    asset_type: "Textile",
    asset_category: "Textile (Kente, etc.)",
    lat: 5.5471, lon: -0.187,
    media: [
      { file: "media/MAT-001_1/1786217677690-rohe03-ohene.jpg", name: "ohene.jpg", type: "image", primary: true },
    ],
  },
  {
    id: "MAT-001_3",
    name: "Cowskin Material Sample",
    description:
      "Material sample photographed as 'cowskin.jpg'. Original asset record was lost; re-registered from the surviving image in uploads/media/MAT-001_3.",
    asset_type: "Object",
    asset_category: "Artifact",
    material: "Animal hide (cow)",
    lat: 5.5503, lon: -0.1841,
    media: [
      { file: "media/MAT-001_3/1786218528389-enp0rl-cowskin.jpg", name: "cowskin.jpg", type: "image", primary: true },
    ],
  },
  {
    id: "MAT-001_4",
    name: "Tera Textile",
    description:
      "Textile photographed as 'tera1.jpg'. Original asset record was lost; re-registered from the surviving image in uploads/media/MAT-001_4.",
    asset_type: "Textile",
    asset_category: "Textile (Kente, etc.)",
    lat: 5.5529, lon: -0.1902,
    media: [
      { file: "media/MAT-001_4/1786218338825-p28rkh-tera1.jpg", name: "tera1.jpg", type: "image", primary: true },
    ],
  },
  {
    id: "MAT-001_5",
    name: "Untitled Recovered Page",
    description:
      "Scanned page recovered as 'newPage.PNG'. Content unidentified; original asset record was lost and this record was re-registered from the surviving scan.",
    asset_type: "Document (Photo, Map, Archive)",
    asset_category: "Photograph / Digital Media",
    lat: 5.5487, lon: -0.2059,
    media: [
      { file: "media/MAT-001_5/1784473116372-x2vbbf-newPage.PNG", name: "newPage.PNG", type: "image", primary: true },
    ],
  },
  {
    id: "ART-ANK-001",
    name: "Anklet (3D Scan)",
    description:
      "Photogrammetry scan of an anklet ('anklet.glb') with reference photograph. Original asset record was lost; re-registered from files surviving in uploads/media/c60b0e95-ed32-45af-af97-631a37667dcd.",
    asset_type: "Object",
    asset_category: "Jewelry / Beadwork",
    lat: 5.5449, lon: -0.2013,
    media: [
      { file: "media/c60b0e95-ed32-45af-af97-631a37667dcd/1786272323499-x9rxrq-primary.png", name: "primary.png", type: "image", primary: true },
      { file: "media/c60b0e95-ed32-45af-af97-631a37667dcd/1786272322046-7xsjxf-anklet.glb", name: "anklet.glb", type: "model" },
    ],
  },
  {
    id: "ART-ANK-002",
    name: "Anklet (Alternate 3D Scan)",
    description:
      "Second photogrammetry scan of an anklet ('anklet.glb') with reference photograph. Kept as a separate record; original asset row was lost and re-registered from uploads/media/d8426e5e-28b5-493c-9df2-84d64f8d60ce.",
    asset_type: "Object",
    asset_category: "Jewelry / Beadwork",
    lat: 5.5416, lon: -0.1934,
    media: [
      { file: "media/d8426e5e-28b5-493c-9df2-84d64f8d60ce/1786272596984-ocxmaw-primary.png", name: "primary.png", type: "image", primary: true },
      { file: "media/d8426e5e-28b5-493c-9df2-84d64f8d60ce/1786272590034-2b0n3p-anklet.glb", name: "anklet.glb", type: "model" },
    ],
  },
  {
    id: "ART-GW-001",
    name: "Akan Gold Weight (3D Scan)",
    description:
      "Photogrammetry scan of a geometric gold weight ('geoWeight.glb') with reference photograph. Original asset record was lost; re-registered from uploads/media/262c471c-a1ae-4114-a228-63fbd5a8762c.",
    asset_type: "Object",
    asset_category: "Artifact",
    material: "Brass",
    technique: "Lost-wax casting",
    lat: 5.5392, lon: -0.2127,
    media: [
      { file: "media/262c471c-a1ae-4114-a228-63fbd5a8762c/1786272952151-czadto-primary.png", name: "primary.png", type: "image", primary: true },
      { file: "media/262c471c-a1ae-4114-a228-63fbd5a8762c/1786273946337-4zd44x-geoWeight.glb", name: "geoWeight.glb", type: "model" },
    ],
  },
  {
    id: "ART-NTIRI-001",
    name: "Female Figure Ntiri (3D Scan)",
    description:
      "Photogrammetry scan of a carved female figure ('femaleNtiri.glb') with reference photograph. Original asset record was lost; re-registered from uploads/media/artifact.",
    asset_type: "Object",
    asset_category: "Artifact",
    material: "Wood",
    technique: "Carving",
    lat: 5.5361, lon: -0.2205,
    media: [
      { file: "media/artifact/1786278358611-nb5peu-primary.png", name: "primary.png", type: "image", primary: true },
      { file: "media/artifact/1783883610562-d5j7dm-femaleNtiri.glb", name: "femaleNtiri.glb", type: "model" },
    ],
  },
  {
    id: "IMG-CASE-001",
    name: "Case Study Photography Set (Osoro)",
    description:
      "Set of three case-study photographs recovered from uploads/media/osoro. Original parent asset record was lost; images re-registered here pending proper cataloguing.",
    asset_type: "Document (Photo, Map, Archive)",
    asset_category: "Photograph / Digital Media",
    lat: 5.5561, lon: -0.1968,
    media: [
      { file: "media/osoro/1783107623964-caseStudy-museum-1.jpg", name: "caseStudy-museum-1.jpg", type: "image", primary: true },
      { file: "media/osoro/1783107623968-caseStudy-musum-2.jpg", name: "caseStudy-musum-2.jpg", type: "image" },
      { file: "media/osoro/1783107623957-caseStudy-artifact-3.jpg", name: "caseStudy-artifact-3.jpg", type: "image" },
    ],
  },
  {
    id: "MISC-ARC-001",
    name: "Recovered Misc Scans and Models",
    description:
      "Assorted early test uploads (home.jpg, a101.glb, skele.glb) recovered from uploads/media/NULLasasfd. Grouped into one holding record pending review or deletion.",
    asset_type: "Document (Photo, Map, Archive)",
    asset_category: "Photograph / Digital Media",
    lat: 5.5583, lon: -0.2141,
    media: [
      { file: "media/NULLasasfd/1783107131378-home.jpg", name: "home.jpg", type: "image", primary: true },
      { file: "media/NULLasasfd/1783107445812-a101.glb", name: "a101.glb", type: "model" },
      { file: "media/NULLasasfd/1783107464207-skele.glb", name: "skele.glb", type: "model" },
    ],
  },
];

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  const before = await pool.query(
    "SELECT count(*) FILTER (WHERE deleted_at IS NULL) AS active, count(*) FILTER (WHERE deleted_at IS NOT NULL) AS deleted FROM heritage_assets"
  );
  console.log(`Before: ${before.rows[0].active} active / ${before.rows[0].deleted} soft-deleted assets`);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const asset of ASSETS) {
      const exists = await client.query("SELECT id FROM heritage_assets WHERE id = $1", [asset.id]);
      if (exists.rowCount > 0) {
        console.log(`SKIP asset ${asset.id} (already exists)`);
        continue;
      }

      await client.query(
        `INSERT INTO heritage_assets
           (id, name, description, asset_type, asset_category, material, technique,
            geom, location_accuracy, notes, data_source)
         VALUES ($1,$2,$3,$4,$5,$6,$7,
                 ST_SetSRID(ST_MakePoint($8,$9),4326),
                 'unknown',$10,$11)`,
        [asset.id, asset.name, asset.description, asset.asset_type, asset.asset_category,
         asset.material ?? null, asset.technique ?? null,
         asset.lon, asset.lat, RECOVERY_NOTE, DATA_SOURCE]
      );
      console.log(`INSERTED asset ${asset.id} (${asset.name})`);

      let sortOrder = 0;
      for (const m of asset.media) {
        const filePath = `/uploads/${m.file}`;
        const mediaExists = await client.query(
          "SELECT id FROM heritage_asset_media WHERE asset_id = $1 AND file_path = $2",
          [asset.id, filePath]
        );
        if (mediaExists.rowCount > 0) {
          sortOrder += 1;
          continue;
        }
        await client.query(
          `INSERT INTO heritage_asset_media
             (asset_id, media_type, file_path, file_name, caption, sort_order, is_primary)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [asset.id, m.type, filePath, m.name, m.name, sortOrder, Boolean(m.primary)]
        );
        console.log(`   linked ${m.type}: ${m.file}${m.primary ? " [PRIMARY]" : ""}`);
        sortOrder += 1;
      }
    }

    const junk = await client.query(
      `DELETE FROM heritage_assets
       WHERE deleted_at IS NOT NULL
         AND name IS NULL AND alternative_name IS NULL AND description IS NULL
         AND asset_type IS NULL AND asset_category IS NULL
       RETURNING id`
    );
    console.log(`PURGED ${junk.rowCount} junk empty-shell rows`);

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }

  const verify = await pool.query(`
    SELECT ha.id, ha.name,
           (SELECT count(*) FROM heritage_asset_media m WHERE m.asset_id = ha.id) AS media_count
    FROM heritage_assets ha ORDER BY ha.id`);
  console.log("\nFinal state:");
  verify.rows.forEach((r) => console.log(`  ${r.id.padEnd(14)} media:${r.media_count}  ${r.name}`));

  const missing = [];
  for (const asset of ASSETS) {
    for (const m of asset.media) {
      const full = path.join(__dirname, "..", "uploads", ...m.file.split("/"));
      if (!fs.existsSync(full)) missing.push(m.file);
    }
  }
  if (missing.length) throw new Error(`Missing files on disk: ${missing.join(", ")}`);
  console.log("\nAll referenced media files exist on disk.");

  await pool.end();
}

main().catch((err) => {
  console.error("RECOVERY FAILED:", err.message);
  process.exit(1);
});
