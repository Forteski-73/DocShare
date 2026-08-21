import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as categoriesController from "./categories.controller";
import {
  createCategorySchema,
  updateCategorySchema,
  listCategoriesQuerySchema,
  categoryIdParamSchema,
} from "./categories.schemas";

export const categoriesRoutes = Router();

categoriesRoutes.use(authMiddleware);

categoriesRoutes.get(
  "/",
  validate(listCategoriesQuerySchema, "query"),
  categoriesController.list
);
categoriesRoutes.get(
  "/:id",
  validate(categoryIdParamSchema, "params"),
  categoriesController.getById
);

categoriesRoutes.post(
  "/",
  requireRole("ADMIN", "EDITOR", "APPROVER"),
  validate(createCategorySchema),
  categoriesController.create
);

categoriesRoutes.patch(
  "/:id",
  requireRole("ADMIN", "EDITOR", "APPROVER"),
  validate(categoryIdParamSchema, "params"),
  validate(updateCategorySchema),
  categoriesController.update
);

categoriesRoutes.delete(
  "/:id",
  requireRole("ADMIN", "EDITOR", "APPROVER"),
  validate(categoryIdParamSchema, "params"),
  categoriesController.remove
);
