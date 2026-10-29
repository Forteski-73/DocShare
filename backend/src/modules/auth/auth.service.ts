import fs from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { AVATARS_ROOT } from "../../config/multer";
import { ApiError } from "../../utils/apiError";
import * as tokenService from "../../services/token.service";
import * as emailService from "../../services/email.service";

const SALT_ROUNDS = 10;

export function signToken(userId: string) {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export async function login(identifier: string, password: string) {
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identifier }, { badgeNumber: identifier }] },
  });

  if (!user) {
    throw ApiError.unauthorized("Credenciais invalidas");
  }

  if (user.status === "PENDING") {
    throw ApiError.unauthorized("Conta pendente de ativacao. Verifique seu e-mail de convite.");
  }

  if (user.status === "INACTIVE") {
    throw ApiError.unauthorized("Conta inativa. Entre em contato com o administrador.");
  }

  if (!user.passwordHash) {
    throw ApiError.unauthorized("Credenciais invalidas");
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw ApiError.unauthorized("Credenciais invalidas");
  }

  const token = signToken(user.id);
  return { token, user };
}

export async function activateAccount(token: string, password: string) {
  const inviteToken = await tokenService.findValidInviteToken(token);
  if (!inviteToken) {
    throw ApiError.badRequest("Token de convite invalido ou expirado");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.update({
    where: { id: inviteToken.userId },
    data: { passwordHash, status: "ACTIVE" },
  });

  await tokenService.consumeInviteToken(inviteToken.id);
  await emailService.sendAccountActivatedEmail(user.email);

  return user;
}

export async function forgotPassword(identifier: string) {
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identifier }, { badgeNumber: identifier }] },
  });

  if (!user || user.status !== "ACTIVE") {
    // Nao revela se o usuario existe ou nao - o controller sempre responde com sucesso genérico.
    return;
  }

  const resetToken = await tokenService.createPasswordResetToken(user.id);
  await emailService.sendPasswordResetEmail(user.email, resetToken.token);
}

export async function resetPassword(token: string, password: string) {
  const resetToken = await tokenService.findValidPasswordResetToken(token);
  if (!resetToken) {
    throw ApiError.badRequest("Token de redefinicao invalido ou expirado");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { passwordHash },
  });

  await tokenService.consumePasswordResetToken(resetToken.id);
}

async function deleteAvatarFile(avatarPath: string | null) {
  if (!avatarPath) return;
  try {
    await fs.unlink(path.join(AVATARS_ROOT, avatarPath));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      throw err;
    }
  }
}

export async function uploadAvatar(userId: string, file: Express.Multer.File) {
  const current = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  await deleteAvatarFile(current.avatarPath);

  return prisma.user.update({
    where: { id: userId },
    data: { avatarPath: file.filename, avatarMimeType: file.mimetype },
  });
}

export async function removeAvatar(userId: string) {
  const current = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  await deleteAvatarFile(current.avatarPath);

  return prisma.user.update({
    where: { id: userId },
    data: { avatarPath: null, avatarMimeType: null },
  });
}

export async function getAvatarForDownload(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  if (!user.avatarPath || !user.avatarMimeType) {
    throw ApiError.notFound("Usuario nao possui foto de perfil");
  }

  return {
    absolutePath: path.join(AVATARS_ROOT, user.avatarPath),
    mimeType: user.avatarMimeType,
  };
}
