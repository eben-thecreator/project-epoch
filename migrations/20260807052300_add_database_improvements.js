/**
 * Migration: Add database improvements
 * - Full-text search (GIN + tsvector)
 * - Partial indexes for collection filtering
 * - Auto-update trigger for updated_at
 * - Pagination support (count query)
 * - Soft-delete support (deleted_at)
 */

exports.up = async (pgm) => {
  // --- Improvement 2: Full-Text Search ---
  // Add a generated tsvector column combining weighted fields
  pgm.sql(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'heritage_assets' AND column_name = 'search_vector'
      ) THEN
        ALTER TABLE heritage_assets ADD COLUMN search_vector tsvector
        GENERATED ALWAYS AS (
          setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
          setweight(to_tsvector('english', coalesce(alternative_name, '')), 'A') ||
          setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
          setweight(to_tsvector('english', coalesce(region, '')), 'C') ||
          setweight(to_tsvector('english', coalesce(district, '')), 'C') ||
          setweight(to_tsvector('english', coalesce(community, '')), 'C') ||
          setweight(to_tsvector('english', coalesce(asset_category, '')), 'C') ||
          setweight(to_tsvector('english', coalesce(cultural_group, '')), 'D')
        ) STORED;
      END IF;
    END $$;
  `);

  pgm.sql(`
    CREATE INDEX IF NOT EXISTS idx_ha_search ON heritage_assets USING GIN (search_vector)
  `);

  // --- Improvement 3: Partial Indexes for Collection Filtering ---
  pgm.sql(`
    CREATE INDEX IF NOT EXISTS idx_ha_artifacts ON heritage_assets (id)
    WHERE (
      (asset_type = 'Object (Physical Artifact)' OR asset_category IN ('Artifact', 'Jewelry / Beadwork'))
      AND asset_category IS DISTINCT FROM 'Textile (Kente, etc.)'
    )
  `);

  pgm.sql(`
    CREATE INDEX IF NOT EXISTS idx_ha_museums ON heritage_assets (id)
    WHERE (
      asset_type = 'Site (Geography / Ruins)'
      OR asset_category IN ('Museum', 'Fort', 'Castle', 'Monument')
    )
  `);

  pgm.sql(`
    CREATE INDEX IF NOT EXISTS idx_ha_textiles ON heritage_assets (id)
    WHERE asset_category = 'Textile (Kente, etc.)'
  `);

  pgm.sql(`
    CREATE INDEX IF NOT EXISTS idx_ha_documents ON heritage_assets (id)
    WHERE (
      asset_type = 'Document (Photo, Map, Archive)'
      OR asset_category IN ('Photograph / Digital Media', 'Audio / Music')
    )
  `);

  pgm.sql(`
    CREATE INDEX IF NOT EXISTS idx_ha_needs_review ON heritage_assets (id)
    WHERE asset_type IS NULL OR asset_category IS NULL
  `);

  // --- Improvement 4: Auto-Update Trigger for updated_at ---
  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  `);

  pgm.sql(`DROP TRIGGER IF EXISTS tg_heritage_assets_updated ON heritage_assets`);
  pgm.sql(`DROP TRIGGER IF EXISTS tg_heritage_asset_media_updated ON heritage_asset_media`);

  pgm.sql(`
    CREATE TRIGGER tg_heritage_assets_updated
    BEFORE UPDATE ON heritage_assets
    FOR EACH ROW EXECUTE FUNCTION update_timestamp()
  `);

  pgm.sql(`
    CREATE TRIGGER tg_heritage_asset_media_updated
    BEFORE UPDATE ON heritage_asset_media
    FOR EACH ROW EXECUTE FUNCTION update_timestamp()
  `);

  // --- Improvement 6: Pagination support index ---
  // Composite index for the default sort (created_at DESC) + id for efficient pagination
  pgm.sql(`
    CREATE INDEX IF NOT EXISTS idx_ha_created_at_id ON heritage_assets (created_at DESC, id)
  `);

  // --- Improvement 9: Soft-Delete Support ---
  pgm.sql(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'heritage_assets' AND column_name = 'deleted_at'
      ) THEN
        ALTER TABLE heritage_assets ADD COLUMN deleted_at timestamp DEFAULT NULL;
      END IF;
    END $$;
  `);

  pgm.sql(`
    CREATE INDEX IF NOT EXISTS idx_ha_deleted_at ON heritage_assets (deleted_at)
    WHERE deleted_at IS NOT NULL
  `);

  // Filter out soft-deleted rows by default via a partial unique index
  // This also helps queries that filter on deleted_at IS NULL
  pgm.sql(`
    CREATE INDEX IF NOT EXISTS idx_ha_active ON heritage_assets (id)
    WHERE deleted_at IS NULL
  `);
};

exports.down = async (pgm) => {
  // Remove soft-delete
  pgm.sql(`DROP INDEX IF EXISTS idx_ha_active`);
  pgm.sql(`DROP INDEX IF EXISTS idx_ha_deleted_at`);
  pgm.sql(`ALTER TABLE heritage_assets DROP COLUMN IF EXISTS deleted_at`);

  // Remove pagination index
  pgm.sql(`DROP INDEX IF EXISTS idx_ha_created_at_id`);

  // Remove triggers
  pgm.sql(`DROP TRIGGER IF EXISTS tg_heritage_asset_media_updated ON heritage_asset_media`);
  pgm.sql(`DROP TRIGGER IF EXISTS tg_heritage_assets_updated ON heritage_assets`);
  pgm.sql(`DROP FUNCTION IF EXISTS update_timestamp()`);

  // Remove collection partial indexes
  pgm.sql(`DROP INDEX IF EXISTS idx_ha_needs_review`);
  pgm.sql(`DROP INDEX IF EXISTS idx_ha_documents`);
  pgm.sql(`DROP INDEX IF EXISTS idx_ha_textiles`);
  pgm.sql(`DROP INDEX IF EXISTS idx_ha_museums`);
  pgm.sql(`DROP INDEX IF EXISTS idx_ha_artifacts`);

  // Remove full-text search
  pgm.sql(`DROP INDEX IF EXISTS idx_ha_search`);
  pgm.sql(`ALTER TABLE heritage_assets DROP COLUMN IF EXISTS search_vector`);
};
