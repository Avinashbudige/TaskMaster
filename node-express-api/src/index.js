require("dotenv").config();

const { initDb } = require("./db");
const app = require("./app");
const port = Number(process.env.PORT || 5000);

initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Node API listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database", error);
    process.exit(1);
  });
