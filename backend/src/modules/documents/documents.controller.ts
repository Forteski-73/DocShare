import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";
import { ApiError } from "../../utils/apiError";
import * as documentsService from "./documents.service";
import type { listDocumentsQuerySchema } from "./documents.schemas";

function paramId(req: Request): string {
  return req.params.id as string;
}

function buildContentDisposition(type: "inline" | "attachment", filename: string) {
  const encoded = encodeURIComponent(filename);
  return `${type}; filename="${filename}"; filename*=UTF-8''${encoded}`;
}

export async function list(req: Request, res: Response) {
  const query = req.query as unknown as z.infer<typeof listDocumentsQuerySchema>;

  if (!query.categoryId && req.user!.role !== "ADMIN") {
    throw ApiError.forbidden();
  }

  const result = await documentsService.list(query);
  res.json(result);
}

export async function getById(req: Request, res: Response) {
  const document = await documentsService.getById(paramId(req));
  res.json({ document });
}

export async function download(req: Request, res: Response, next: NextFunction) {
  const { document, absolutePath } = await documentsService.getFileForDownload(paramId(req));
  const inline = req.query.inline === "true";

  res.setHeader(
    "Content-Disposition",
    buildContentDisposition(inline ? "inline" : "attachment", document.originalName)
  );
  res.setHeader("Content-Type", document.mimeType);

  res.sendFile(absolutePath, (err) => {
    if (!err) return;
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      next(ApiError.notFound("Arquivo nao encontrado no servidor"));
      return;
    }
    next(err);
  });
}

export async function create(req: Request, res: Response) {
  if (!req.file) {
    throw ApiError.badRequest("Nenhum arquivo enviado");
  }

  const { categoryId, notify } = req.body;
  const document = await documentsService.create(
    { categoryId, file: req.file, notify },
    req.user!.id
  );
  res.status(201).json({ document });
}

export async function notify(req: Request, res: Response) {
  const result = await documentsService.notify(paramId(req), req.body, req.user!.id);
  res.json(result);
}

export async function remove(req: Request, res: Response) {
  await documentsService.remove(paramId(req), req.user!.id);
  res.status(204).send();
}
