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

authRoutes.post(
  "/login",
  authRateLimit,
  validate(loginSchema),
  verifyTurnstile,
  authController.login
);
authRoutes.post("/logout", authController.logout);
authRoutes.post(
  "/activate-account",
  authRateLimit,
  validate(activateAccountSchema),
  authController.activateAccount
);
authRoutes.post(
  "/forgot-password",
  authRateLimit,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);
authRoutes.post(
  "/reset-password",
  authRateLimit,
  validate(resetPasswordSchema),
  authController.resetPassword
);
authRoutes.get("/me", authMiddleware, authController.me);
authRoutes.get("/me/avatar", authMiddleware, authController.getAvatar);
authRoutes.post(
  "/me/avatar",
  authMiddleware,
  uploadAvatarImage.single("avatar"),
  authController.uploadAvatar
);
authRoutes.delete("/me/avatar", authMiddleware, authController.removeAvatar);
