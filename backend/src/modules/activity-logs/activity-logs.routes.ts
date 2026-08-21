import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as activityLogsController from "./activity-logs.controller";
import { listActivityLogsQuerySchema } from "./activity-logs.schemas";

export const activityLogsRoutes = Router();

activityLogsRoutes.use(authMiddleware, requireRole("ADMIN"));

activityLogsRoutes.get(
  "/",
  validate(listActivityLogsQuerySchema, "query"),
  activityLogsController.list
);
