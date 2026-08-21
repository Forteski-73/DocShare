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

documentsRoutes.get("/", validate(listDocumentsQuerySchema, "query"), documentsController.list);
documentsRoutes.get(
  "/:id",
  validate(documentIdParamSchema, "params"),
  documentsController.getById
);
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
