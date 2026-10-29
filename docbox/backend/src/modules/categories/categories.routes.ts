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

/**
 * @openapi
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: Lista categorias de um produto (label)
 *     parameters:
 *       - { name: labelId, in: query, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Lista de categorias }
 *   post:
 *     tags: [Categories]
 *     summary: Cria uma categoria — ADMIN/EDITOR/APPROVER
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [labelId, name]
 *             properties:
 *               labelId: { type: string }
 *               name: { type: string }
 *               description: { type: string }
 *     responses:
 *       201: { description: Categoria criada }
 */
categoriesRoutes.get(
  "/",
  validate(listCategoriesQuerySchema, "query"),
  categoriesController.list
);

/**
 * @openapi
 * /categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Detalhe de uma categoria
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Categoria }
 *   patch:
 *     tags: [Categories]
 *     summary: Atualiza uma categoria — ADMIN/EDITOR/APPROVER
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *     responses:
 *       200: { description: Categoria atualizada }
 *   delete:
 *     tags: [Categories]
 *     summary: Remove uma categoria — ADMIN/EDITOR/APPROVER
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Categoria removida }
 */
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
