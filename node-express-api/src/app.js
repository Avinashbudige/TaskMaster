const express = require("express");
const helmet = require("helmet");
const setupSwagger = require("./config/swagger");
const { globalLimiter } = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");
const routes = require("./routes");

const app = express();

const trustProxy = process.env.TRUST_PROXY;
if (trustProxy === "true") {
  app.set("trust proxy", true);
} else if (trustProxy === "false") {
  app.set("trust proxy", false);
} else if (trustProxy && !Number.isNaN(Number(trustProxy))) {
  app.set("trust proxy", Number(trustProxy));
} else {
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");
app.use(helmet());
app.use(globalLimiter);
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    name: "TaskMaster Node API",
    status: "running",
    endpoints: {
      health: "/health",
      docs: "/docs",
    },
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

setupSwagger(app);

app.use(routes);
app.use(errorHandler);

module.exports = app;
