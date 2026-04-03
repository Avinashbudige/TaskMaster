const express = require("express");
const helmet = require("helmet");
const setupSwagger = require("./config/swagger");
const { globalLimiter } = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");
const routes = require("./routes");

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(globalLimiter);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

setupSwagger(app);

app.use(routes);
app.use(errorHandler);

module.exports = app;
