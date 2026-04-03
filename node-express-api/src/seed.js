require("dotenv").config();

const { pool, query, initDb } = require("./db");
const { hashPassword } = require("./utils/auth");

const DEMO_USER = {
  name: "Demo User",
  email: "demo@taskmaster.local",
  password: "DemoPass123!",
  role: "ADMIN",
};

const DEMO_TEAM = {
  name: "Demo Team",
};

const DEMO_TASKS = [
  {
    title: "DEMO: Set up project board",
    description: "Create initial board columns and labels",
    status: "OPEN",
    priority: "HIGH",
  },
  {
    title: "DEMO: Invite first team member",
    description: "Add one member and verify permissions",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
  },
  {
    title: "DEMO: Write API smoke tests",
    description: "Cover auth, tasks list, and task creation",
    status: "DONE",
    priority: "LOW",
  },
];

async function ensureDemoUser() {
  const existing = await query(
    "SELECT id, name, email, role FROM users WHERE email = $1",
    [DEMO_USER.email]
  );

  if (existing.rowCount > 0) {
    return existing.rows[0];
  }

  const passwordHash = await hashPassword(DEMO_USER.password);
  const inserted = await query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role`,
    [DEMO_USER.name, DEMO_USER.email, passwordHash, DEMO_USER.role]
  );

  return inserted.rows[0];
}

async function ensureDemoTeam(ownerId) {
  const existing = await query(
    "SELECT id, name, owner_id FROM teams WHERE name = $1 AND owner_id = $2",
    [DEMO_TEAM.name, ownerId]
  );

  if (existing.rowCount > 0) {
    return existing.rows[0];
  }

  const inserted = await query(
    `INSERT INTO teams (name, owner_id)
     VALUES ($1, $2)
     RETURNING id, name, owner_id`,
    [DEMO_TEAM.name, ownerId]
  );

  return inserted.rows[0];
}

async function ensureMembership(userId, teamId) {
  await query(
    `INSERT INTO team_members (user_id, team_id, role)
     VALUES ($1, $2, 'ADMIN')
     ON CONFLICT (user_id, team_id) DO NOTHING`,
    [userId, teamId]
  );
}

async function seedTasks(userId, teamId) {
  await query(
    "DELETE FROM tasks WHERE team_id = $1 AND created_by = $2 AND title LIKE 'DEMO:%'",
    [teamId, userId]
  );

  for (const task of DEMO_TASKS) {
    await query(
      `INSERT INTO tasks (title, description, status, priority, created_by, assigned_to, team_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [task.title, task.description, task.status, task.priority, userId, userId, teamId]
    );
  }
}

async function run() {
  try {
    await initDb();

    await query("BEGIN");

    const user = await ensureDemoUser();
    const team = await ensureDemoTeam(user.id);
    await ensureMembership(user.id, team.id);
    await seedTasks(user.id, team.id);

    await query("COMMIT");

    console.log("Seed completed successfully");
    console.log(`Demo user email: ${DEMO_USER.email}`);
    console.log(`Demo user password: ${DEMO_USER.password}`);
    console.log(`Demo team id: ${team.id}`);
  } catch (error) {
    try {
      await query("ROLLBACK");
    } catch (_rollbackError) {
      // Ignore rollback errors to preserve original failure context.
    }
    console.error("Seed failed", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

run();
