const swaggerUi = require("swagger-ui-express");
const openApiDocument = require("./openapi.json");

function setupSwagger(app) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
}

module.exports = setupSwagger;
