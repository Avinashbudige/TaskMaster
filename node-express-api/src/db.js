const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

if (
  connectionString.includes("your_postgres_connection_string") ||
  connectionString.includes("change_me")
) {
  throw new Error(
    "DATABASE_URL is still a placeholder. Set it in .env, for example: postgresql://postgres:postgres@localhost:5432/taskmaster_node"
  );
}

const pool = new Pool({
  connectionString,
});

async function initDb() {
  const schemaPath = path.join(__dirname, "config", "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");

  await pool.query(schemaSql);
}

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  initDb,
};
