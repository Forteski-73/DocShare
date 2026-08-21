import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../config/prisma";

const MAX_ATTEMPTS = 5;
const BASE_BACKOFF_MS = 30_000;
const MAX_BACKOFF_MS = 30 * 60_000;

export const EMAIL_JOB_TYPE = {
  APPROVAL_REQUEST: "APPROVAL_REQUEST",
  APPROVAL_DECISION: "APPROVAL_DECISION",
} as const;

type EmailJobType = (typeof EMAIL_JOB_TYPE)[keyof typeof EMAIL_JOB_TYPE];

export async function enqueue(
  tx: Prisma.TransactionClient | PrismaClient,
  input: { type: EmailJobType; payload: Prisma.InputJsonValue }
) {
  await tx.emailJob.create({
    data: { type: input.type, payload: input.payload },
  });
}

export async function claimDueJobs(limit: number) {
  const jobs = await prisma.emailJob.findMany({
    where: { status: "PENDING", nextAttemptAt: { lte: new Date() } },
    orderBy: { nextAttemptAt: "asc" },
    take: limit,
  });
  return jobs;
}

export async function markSent(id: string) {
  await prisma.emailJob.update({ where: { id }, data: { status: "SENT" } });
}

export async function markFailed(id: string, attempts: number, error: string) {
  const nextAttempts = attempts + 1;

  if (nextAttempts >= MAX_ATTEMPTS) {
    await prisma.emailJob.update({
      where: { id },
      data: { status: "DEAD", attempts: nextAttempts, lastError: error },
    });
    return;
  }

  const backoffMs = Math.min(BASE_BACKOFF_MS * 2 ** attempts, MAX_BACKOFF_MS);
  await prisma.emailJob.update({
    where: { id },
    data: {
      attempts: nextAttempts,
      lastError: error,
      nextAttemptAt: new Date(Date.now() + backoffMs),
    },
  });
}
