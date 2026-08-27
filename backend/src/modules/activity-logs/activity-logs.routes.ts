import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as activityLogsController from "./activity-logs.controller";
import { listActivityLogsQuerySchema } from "./activity-logs.schemas";

export const activityLogsRoutes = Router();

activityLogsRoutes.use(authMiddleware, requireRole("ADMIN"));

/**
 * @openapi
 * /activity-logs:
 *   get:
 *     tags: [ActivityLogs]
 *     summary: Lista o log de atividades — ADMIN
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer, default: 1 } }
 *       - { name: pageSize, in: query, schema: { type: integer, default: 20 } }
 *       - { name: userId, in: query, schema: { type: string } }
 *       - { name: entityType, in: query, schema: { type: string } }
 *     responses:
 *       200: { description: Lista de logs }
 */
activityLogsRoutes.get(
  "/",
  validate(listActivityLogsQuerySchema, "query"),
  activityLogsController.list
);
