const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const refreshSchema = z.object({
  refresh_token: z.string().min(1),
});

const updateProfileSchema = z
  .object({
    name: z.string().min(1).optional(),
    password: z.string().min(8).optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "at least one field is required",
  });

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  updateProfileSchema,
};
