require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const { initDb } = require("./db");
const { globalLimiter } = require("./middleware/rate-limiters");
const routes = require("./routes");
const openApiDocument = require("./config/openapi.json");

const app = express();
const port = Number(process.env.PORT || 5000);

app.disable("x-powered-by");
app.use(helmet());
app.use(globalLimiter);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use(routes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "internal server error" });
});

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
