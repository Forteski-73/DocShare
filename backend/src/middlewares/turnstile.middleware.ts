import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { verifyTurnstileToken } from "../services/turnstile.service";

export async function verifyTurnstile(req: Request, _res: Response, next: NextFunction) {
  const valid = await verifyTurnstileToken(req.body.turnstileToken, req.ip);

  if (!valid) {
    next(ApiError.badRequest("Verificacao de seguranca falhou. Recarregue a pagina e tente novamente."));
    return;
  }

  next();
}
