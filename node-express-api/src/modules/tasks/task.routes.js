const express = require("express");
const validate = require("../../middleware/validate");
const controller = require("./task.controller");
const {
  createTaskSchema,
  updateTaskSchema,
  taskParamsSchema,
  listTasksQuerySchema,
} = require("./task.validation");

const router = express.Router();

router.get("/", validate(listTasksQuerySchema, "query"), controller.listTasks);
router.get("/:id", validate(taskParamsSchema, "params"), controller.getTaskById);
router.post("/", validate(createTaskSchema), controller.createTask);
router.put(
  "/:id",
  validate(taskParamsSchema, "params"),
  validate(updateTaskSchema),
  controller.updateTask
);
router.delete("/:id", validate(taskParamsSchema, "params"), controller.deleteTask);

module.exports = router;
