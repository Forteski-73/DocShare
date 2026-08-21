import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { MulterError } from "multer";
import { env } from "../config/env";
import { ApiError } from "../utils/apiError";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  if (err instanceof MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res
        .status(413)
        .json({ message: `Arquivo maior que o limite de ${env.MAX_FILE_SIZE_MB}MB` });
      return;
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      res.status(400).json({ message: err.message || "Tipo de arquivo nao permitido" });
      return;
    }
    res.status(400).json({ message: err.message });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Dados invalidos",
      errors: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({ message: "Ja existe um registro com esses dados" });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({ message: "Recurso nao encontrado" });
      return;
    }
    if (err.code === "P2003") {
      res.status(400).json({ message: "Referencia invalida: um dos IDs informados nao existe" });
      return;
    }
  }

  console.error(err);
  res.status(500).json({ message: "Erro interno do servidor" });
}
