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

labelsRoutes.get("/", validate(listLabelsQuerySchema, "query"), labelsController.list);
labelsRoutes.get("/:id", validate(labelIdParamSchema, "params"), labelsController.getById);
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
