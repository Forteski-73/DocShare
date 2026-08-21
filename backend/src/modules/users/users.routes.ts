import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as usersController from "./users.controller";
import {
  createUserSchema,
  updateUserSchema,
  listUsersQuerySchema,
  userIdParamSchema,
} from "./users.schemas";

export const usersRoutes = Router();

usersRoutes.use(authMiddleware, requireRole("ADMIN"));

usersRoutes.get("/", validate(listUsersQuerySchema, "query"), usersController.list);
usersRoutes.post("/", validate(createUserSchema), usersController.create);
usersRoutes.get("/:id", validate(userIdParamSchema, "params"), usersController.getById);
usersRoutes.get(
  "/:id/avatar",
  validate(userIdParamSchema, "params"),
  usersController.getAvatar
);
usersRoutes.patch(
  "/:id",
  validate(userIdParamSchema, "params"),
  validate(updateUserSchema),
  usersController.update
);
usersRoutes.delete("/:id", validate(userIdParamSchema, "params"), usersController.deactivate);
usersRoutes.post(
  "/:id/resend-invite",
  validate(userIdParamSchema, "params"),
  usersController.resendInvite
);
