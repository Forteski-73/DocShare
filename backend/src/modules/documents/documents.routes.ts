import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { upload } from "../../config/multer";
import * as documentsController from "./documents.controller";
import {
  listDocumentsQuerySchema,
  documentIdParamSchema,
  uploadDocumentBodySchema,
  notifyDocumentSchema,
} from "./documents.schemas";

export const documentsRoutes = Router();

documentsRoutes.use(authMiddleware);

/**
 * @openapi
 * /documents:
 *   get:
 *     tags: [Documents]
 *     summary: Lista documentos (paginado, com busca)
 *     parameters:
 *       - { name: categoryId, in: query, schema: { type: string } }
 *       - { name: search, in: query, schema: { type: string } }
 *       - { name: page, in: query, schema: { type: integer, default: 1 } }
 *       - { name: pageSize, in: query, schema: { type: integer, default: 20 } }
 *     responses:
 *       200: { description: Lista de documentos }
 *   post:
 *     tags: [Documents]
 *     summary: Envia um novo documento — ADMIN/EDITOR/APPROVER
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file, categoryId]
 *             properties:
 *               file: { type: string, format: binary }
 *               categoryId: { type: string }
 *               notify: { type: string, enum: ["true", "false"] }
 *     responses:
 *       201: { description: Documento criado }
 */
documentsRoutes.get("/", validate(listDocumentsQuerySchema, "query"), documentsController.list);

/**
 * @openapi
 * /documents/{id}:
 *   get:
 *     tags: [Documents]
 *     summary: Detalhe de um documento
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Documento }
 *   delete:
 *     tags: [Documents]
 *     summary: Remove um documento — ADMIN/EDITOR/APPROVER
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Documento removido }
 */
documentsRoutes.get(
  "/:id",
  validate(documentIdParamSchema, "params"),
  documentsController.getById
);

/**
 * @openapi
 * /documents/{id}/download:
 *   get:
 *     tags: [Documents]
 *     summary: Baixa o arquivo do documento
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Arquivo binario }
 */
documentsRoutes.get(
  "/:id/download",
  validate(documentIdParamSchema, "params"),
  documentsController.download
);

documentsRoutes.post(
  "/",
  requireRole("ADMIN", "EDITOR", "APPROVER"),
  upload.single("file"),
  validate(uploadDocumentBodySchema),
  documentsController.create
);

/**
 * @openapi
 * /documents/{id}/notify:
 *   post:
 *     tags: [Documents]
 *     summary: Notifica usuarios por e-mail sobre o documento — ADMIN/EDITOR/APPROVER
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [toAll]
 *             properties:
 *               toAll: { type: boolean }
 *               userIds: { type: array, items: { type: string } }
 *     responses:
 *       200: { description: Notificacoes enfileiradas }
 */
documentsRoutes.post(
  "/:id/notify",
  requireRole("ADMIN", "EDITOR", "APPROVER"),
  validate(documentIdParamSchema, "params"),
  validate(notifyDocumentSchema),
  documentsController.notify
);

documentsRoutes.delete(
  "/:id",
  requireRole("ADMIN", "EDITOR", "APPROVER"),
  validate(documentIdParamSchema, "params"),
  documentsController.remove
);
