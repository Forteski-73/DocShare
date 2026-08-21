import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/apiError";
import * as tokenService from "../../services/token.service";
import * as emailService from "../../services/email.service";
import { logActivity } from "../../services/activityLog.service";
import type { Role, UserStatus } from "@prisma/client";

const PUBLIC_USER_FIELDS = {
  id: true,
  badgeNumber: true,
  email: true,
  role: true,
  status: true,
  avatarPath: true,
  createdAt: true,
  updatedAt: true,
} as const;

type ListUsersInput = {
  page: number;
  pageSize: number;
  role?: Role;
  status?: UserStatus;
};

export async function list({ page, pageSize, role, status }: ListUsersInput) {
  const where = {
    ...(role ? { role } : {}),
    ...(status ? { status } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: PUBLIC_USER_FIELDS,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return { data, total, page, pageSize };
}

export async function getById(id: string) {
  const user = await prisma.user.findUnique({ where: { id }, select: PUBLIC_USER_FIELDS });
  if (!user) {
    throw ApiError.notFound("Usuario nao encontrado");
  }
  return user;
}

export async function create(
  input: { badgeNumber: string; email: string; role: Role },
  createdByUserId: string
) {
  const user = await prisma.user.create({
    data: {
      badgeNumber: input.badgeNumber,
      email: input.email,
      role: input.role,
      status: "PENDING",
    },
  });

  const inviteToken = await tokenService.createInviteToken(user.id);
  await emailService.sendInviteEmail(user.email, inviteToken.token);

  await logActivity({
    userId: createdByUserId,
    action: "CREATE_USER",
    entityType: "User",
    entityId: user.id,
  });

  return getById(user.id);
}

export async function update(
  id: string,
  data: Partial<{ badgeNumber: string; email: string; role: Role; status: UserStatus }>,
  actingUserId: string
) {
  await getById(id);

  const user = await prisma.user.update({ where: { id }, data, select: PUBLIC_USER_FIELDS });

  await logActivity({
    userId: actingUserId,
    action: "UPDATE_USER",
    entityType: "User",
    entityId: id,
    metadata: data,
  });

  return user;
}

export async function deactivate(id: string, actingUserId: string) {
  if (id === actingUserId) {
    throw ApiError.badRequest("Voce nao pode desativar sua propria conta");
  }

  await getById(id);

  const user = await prisma.user.update({
    where: { id },
    data: { status: "INACTIVE" },
    select: PUBLIC_USER_FIELDS,
  });

  await logActivity({
    userId: actingUserId,
    action: "DEACTIVATE_USER",
    entityType: "User",
    entityId: id,
  });

  return user;
}

export async function resendInvite(id: string, actingUserId: string) {
  const user = await getById(id);

  if (user.status !== "PENDING") {
    throw ApiError.badRequest("Usuario ja esta ativo");
  }

  const inviteToken = await tokenService.createInviteToken(user.id);
  await emailService.sendInviteEmail(user.email, inviteToken.token);

  await logActivity({
    userId: actingUserId,
    action: "RESEND_INVITE",
    entityType: "User",
    entityId: id,
  });
}
