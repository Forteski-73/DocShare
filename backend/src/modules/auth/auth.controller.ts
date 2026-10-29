import type { NextFunction, Request, Response } from "express";
import { env } from "../../config/env";
import { parseDurationToMs } from "../../utils/duration";
import { ApiError } from "../../utils/apiError";
import * as authService from "./auth.service";

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: env.NODE_ENV === "production",
    maxAge: parseDurationToMs(env.JWT_EXPIRES_IN),
  };
}

export async function login(req: Request, res: Response) {
  const { identifier, password } = req.body;
  const { token, user } = await authService.login(identifier, password);

  res.cookie(env.COOKIE_NAME, token, cookieOptions());
  res.json({
    user: {
      id: user.id,
      badgeNumber: user.badgeNumber,
      email: user.email,
      role: user.role,
      status: user.status,
      avatarPath: user.avatarPath,
    },
  });
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie(env.COOKIE_NAME);
  res.status(204).send();
}

export async function activateAccount(req: Request, res: Response) {
  const { token, password } = req.body;
  await authService.activateAccount(token, password);
  res.status(204).send();
}

export async function forgotPassword(req: Request, res: Response) {
  const { identifier } = req.body;
  await authService.forgotPassword(identifier);
  res.json({ message: "Se o cadastro existir, um e-mail de redefinicao sera enviado." });
}

export async function resetPassword(req: Request, res: Response) {
  const { token, password } = req.body;
  await authService.resetPassword(token, password);
  res.status(204).send();
}

export async function me(req: Request, res: Response) {
  res.json({ user: req.user });
}

export async function uploadAvatar(req: Request, res: Response) {
  if (!req.file) {
    throw ApiError.badRequest("Nenhuma imagem enviada");
  }
  const user = await authService.uploadAvatar(req.user!.id, req.file);
  res.json({ avatarPath: user.avatarPath });
}

export async function removeAvatar(req: Request, res: Response) {
  const user = await authService.removeAvatar(req.user!.id);
  res.json({ avatarPath: user.avatarPath });
}

export async function getAvatar(req: Request, res: Response, next: NextFunction) {
  const { absolutePath, mimeType } = await authService.getAvatarForDownload(req.user!.id);

  res.setHeader("Content-Type", mimeType);
  res.setHeader("Cache-Control", "private, max-age=300");
  res.sendFile(absolutePath, (err) => {
    if (!err) return;
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      next(ApiError.notFound("Imagem nao encontrada no servidor"));
      return;
    }
    next(err);
  });
}
