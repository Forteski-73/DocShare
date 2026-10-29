import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { uploadSettingsImage } from "../../config/multer";
import * as settingsController from "./settings.controller";
import { updateHeaderColorSchema } from "./settings.schemas";

export const settingsRoutes = Router();

settingsRoutes.use(authMiddleware);

/**
 * @openapi
 * /settings:
 *   get:
 *     tags: [Settings]
 *     summary: Configuracoes gerais do app (cor do cabecalho, etc.)
 *     responses:
 *       200: { description: Configuracoes atuais }
 */
settingsRoutes.get("/", settingsController.get);

/**
 * @openapi
 * /settings/logo:
 *   get:
 *     tags: [Settings]
 *     summary: Logo atual do app
 *     responses:
 *       200: { description: Imagem do logo }
 *       404: { description: Sem logo }
 *   post:
 *     tags: [Settings]
 *     summary: Envia/atualiza o logo do app — ADMIN
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo: { type: string, format: binary }
 *     responses:
 *       200: { description: Logo atualizado }
 *   delete:
 *     tags: [Settings]
 *     summary: Remove o logo do app — ADMIN
 *     responses:
 *       200: { description: Logo removido }
 */
settingsRoutes.get("/logo", settingsController.getLogo);

settingsRoutes.post(
  "/logo",
  requireRole("ADMIN"),
  uploadSettingsImage.single("logo"),
  settingsController.uploadLogo
);
settingsRoutes.delete("/logo", requireRole("ADMIN"), settingsController.removeLogo);

/**
 * @openapi
 * /settings/header-color:
 *   patch:
 *     tags: [Settings]
 *     summary: Atualiza a cor do cabecalho — ADMIN
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [headerColor]
 *             properties:
 *               headerColor: { type: string, example: "#1a73e8" }
 *     responses:
 *       200: { description: Cor atualizada }
 */
settingsRoutes.patch(
  "/header-color",
  requireRole("ADMIN"),
  validate(updateHeaderColorSchema),
  settingsController.updateHeaderColor
);
