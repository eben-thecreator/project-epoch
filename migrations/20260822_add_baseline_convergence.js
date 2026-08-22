/**
 * Baseline convergence migration
 * - Converts legacy ENUM columns on heritage_assets to text
 * - Drops unused QGIS-compatible views, their triggers and helper function
 *
 * Both operations are idempotent so this migration is safe to run on databases
 * that already had them applied by earlier ad-hoc scripts.
 */

exports.up = async (pgm) => {
  // --- ENUM -> TEXT normalization ---
  pgm.sql(`
    DO $$
    DECLARE
      r RECORD;
    BEGIN
      FOR r IN
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'heritage_assets'
          AND udt_name IN (
            'enum_asset_type', 'enum_asset_category', 'enum_condition',
            'enum_conservation_status', 'enum_data_source',
            'enum_location_accuracy', 'enum_verification_status'
          )
      LOOP
        EXECUTE format('ALTER TABLE heritage_assets ALTER COLUMN %I TYPE text', r.column_name);
      END LOOP;
    END $$;
  `);

  // --- Drop unused QGIS views / triggers / function ---
  pgm.sql(`DROP TRIGGER IF EXISTS tg_ha_lines_manage ON ha_lines`);
  pgm.sql(`DROP TRIGGER IF EXISTS tg_ha_points_manage ON ha_points`);
  pgm.sql(`DROP TRIGGER IF EXISTS tg_ha_polygons_manage ON ha_polygons`);
  pgm.sql(`DROP VIEW IF EXISTS ha_lines`);
  pgm.sql(`DROP VIEW IF EXISTS ha_points`);
  pgm.sql(`DROP VIEW IF EXISTS ha_polygons`);
  pgm.sql(`DROP FUNCTION IF EXISTS tg_heritage_assets_updatable()`);
};

exports.down = async () => {
  // Intentionally irreversible: enum types cannot be restored without knowing
  // the original value sets, and the dropped views were obsolete artifacts.
};
