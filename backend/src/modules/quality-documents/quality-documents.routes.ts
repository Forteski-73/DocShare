import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { upload } from "../../config/multer";
import * as qualityDocumentsController from "./quality-documents.controller";
import {
  listQualityDocumentsQuerySchema,
  qualityDocumentIdParamSchema,
  uploadQualityDocumentBodySchema,
  resubmitQualityDocumentBodySchema,
  toggleQualityDocumentActiveSchema,
  decisionSchema,
} from "./quality-documents.schemas";

export const qualityDocumentsRoutes = Router();

qualityDocumentsRoutes.use(authMiddleware);

/**
 * @openapi
 * /quality-documents:
 *   get:
 *     tags: [QualityDocuments]
 *     summary: Lista documentos de qualidade (formularios/procedimentos)
 *     parameters:
 *       - { name: type, in: query, required: true, schema: { type: string, enum: [FORMULARIO, PROCEDIMENTO_INTERNO] } }
 *       - { name: active, in: query, schema: { type: string, enum: ["true", "false"] } }
 *     responses:
 *       200: { description: Lista de documentos de qualidade }
 *   post:
 *     tags: [QualityDocuments]
 *     summary: Envia um novo documento de qualidade para aprovacao — ADMIN/EDITOR/APPROVER
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file, type, title, approverId]
 *             properties:
 *               file: { type: string, format: binary }
 *               type: { type: string, enum: [FORMULARIO, PROCEDIMENTO_INTERNO] }
 *               title: { type: string }
 *               approverId: { type: string }
 *               requesterNote: { type: string }
 *     responses:
 *       201: { description: Documento criado, pendente de aprovacao }
 */
qualityDocumentsRoutes.get(
  "/",
  validate(listQualityDocumentsQuerySchema, "query"),
  qualityDocumentsController.list
);

/**
 * @openapi
 * /quality-documents/pending-approvals:
 *   get:
 *     tags: [QualityDocuments]
 *     summary: Lista documentos pendentes de aprovacao do usuario logado — ADMIN/APPROVER
 *     responses:
 *       200: { description: Lista de pendencias de aprovacao }
 */
qualityDocumentsRoutes.get(
  "/pending-approvals",
  requireRole("ADMIN", "APPROVER"),
  qualityDocumentsController.listPendingForApprover
);

/**
 * @openapi
 * /quality-documents/approvers:
 *   get:
 *     tags: [QualityDocuments]
 *     summary: Lista usuarios que podem aprovar documentos de qualidade
 *     responses:
 *       200: { description: Lista de aprovadores }
 */
qualityDocumentsRoutes.get(
  "/approvers",
  requireRole("ADMIN", "EDITOR", "APPROVER"),
  qualityDocumentsController.listApprovers
);

/**
 * @openapi
 * /quality-documents/{id}:
 *   get:
 *     tags: [QualityDocuments]
 *     summary: Detalhe de um documento de qualidade
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Documento de qualidade }
 *   delete:
 *     tags: [QualityDocuments]
 *     summary: Remove um documento de qualidade — ADMIN/EDITOR/APPROVER
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Documento removido }
 */
qualityDocumentsRoutes.get(
  "/:id",
  validate(qualityDocumentIdParamSchema, "params"),
  qualityDocumentsController.getById
);

/**
 * @openapi
 * /quality-documents/{id}/history:
 *   get:
 *     tags: [QualityDocuments]
 *     summary: Historico de decisoes/versoes de um documento de qualidade
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Historico }
 */
qualityDocumentsRoutes.get(
  "/:id/history",
  validate(qualityDocumentIdParamSchema, "params"),
  qualityDocumentsController.getHistory
);

/**
 * @openapi
 * /quality-documents/{id}/download:
 *   get:
 *     tags: [QualityDocuments]
 *     summary: Baixa o arquivo do documento de qualidade
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Arquivo binario }
 */
qualityDocumentsRoutes.get(
  "/:id/download",
  validate(qualityDocumentIdParamSchema, "params"),
  qualityDocumentsController.download
);

qualityDocumentsRoutes.post(
  "/",
  requireRole("ADMIN", "EDITOR", "APPROVER"),
  upload.single("file"),
  validate(uploadQualityDocumentBodySchema),
  qualityDocumentsController.create
);

/**
 * @openapi
 * /quality-documents/{id}/resubmit:
 *   post:
 *     tags: [QualityDocuments]
 *     summary: Reenvia um documento reprovado para nova aprovacao — ADMIN/EDITOR/APPROVER
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file, approverId]
 *             properties:
 *               file: { type: string, format: binary }
 *               approverId: { type: string }
 *               requesterNote: { type: string }
 *     responses:
 *       200: { description: Documento reenviado para aprovacao }
 */
qualityDocumentsRoutes.post(
  "/:id/resubmit",
  requireRole("ADMIN", "EDITOR", "APPROVER"),
  validate(qualityDocumentIdParamSchema, "params"),
  upload.single("file"),
  validate(resubmitQualityDocumentBodySchema),
  qualityDocumentsController.resubmit
);

/**
 * @openapi
 * /quality-documents/{id}/decision:
 *   post:
 *     tags: [QualityDocuments]
 *     summary: Aprova ou reprova um documento de qualidade — ADMIN/APPROVER
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [decision]
 *             properties:
 *               decision: { type: string, enum: [APROVAR, REPROVAR] }
 *               approverNote: { type: string, description: "Obrigatorio ao reprovar" }
 *     responses:
 *       200: { description: Decisao registrada }
 */
qualityDocumentsRoutes.post(
  "/:id/decision",
  requireRole("ADMIN", "APPROVER"),
  validate(qualityDocumentIdParamSchema, "params"),
  validate(decisionSchema),
  qualityDocumentsController.decide
);

/**
 * @openapi
 * /quality-documents/{id}/active:
 *   patch:
 *     tags: [QualityDocuments]
 *     summary: Ativa/inativa um documento de qualidade — ADMIN/EDITOR/APPROVER
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [active]
 *             properties:
 *               active: { type: boolean }
 *     responses:
 *       200: { description: Estado atualizado }
 */
qualityDocumentsRoutes.patch(
  "/:id/active",
  requireRole("ADMIN", "EDITOR", "APPROVER"),
  validate(qualityDocumentIdParamSchema, "params"),
  validate(toggleQualityDocumentActiveSchema),
  qualityDocumentsController.toggleActive
);

qualityDocumentsRoutes.delete(
  "/:id",
  requireRole("ADMIN", "EDITOR", "APPROVER"),
  validate(qualityDocumentIdParamSchema, "params"),
  qualityDocumentsController.remove
);
