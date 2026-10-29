import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";
import type { listUsersQuerySchema } from "./users.schemas";
import * as usersService from "./users.service";
import * as authService from "../auth/auth.service";
import { ApiError } from "../../utils/apiError";

function paramId(req: Request): string {
  return req.params.id as string;
}

export async function list(req: Request, res: Response) {
  const query = req.query as unknown as z.infer<typeof listUsersQuerySchema>;
  const result = await usersService.list(query);
  res.json(result);
}

export async function getById(req: Request, res: Response) {
  const user = await usersService.getById(paramId(req));
  res.json({ user });
}

export async function create(req: Request, res: Response) {
  const user = await usersService.create(req.body, req.user!.id);
  res.status(201).json({ user });
}

export async function update(req: Request, res: Response) {
  const user = await usersService.update(paramId(req), req.body, req.user!.id);
  res.json({ user });
}

export async function deactivate(req: Request, res: Response) {
  const user = await usersService.deactivate(paramId(req), req.user!.id);
  res.json({ user });
}

export async function resendInvite(req: Request, res: Response) {
  await usersService.resendInvite(paramId(req), req.user!.id);
  res.status(204).send();
}

export async function getAvatar(req: Request, res: Response, next: NextFunction) {
  const { absolutePath, mimeType } = await authService.getAvatarForDownload(paramId(req));

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
