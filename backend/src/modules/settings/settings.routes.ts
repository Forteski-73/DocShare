import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { uploadSettingsImage } from "../../config/multer";
import * as settingsController from "./settings.controller";
import { updateHeaderColorSchema } from "./settings.schemas";

export const settingsRoutes = Router();

settingsRoutes.use(authMiddleware);

settingsRoutes.get("/", settingsController.get);
settingsRoutes.get("/logo", settingsController.getLogo);

settingsRoutes.post(
  "/logo",
  requireRole("ADMIN"),
  uploadSettingsImage.single("logo"),
  settingsController.uploadLogo
);
settingsRoutes.delete("/logo", requireRole("ADMIN"), settingsController.removeLogo);

settingsRoutes.patch(
  "/header-color",
  requireRole("ADMIN"),
  validate(updateHeaderColorSchema),
  settingsController.updateHeaderColor
);
