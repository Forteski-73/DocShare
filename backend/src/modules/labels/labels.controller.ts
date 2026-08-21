import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";
import { ApiError } from "../../utils/apiError";
import * as labelsService from "./labels.service";
import type { listLabelsQuerySchema } from "./labels.schemas";

function paramId(req: Request): string {
  return req.params.id as string;
}

export async function list(req: Request, res: Response) {
  const query = req.query as unknown as z.infer<typeof listLabelsQuerySchema>;
  const labels = await labelsService.list({ type: query.type });
  res.json({ labels });
}

export async function getById(req: Request, res: Response) {
  const label = await labelsService.getById(paramId(req));
  res.json({ label });
}

export async function create(req: Request, res: Response) {
  const label = await labelsService.create(req.body, req.user!.id);
  res.status(201).json({ label });
}

export async function update(req: Request, res: Response) {
  const label = await labelsService.update(paramId(req), req.body, req.user!.id);
  res.json({ label });
}

export async function remove(req: Request, res: Response) {
  await labelsService.remove(paramId(req), req.user!.id);
  res.status(204).send();
}

export async function uploadPhoto(req: Request, res: Response) {
  if (!req.file) {
    throw ApiError.badRequest("Nenhuma imagem enviada");
  }
  const label = await labelsService.uploadPhoto(paramId(req), req.file, req.user!.id);
  res.json({ label });
}

export async function removePhoto(req: Request, res: Response) {
  const label = await labelsService.removePhoto(paramId(req), req.user!.id);
  res.json({ label });
}

export async function getPhoto(req: Request, res: Response, next: NextFunction) {
  const { absolutePath, mimeType } = await labelsService.getPhotoForDownload(paramId(req));

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
