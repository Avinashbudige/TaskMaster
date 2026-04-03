const authService = require("./auth.service");

async function register(req, res, next) {
  try {
    const user = await authService.registerUser(req.body);
    return res.status(201).json(user);
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const payload = await authService.loginUser(req.body);
    return res.json(payload);
  } catch (error) {
    return next(error);
  }
}

async function refresh(req, res, next) {
  try {
    const payload = await authService.refreshTokens(req.body);
    return res.json(payload);
  } catch (error) {
    return next(error);
  }
}

async function logout(_req, res, next) {
  try {
    await authService.logoutUser();
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

async function me(req, res, next) {
  try {
    const user = await authService.getCurrentUser(req.user.sub);
    return res.json(user);
  } catch (error) {
    return next(error);
  }
}

async function updateMe(req, res, next) {
  try {
    const user = await authService.updateCurrentUser(req.user.sub, req.body);
    return res.json(user);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  me,
  updateMe,
};
