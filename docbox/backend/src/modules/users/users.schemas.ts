import { z } from "zod";

export const createUserSchema = z.object({
  badgeNumber: z.string().min(1, "Informe o cracha"),
  email: z.string().email("E-mail invalido"),
  role: z.enum(["EDITOR", "READER", "APPROVER"]),
});

export const updateUserSchema = z
  .object({
    badgeNumber: z.string().min(1).optional(),
    email: z.string().email("E-mail invalido").optional(),
    role: z.enum(["ADMIN", "EDITOR", "READER", "APPROVER"]).optional(),
    status: z.enum(["PENDING", "ACTIVE", "INACTIVE"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  });

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
  role: z.enum(["ADMIN", "EDITOR", "READER", "APPROVER"]).optional(),
  status: z.enum(["PENDING", "ACTIVE", "INACTIVE"]).optional(),
});

export const userIdParamSchema = z.object({
  id: z.string().min(1),
});
