import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../utils/apiError";
import * as settingsService from "./settings.service";

export async function get(_req: Request, res: Response) {
  const settings = await settingsService.get();
  res.json({ settings });
}

export async function uploadLogo(req: Request, res: Response) {
  if (!req.file) {
    throw ApiError.badRequest("Nenhuma imagem enviada");
  }
  const settings = await settingsService.uploadLogo(req.file, req.user!.id);
  res.json({ settings });
}

export async function removeLogo(req: Request, res: Response) {
  const settings = await settingsService.removeLogo(req.user!.id);
  res.json({ settings });
}

export async function updateHeaderColor(req: Request, res: Response) {
  const settings = await settingsService.updateHeaderColor(req.body.headerColor, req.user!.id);
  res.json({ settings });
}

export async function getLogo(_req: Request, res: Response, next: NextFunction) {
  const { absolutePath, mimeType } = await settingsService.getLogoForDownload();

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
