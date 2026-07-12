import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("WARNING: DATABASE_URL environment variable is not set inside .env!");
}

// Set up connection pooling
const pool = new Pool({
  connectionString: connectionString,
});

// Capture unexpected errors on idle database connections
pool.on("error", (err) => {
  console.error("Unexpected error on idle database client", err);
});

export default {
  /**
   * Helper function to execute queries on the database pool
   * @param {string} text - SQL Query
   * @param {any[]} params - Query parameters
   * @returns {Promise<pg.QueryResult>}
   */
  query: (text, params) => pool.query(text, params),
  pool,
};
