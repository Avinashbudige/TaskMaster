const { query } = require("../../db");

async function findTaskById(id) {
  const result = await query(
    `SELECT id, title, description, status, due_date, priority, created_by, assigned_to, team_id, created_at, updated_at
     FROM tasks
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

async function findTasks({ whereSql, params, sort, order, limit, offset }) {
  const result = await query(
    `SELECT id, title, description, status, due_date, priority, created_by, assigned_to, team_id, created_at, updated_at
     FROM tasks
     ${whereSql}
     ORDER BY ${sort} ${order}
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );

  return result.rows;
}

async function countTasks({ whereSql, params }) {
  const result = await query(`SELECT COUNT(*)::int AS total FROM tasks ${whereSql}`, params);
  return result.rows[0].total;
}

async function createTask(payload) {
  const {
    title,
    description,
    status,
    due_date,
    priority,
    created_by,
    assigned_to,
    team_id,
  } = payload;

  const result = await query(
    `INSERT INTO tasks (title, description, status, due_date, priority, created_by, assigned_to, team_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, title, description, status, due_date, priority, created_by, assigned_to, team_id, created_at, updated_at`,
    [title, description, status, due_date, priority, created_by, assigned_to, team_id]
  );

  return result.rows[0];
}

async function updateTask(id, updates) {
  const allowedFields = ["title", "description", "status", "due_date", "priority", "assigned_to"];
  const setClauses = [];
  const params = [];

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(updates, field)) {
      params.push(updates[field]);
      setClauses.push(`${field} = $${params.length}`);
    }
  }

  if (setClauses.length === 0) {
    return findTaskById(id);
  }

  params.push(id);

  const result = await query(
    `UPDATE tasks
     SET ${setClauses.join(", ")}
     WHERE id = $${params.length}
     RETURNING id, title, description, status, due_date, priority, created_by, assigned_to, team_id, created_at, updated_at`,
    params
  );

  return result.rows[0] || null;
}

async function deleteTask(id) {
  const result = await query("DELETE FROM tasks WHERE id = $1", [id]);
  return result.rowCount > 0;
}

module.exports = {
  findTaskById,
  findTasks,
  countTasks,
  createTask,
  updateTask,
  deleteTask,
};
