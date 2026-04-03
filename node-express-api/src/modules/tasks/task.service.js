const repository = require("./task.repository");
const cache = require("../../utils/cache");

const SORT_FIELDS = new Set(["due_date", "created_at", "priority"]);

function buildFilters(query) {
  const filters = [];
  const params = [];

  if (query.status) {
    params.push(query.status);
    filters.push(`status = $${params.length}`);
  }

  if (query.team_id) {
    params.push(query.team_id);
    filters.push(`team_id = $${params.length}`);
  }

  if (query.assigned_to) {
    params.push(query.assigned_to);
    filters.push(`assigned_to = $${params.length}`);
  }

  if (query.search) {
    params.push(`%${query.search}%`);
    filters.push(`(title ILIKE $${params.length} OR description ILIKE $${params.length})`);
  }

  return {
    whereSql: filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "",
    params,
  };
}

async function createTask(payload) {
  const created = await repository.createTask({
    title: payload.title,
    description: payload.description || null,
    status: payload.status || "OPEN",
    due_date: payload.due_date || null,
    priority: payload.priority || "MEDIUM",
    created_by: payload.created_by,
    assigned_to: payload.assigned_to || null,
    team_id: payload.team_id,
  });

  cache.clearByPrefix("tasks:list:");
  return created;
}

async function listTasks(rawQuery) {
  const query = {
    page: rawQuery.page ?? 1,
    limit: rawQuery.limit ?? 20,
    status: rawQuery.status,
    team_id: rawQuery.team_id,
    assigned_to: rawQuery.assigned_to,
    search: rawQuery.search,
    sort: rawQuery.sort,
    order: rawQuery.order,
  };

  const page = query.page;
  const limit = query.limit;
  const offset = (page - 1) * limit;

  const sort = SORT_FIELDS.has(query.sort) ? query.sort : "created_at";
  const order = query.order === "asc" ? "ASC" : "DESC";

  const cacheKey = `tasks:list:${JSON.stringify({ ...query, sort, order })}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const { whereSql, params } = buildFilters(query);

  const [items, total] = await Promise.all([
    repository.findTasks({ whereSql, params, sort, order, limit, offset }),
    repository.countTasks({ whereSql, params }),
  ]);

  const payload = {
    items,
    meta: {
      page,
      limit,
      total,
    },
  };

  cache.set(cacheKey, payload, 30 * 1000);
  return payload;
}

async function getTaskById(id) {
  return repository.findTaskById(id);
}

async function updateTask(id, payload) {
  const updated = await repository.updateTask(id, payload);
  cache.clearByPrefix("tasks:list:");
  return updated;
}

async function deleteTask(id) {
  const deleted = await repository.deleteTask(id);
  cache.clearByPrefix("tasks:list:");
  return deleted;
}

module.exports = {
  createTask,
  listTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
