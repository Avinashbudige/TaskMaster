require("dotenv").config();

const { initDb, pool } = require("./db");

initDb()
  .then(async () => {
    console.log("Database migration completed successfully");
    await pool.end();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Database migration failed", error);
    await pool.end();
    process.exit(1);
  });
