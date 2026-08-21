import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";
import { ApiError } from "../../utils/apiError";
import * as qualityDocumentsService from "./quality-documents.service";
import type { listQualityDocumentsQuerySchema } from "./quality-documents.schemas";

function paramId(req: Request): string {
  return req.params.id as string;
}

function ctx(req: Request) {
  return { userId: req.user!.id, role: req.user!.role };
}

function buildContentDisposition(type: "inline" | "attachment", filename: string) {
  const encoded = encodeURIComponent(filename);
  return `${type}; filename="${filename}"; filename*=UTF-8''${encoded}`;
}

export async function list(req: Request, res: Response) {
  const query = req.query as unknown as z.infer<typeof listQualityDocumentsQuerySchema>;
  const documents = await qualityDocumentsService.list(query, ctx(req));
  res.json({ documents });
}

export async function listApprovers(_req: Request, res: Response) {
  const approvers = await qualityDocumentsService.listApprovers();
  res.json({ approvers });
}

export async function listPendingForApprover(req: Request, res: Response) {
  const documents = await qualityDocumentsService.listPendingForApprover(req.user!.id);
  res.json({ documents });
}

export async function getById(req: Request, res: Response) {
  const document = await qualityDocumentsService.getById(paramId(req), ctx(req));
  res.json({ document });
}

export async function getHistory(req: Request, res: Response) {
  const events = await qualityDocumentsService.getHistory(paramId(req), ctx(req));
  res.json({ events });
}

export async function download(req: Request, res: Response, next: NextFunction) {
  const { document, absolutePath } = await qualityDocumentsService.getFileForDownload(
    paramId(req),
    ctx(req)
  );
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

  const { type, title, approverId, requesterNote } = req.body;
  const document = await qualityDocumentsService.create(
    { type, title, approverId, requesterNote, file: req.file },
    req.user!.id
  );
  res.status(201).json({ document });
}

export async function resubmit(req: Request, res: Response) {
  const { approverId, requesterNote } = req.body;
  const document = await qualityDocumentsService.resubmit(
    paramId(req),
    { approverId, requesterNote, file: req.file },
    req.user!.id
  );
  res.json({ document });
}

export async function decide(req: Request, res: Response) {
  const { decision, approverNote } = req.body;
  const document = await qualityDocumentsService.decide(
    paramId(req),
    { decision, approverNote },
    req.user!.id,
    req.user!.role
  );
  res.json({ document });
}

export async function toggleActive(req: Request, res: Response) {
  const document = await qualityDocumentsService.toggleActive(paramId(req), req.body.active, ctx(req));
  res.json({ document });
}

export async function remove(req: Request, res: Response) {
  await qualityDocumentsService.remove(paramId(req), ctx(req));
  res.status(204).send();
}
