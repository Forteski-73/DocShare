import crypto from "node:crypto";
import { prisma } from "../config/prisma";
import { env } from "../config/env";

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function createInviteToken(userId: string) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + env.INVITE_TOKEN_EXPIRES_HOURS * 60 * 60 * 1000);
  return prisma.inviteToken.create({ data: { token, userId, expiresAt } });
}

export async function findValidInviteToken(token: string) {
  const inviteToken = await prisma.inviteToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!inviteToken || inviteToken.usedAt || inviteToken.expiresAt < new Date()) {
    return null;
  }

  return inviteToken;
}

export async function consumeInviteToken(id: string) {
  return prisma.inviteToken.update({ where: { id }, data: { usedAt: new Date() } });
}

export async function createPasswordResetToken(userId: string) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + env.RESET_TOKEN_EXPIRES_HOURS * 60 * 60 * 1000);
  return prisma.passwordResetToken.create({ data: { token, userId, expiresAt } });
}

export async function findValidPasswordResetToken(token: string) {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return null;
  }

  return resetToken;
}

export async function consumePasswordResetToken(id: string) {
  return prisma.passwordResetToken.update({ where: { id }, data: { usedAt: new Date() } });
}
