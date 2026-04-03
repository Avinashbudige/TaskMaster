const { z } = require("zod");

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  team_id: z.string().uuid(),
  created_by: z.string().uuid(),
  assigned_to: z.string().uuid().optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  due_date: z.string().datetime().optional(),
});

const updateTaskSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    status: z.enum(["OPEN", "IN_PROGRESS", "DONE"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
    due_date: z.string().datetime().nullable().optional(),
    assigned_to: z.string().uuid().nullable().optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "at least one field is required",
  });

const taskParamsSchema = z.object({
  id: z.string().uuid(),
});

const listTasksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["OPEN", "IN_PROGRESS", "DONE"]).optional(),
  team_id: z.string().uuid().optional(),
  assigned_to: z.string().uuid().optional(),
  search: z.string().min(1).optional(),
  sort: z.enum(["due_date", "created_at", "priority"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  taskParamsSchema,
  listTasksQuerySchema,
};
