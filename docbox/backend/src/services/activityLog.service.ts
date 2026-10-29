import { prisma } from "../config/prisma";
import type { Prisma } from "@prisma/client";

type LogActivityInput = {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
};

export async function logActivity(input: LogActivityInput) {
  await prisma.activityLog.create({ data: input });
}
