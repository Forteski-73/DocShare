import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { uploadImage } from "../../config/multer";
import * as labelsController from "./labels.controller";
import {
  createLabelSchema,
  updateLabelSchema,
  labelIdParamSchema,
  listLabelsQuerySchema,
} from "./labels.schemas";

export const labelsRoutes = Router();

labelsRoutes.use(authMiddleware);

/**
 * @openapi
 * /labels:
 *   get:
 *     tags: [Labels]
 *     summary: Lista produtos (labels)
 *     parameters:
 *       - { name: type, in: query, schema: { type: string, enum: [PISO_LAMINADO, ACESSORIO, DOCUMENTO] } }
 *     responses:
 *       200: { description: Lista de labels }
 *   post:
 *     tags: [Labels]
 *     summary: Cria um produto (label) — ADMIN
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, type]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               type: { type: string, enum: [PISO_LAMINADO, ACESSORIO, DOCUMENTO] }
 *     responses:
 *       201: { description: Label criada }
 */
labelsRoutes.get("/", validate(listLabelsQuerySchema, "query"), labelsController.list);

/**
 * @openapi
 * /labels/{id}:
 *   get:
 *     tags: [Labels]
 *     summary: Detalhe de um produto (label)
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Label }
 *   patch:
 *     tags: [Labels]
 *     summary: Atualiza um produto (label) — ADMIN
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
 *       200: { description: Label atualizada }
 *   delete:
 *     tags: [Labels]
 *     summary: Remove um produto (label) — ADMIN
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Label removida }
 */
labelsRoutes.get("/:id", validate(labelIdParamSchema, "params"), labelsController.getById);

/**
 * @openapi
 * /labels/{id}/photo:
 *   get:
 *     tags: [Labels]
 *     summary: Foto do produto (label)
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Imagem da label }
 *       404: { description: Sem foto }
 *   post:
 *     tags: [Labels]
 *     summary: Envia/atualiza a foto do produto (label) — ADMIN
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo: { type: string, format: binary }
 *     responses:
 *       200: { description: Foto atualizada }
 *   delete:
 *     tags: [Labels]
 *     summary: Remove a foto do produto (label) — ADMIN
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Foto removida }
 */
labelsRoutes.get(
  "/:id/photo",
  validate(labelIdParamSchema, "params"),
  labelsController.getPhoto
);

labelsRoutes.post("/", requireRole("ADMIN"), validate(createLabelSchema), labelsController.create);
labelsRoutes.patch(
  "/:id",
  requireRole("ADMIN"),
  validate(labelIdParamSchema, "params"),
  validate(updateLabelSchema),
  labelsController.update
);
labelsRoutes.post(
  "/:id/photo",
  requireRole("ADMIN"),
  validate(labelIdParamSchema, "params"),
  uploadImage.single("photo"),
  labelsController.uploadPhoto
);
labelsRoutes.delete(
  "/:id/photo",
  requireRole("ADMIN"),
  validate(labelIdParamSchema, "params"),
  labelsController.removePhoto
);
labelsRoutes.delete(
  "/:id",
  requireRole("ADMIN"),
  validate(labelIdParamSchema, "params"),
  labelsController.remove
);
