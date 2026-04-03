const express = require("express");
const taskRoutes = require("../modules/tasks/task.routes");
const authRoutes = require("../modules/auth/auth.routes");

const router = express.Router();

router.use("/tasks", taskRoutes);
router.use("/auth", authRoutes);

module.exports = router;
