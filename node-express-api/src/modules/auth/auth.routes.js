const express = require("express");
const validate = require("../../middleware/validate");
const authenticate = require("../../middleware/authenticate");
const controller = require("./auth.controller");
const {
	registerSchema,
	loginSchema,
	refreshSchema,
	updateProfileSchema,
} = require("./auth.validation");

const router = express.Router();

router.post("/register", validate(registerSchema), controller.register);
router.post("/login", validate(loginSchema), controller.login);
router.post("/refresh", validate(refreshSchema), controller.refresh);
router.post("/logout", controller.logout);
router.get("/me", authenticate, controller.me);
router.put("/me", authenticate, validate(updateProfileSchema), controller.updateMe);

module.exports = router;
