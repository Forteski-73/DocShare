import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { authRateLimit } from "../../middlewares/rateLimit.middleware";
import { verifyTurnstile } from "../../middlewares/turnstile.middleware";
import { uploadAvatarImage } from "../../config/multer";
import * as authController from "./auth.controller";
import {
  loginSchema,
  activateAccountSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.schemas";

export const authRoutes = Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login (email/cracha + senha)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [identifier, password, turnstileToken]
 *             properties:
 *               identifier: { type: string, description: "E-mail ou cracha" }
 *               password: { type: string }
 *               turnstileToken: { type: string }
 *     responses:
 *       200: { description: Login ok, cookie JWT setado }
 *       401: { description: Credenciais invalidas }
 */
authRoutes.post(
  "/login",
  authRateLimit,
  validate(loginSchema),
  verifyTurnstile,
  authController.login
);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout (limpa o cookie de sessao)
 *     security: []
 *     responses:
 *       200: { description: Logout ok }
 */
authRoutes.post("/logout", authController.logout);

/**
 * @openapi
 * /auth/activate-account:
 *   post:
 *     tags: [Auth]
 *     summary: Ativa a conta a partir do token enviado por e-mail e define a senha
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token: { type: string }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       200: { description: Conta ativada }
 */
authRoutes.post(
  "/activate-account",
  authRateLimit,
  validate(activateAccountSchema),
  authController.activateAccount
);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Solicita e-mail de redefinicao de senha
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [identifier]
 *             properties:
 *               identifier: { type: string, description: "E-mail ou cracha" }
 *     responses:
 *       200: { description: E-mail enviado (se o usuario existir) }
 */
authRoutes.post(
  "/forgot-password",
  authRateLimit,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Redefine a senha a partir do token enviado por e-mail
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token: { type: string }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       200: { description: Senha redefinida }
 */
authRoutes.post(
  "/reset-password",
  authRateLimit,
  validate(resetPasswordSchema),
  authController.resetPassword
);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Dados do usuario autenticado
 *     responses:
 *       200: { description: Usuario atual }
 *       401: { description: Nao autenticado }
 */
authRoutes.get("/me", authMiddleware, authController.me);

/**
 * @openapi
 * /auth/me/avatar:
 *   get:
 *     tags: [Auth]
 *     summary: Avatar do usuario autenticado
 *     responses:
 *       200: { description: Imagem do avatar }
 *       404: { description: Sem avatar }
 *   post:
 *     tags: [Auth]
 *     summary: Envia/atualiza o avatar do usuario autenticado
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar: { type: string, format: binary }
 *     responses:
 *       200: { description: Avatar atualizado }
 *   delete:
 *     tags: [Auth]
 *     summary: Remove o avatar do usuario autenticado
 *     responses:
 *       200: { description: Avatar removido }
 */
authRoutes.get("/me/avatar", authMiddleware, authController.getAvatar);
authRoutes.post(
  "/me/avatar",
  authMiddleware,
  uploadAvatarImage.single("avatar"),
  authController.uploadAvatar
);
authRoutes.delete("/me/avatar", authMiddleware, authController.removeAvatar);
