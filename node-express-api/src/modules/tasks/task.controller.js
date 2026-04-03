const taskService = require("./task.service");

async function createTask(req, res, next) {
  try {
    const task = await taskService.createTask(req.body);
    return res.status(201).json(task);
  } catch (error) {
    return next(error);
  }
}

async function listTasks(req, res, next) {
  try {
    const tasks = await taskService.listTasks(req.query);
    return res.json(tasks);
  } catch (error) {
    return next(error);
  }
}

async function getTaskById(req, res, next) {
  try {
    const task = await taskService.getTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: "task not found" });
    }
    return res.json(task);
  } catch (error) {
    return next(error);
  }
}

async function updateTask(req, res, next) {
  try {
    const task = await taskService.updateTask(req.params.id, req.body);
    if (!task) {
      return res.status(404).json({ error: "task not found" });
    }
    return res.json(task);
  } catch (error) {
    return next(error);
  }
}

async function deleteTask(req, res, next) {
  try {
    const deleted = await taskService.deleteTask(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "task not found" });
    }
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createTask,
  listTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
