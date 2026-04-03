const jwt = require("jsonwebtoken");
const { query } = require("../../db");
const {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
} = require("../../utils/auth");

async function registerUser(payload) {
  const { name, email, password } = payload;

  const existing = await query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rowCount > 0) {
    const error = new Error("email already exists");
    error.status = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);
  const result = await query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, role, created_at`,
    [name, email, passwordHash]
  );

  return result.rows[0];
}

async function loginUser(payload) {
  const { email, password } = payload;

  const result = await query(
    "SELECT id, name, email, role, password_hash FROM users WHERE email = $1",
    [email]
  );

  if (result.rowCount === 0) {
    const error = new Error("invalid credentials");
    error.status = 401;
    throw error;
  }

  const user = result.rows[0];
  const valid = await verifyPassword(password, user.password_hash);

  if (!valid) {
    const error = new Error("invalid credentials");
    error.status = 401;
    throw error;
  }

  const userPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  return {
    access_token: signAccessToken(userPayload),
    refresh_token: signRefreshToken(userPayload),
    user: userPayload,
  };
}

async function refreshTokens(payload) {
  const { refresh_token } = payload;

  let decoded;
  try {
    decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
  } catch (_error) {
    const error = new Error("invalid or expired refresh token");
    error.status = 401;
    throw error;
  }

  const userResult = await query("SELECT id, name, email, role FROM users WHERE id = $1", [
    decoded.sub,
  ]);

  if (userResult.rowCount === 0) {
    const error = new Error("user not found");
    error.status = 404;
    throw error;
  }

  const user = userResult.rows[0];
  return {
    access_token: signAccessToken(user),
    refresh_token: signRefreshToken(user),
    user,
  };
}

async function logoutUser() {
  return true;
}

async function getCurrentUser(userId) {
  const result = await query(
    "SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1",
    [userId]
  );

  if (result.rowCount === 0) {
    const error = new Error("user not found");
    error.status = 404;
    throw error;
  }

  return result.rows[0];
}

async function updateCurrentUser(userId, payload) {
  const fields = [];
  const params = [];

  if (Object.prototype.hasOwnProperty.call(payload, "name")) {
    params.push(payload.name);
    fields.push(`name = $${params.length}`);
  }

  if (Object.prototype.hasOwnProperty.call(payload, "password")) {
    const passwordHash = await hashPassword(payload.password);
    params.push(passwordHash);
    fields.push(`password_hash = $${params.length}`);
  }

  if (fields.length === 0) {
    return getCurrentUser(userId);
  }

  params.push(userId);
  const result = await query(
    `UPDATE users
     SET ${fields.join(", ")}
     WHERE id = $${params.length}
     RETURNING id, name, email, role, created_at, updated_at`,
    params
  );

  if (result.rowCount === 0) {
    const error = new Error("user not found");
    error.status = 404;
    throw error;
  }

  return result.rows[0];
}

module.exports = {
  registerUser,
  loginUser,
  refreshTokens,
  logoutUser,
  getCurrentUser,
  updateCurrentUser,
};
