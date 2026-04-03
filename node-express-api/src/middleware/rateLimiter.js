const { globalLimiter, authLimiter } = require("./rate-limiters");

module.exports = {
  globalLimiter,
  authLimiter,
};
