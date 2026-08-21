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

qualityDocumentsRoutes.get(
  "/",
  validate(listQualityDocumentsQuerySchema, "query"),
  qualityDocumentsController.list
);
qualityDocumentsRoutes.get(
  "/pending-approvals",
  requireRole("ADMIN", "APPROVER"),
  qualityDocumentsController.listPendingForApprover
);
qualityDocumentsRoutes.get(
  "/approvers",
  requireRole("ADMIN", "EDITOR", "APPROVER"),
  qualityDocumentsController.listApprovers
);
qualityDocumentsRoutes.get(
  "/:id",
  validate(qualityDocumentIdParamSchema, "params"),
  qualityDocumentsController.getById
);
qualityDocumentsRoutes.get(
  "/:id/history",
  validate(qualityDocumentIdParamSchema, "params"),
  qualityDocumentsController.getHistory
);
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

qualityDocumentsRoutes.post(
  "/:id/resubmit",
  requireRole("ADMIN", "EDITOR", "APPROVER"),
  validate(qualityDocumentIdParamSchema, "params"),
  upload.single("file"),
  validate(resubmitQualityDocumentBodySchema),
  qualityDocumentsController.resubmit
);

qualityDocumentsRoutes.post(
  "/:id/decision",
  requireRole("ADMIN", "APPROVER"),
  validate(qualityDocumentIdParamSchema, "params"),
  validate(decisionSchema),
  qualityDocumentsController.decide
);

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
