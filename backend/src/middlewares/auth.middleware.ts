import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";

type JwtPayload = {
  sub: string;
};

export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[env.COOKIE_NAME];
    if (!token) {
      throw ApiError.unauthorized();
    }

    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.status !== "ACTIVE") {
      throw ApiError.unauthorized();
    }

    req.user = {
      id: user.id,
      badgeNumber: user.badgeNumber,
      email: user.email,
      role: user.role,
      status: user.status,
      avatarPath: user.avatarPath,
    };

    next();
  } catch {
    next(ApiError.unauthorized());
  }
}
