import { prisma } from "../../config/prisma";

type ListActivityLogsInput = {
  page: number;
  pageSize: number;
  userId?: string;
  entityType?: string;
};

export async function list({ page, pageSize, userId, entityType }: ListActivityLogsInput) {
  const where = {
    ...(userId ? { userId } : {}),
    ...(entityType ? { entityType } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      include: { user: { select: { id: true, badgeNumber: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.activityLog.count({ where }),
  ]);

  return { data, total, page, pageSize };
}
