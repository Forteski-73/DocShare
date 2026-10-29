import path from "node:path";
import type { ApprovalStatus, QualityDocumentType, Role } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { UPLOAD_ROOT } from "../../config/multer";
import { ApiError } from "../../utils/apiError";
import { sanitizeFilename } from "../../utils/sanitizeFilename";
import { logActivity } from "../../services/activityLog.service";
import { deleteDocumentFiles } from "../documents/documents.service";
import { enqueue, EMAIL_JOB_TYPE } from "../../services/emailJob.service";

const QUALITY_DOCUMENT_INCLUDE = {
  uploadedBy: { select: { id: true, badgeNumber: true, email: true } },
} as const;

const TYPE_LABELS: Record<QualityDocumentType, string> = {
  FORMULARIO: "Formularios",
  PROCEDIMENTO_INTERNO: "Procedimentos Internos",
};

type VisibilityContext = { userId: string; role: Role };

function visibilityWhere(ctx: VisibilityContext) {
  if (ctx.role === "ADMIN") return {};
  return {
    OR: [
      { approvalStatus: "APROVADO" as const },
      { currentRequesterId: ctx.userId },
      { currentApproverId: ctx.userId },
    ],
  };
}

function isVisible(
  document: {
    approvalStatus: ApprovalStatus;
    active: boolean;
    currentRequesterId: string | null;
    currentApproverId: string | null;
  },
  ctx: VisibilityContext
) {
  if (ctx.role === "ADMIN") return true;
  if (ctx.role === "READER") return document.approvalStatus === "APROVADO" && document.active;
  if (document.approvalStatus === "APROVADO") return true;
  return document.currentRequesterId === ctx.userId || document.currentApproverId === ctx.userId;
}

function approvalLink(documentId: string) {
  return `${env.FRONTEND_URL}/qualidade/aprovacoes/${documentId}`;
}

async function getApproverOrThrow(approverId: string) {
  const approver = await prisma.user.findUnique({ where: { id: approverId } });
  if (!approver || (approver.role !== "APPROVER" && approver.role !== "ADMIN")) {
    throw ApiError.badRequest("Aprovador invalido");
  }
  return approver;
}

async function getRawById(id: string) {
  const document = await prisma.qualityDocument.findUnique({
    where: { id },
    include: QUALITY_DOCUMENT_INCLUDE,
  });

  if (!document) {
    throw ApiError.notFound("Documento nao encontrado");
  }

  return document;
}

export async function list(
  filters: { type: QualityDocumentType; active?: boolean },
  ctx: VisibilityContext
) {
  if (ctx.role === "READER") {
    return prisma.qualityDocument.findMany({
      where: { type: filters.type, active: true, approvalStatus: "APROVADO" },
      include: QUALITY_DOCUMENT_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
  }

  return prisma.qualityDocument.findMany({
    where: {
      type: filters.type,
      ...(filters.active === undefined ? {} : { active: filters.active }),
      ...visibilityWhere(ctx),
    },
    include: QUALITY_DOCUMENT_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
}

export async function listApprovers() {
  return prisma.user.findMany({
    where: { role: { in: ["APPROVER", "ADMIN"] }, status: "ACTIVE" },
    select: { id: true, badgeNumber: true, role: true },
    orderBy: { badgeNumber: "asc" },
  });
}

export async function listPendingForApprover(userId: string) {
  return prisma.qualityDocument.findMany({
    where: { approvalStatus: "PENDENTE_APROVACAO", currentApproverId: userId },
    include: QUALITY_DOCUMENT_INCLUDE,
    orderBy: { createdAt: "asc" },
  });
}

export async function getById(id: string, ctx: VisibilityContext) {
  const document = await getRawById(id);

  if (!isVisible(document, ctx)) {
    throw ApiError.notFound("Documento nao encontrado");
  }

  return document;
}

export async function getFileForDownload(id: string, ctx: VisibilityContext) {
  const document = await getById(id, ctx);
  return {
    document,
    absolutePath: path.join(UPLOAD_ROOT, document.filePath),
  };
}

export async function getHistory(id: string, ctx: VisibilityContext) {
  const document = await getRawById(id);

  const flows = await prisma.documentApprovalFlow.findMany({
    where: { qualityDocumentId: id },
    select: { approverId: true },
  });
  const everApprover = flows.some((flow) => flow.approverId === ctx.userId);

  const allowed = ctx.role === "ADMIN" || document.currentRequesterId === ctx.userId || everApprover;
  if (!allowed) {
    throw ApiError.notFound("Documento nao encontrado");
  }

  return prisma.documentApprovalHistoryEvent.findMany({
    where: { qualityDocumentId: id },
    include: {
      user: { select: { id: true, badgeNumber: true, email: true } },
      approver: { select: { id: true, badgeNumber: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function create(
  input: {
    type: QualityDocumentType;
    title: string;
    approverId: string;
    requesterNote?: string;
    file: Express.Multer.File;
  },
  requesterId: string
) {
  const approver = await getApproverOrThrow(input.approverId);
  const requester = await prisma.user.findUniqueOrThrow({ where: { id: requesterId } });

  const document = await prisma.$transaction(async (tx) => {
    const created = await tx.qualityDocument.create({
      data: {
        type: input.type,
        title: input.title,
        originalName: sanitizeFilename(input.file.originalname),
        storedFileName: input.file.filename,
        mimeType: input.file.mimetype,
        sizeBytes: input.file.size,
        filePath: input.file.filename,
        uploadedById: requesterId,
        approvalStatus: "PENDENTE_APROVACAO",
        currentApproverId: approver.id,
        currentRequesterId: requesterId,
      },
    });

    await tx.documentApprovalFlow.create({
      data: {
        qualityDocumentId: created.id,
        cycleNumber: 1,
        status: "PENDENTE_APROVACAO",
        approverId: approver.id,
        requesterId,
        requesterNote: input.requesterNote,
      },
    });

    await tx.documentApprovalHistoryEvent.create({
      data: {
        qualityDocumentId: created.id,
        cycleNumber: 1,
        eventType: "SOLICITACAO",
        userId: requesterId,
        approverId: approver.id,
        note: input.requesterNote,
      },
    });

    await enqueue(tx, {
      type: EMAIL_JOB_TYPE.APPROVAL_REQUEST,
      payload: {
        to: approver.email,
        documentTitle: created.title,
        typeLabel: TYPE_LABELS[created.type],
        requesterName: requester.badgeNumber,
        requesterNote: input.requesterNote ?? null,
        link: approvalLink(created.id),
      },
    });

    return created;
  });

  await logActivity({
    userId: requesterId,
    action: "UPLOAD_QUALITY_DOCUMENT",
    entityType: "QualityDocument",
    entityId: document.id,
    metadata: { type: document.type, approverId: approver.id },
  });

  return getRawById(document.id);
}

export async function resubmit(
  id: string,
  input: { approverId: string; requesterNote?: string; file?: Express.Multer.File },
  actingUserId: string
) {
  const document = await getRawById(id);

  if (document.approvalStatus !== "NAO_APROVADO") {
    throw ApiError.badRequest("Somente documentos nao aprovados podem ser reenviados");
  }
  if (document.currentRequesterId !== actingUserId) {
    throw ApiError.forbidden("Somente o solicitante original pode reenviar este documento");
  }

  const approver = await getApproverOrThrow(input.approverId);
  const requester = await prisma.user.findUniqueOrThrow({ where: { id: actingUserId } });

  const lastFlow = await prisma.documentApprovalFlow.findFirst({
    where: { qualityDocumentId: id },
    orderBy: { cycleNumber: "desc" },
  });
  const nextCycle = (lastFlow?.cycleNumber ?? 0) + 1;
  const oldFilePath = document.filePath;

  const updated = await prisma.$transaction(async (tx) => {
    const doc = await tx.qualityDocument.update({
      where: { id },
      data: {
        approvalStatus: "PENDENTE_APROVACAO",
        currentApproverId: approver.id,
        ...(input.file
          ? {
              originalName: sanitizeFilename(input.file.originalname),
              storedFileName: input.file.filename,
              mimeType: input.file.mimetype,
              sizeBytes: input.file.size,
              filePath: input.file.filename,
            }
          : {}),
      },
    });

    await tx.documentApprovalFlow.create({
      data: {
        qualityDocumentId: id,
        cycleNumber: nextCycle,
        status: "PENDENTE_APROVACAO",
        approverId: approver.id,
        requesterId: actingUserId,
        requesterNote: input.requesterNote,
      },
    });

    await tx.documentApprovalHistoryEvent.create({
      data: {
        qualityDocumentId: id,
        cycleNumber: nextCycle,
        eventType: "REENVIO",
        userId: actingUserId,
        approverId: approver.id,
        note: input.requesterNote,
      },
    });

    await enqueue(tx, {
      type: EMAIL_JOB_TYPE.APPROVAL_REQUEST,
      payload: {
        to: approver.email,
        documentTitle: doc.title,
        typeLabel: TYPE_LABELS[doc.type],
        requesterName: requester.badgeNumber,
        requesterNote: input.requesterNote ?? null,
        link: approvalLink(doc.id),
      },
    });

    return doc;
  });

  if (input.file) {
    await deleteDocumentFiles([oldFilePath]);
  }

  await logActivity({
    userId: actingUserId,
    action: "RESUBMIT_QUALITY_DOCUMENT",
    entityType: "QualityDocument",
    entityId: id,
    metadata: { cycle: nextCycle, approverId: approver.id },
  });

  return getRawById(updated.id);
}

export async function decide(
  id: string,
  input: { decision: "APROVAR" | "REPROVAR"; approverNote?: string },
  actingUserId: string,
  actingUserRole: Role
) {
  const document = await getRawById(id);

  if (document.approvalStatus !== "PENDENTE_APROVACAO") {
    throw ApiError.badRequest("Este documento nao esta aguardando aprovacao");
  }
  if (document.currentApproverId !== actingUserId && actingUserRole !== "ADMIN") {
    throw ApiError.forbidden("Somente o aprovador designado pode decidir sobre este documento");
  }

  const currentFlow = await prisma.documentApprovalFlow.findFirst({
    where: { qualityDocumentId: id, status: "PENDENTE_APROVACAO" },
    orderBy: { cycleNumber: "desc" },
  });
  if (!currentFlow) {
    throw ApiError.notFound("Ciclo de aprovacao nao encontrado");
  }

  const newStatus: ApprovalStatus = input.decision === "APROVAR" ? "APROVADO" : "NAO_APROVADO";
  const eventType = input.decision === "APROVAR" ? "APROVACAO" : "REPROVACAO";
  const actingUser = await prisma.user.findUniqueOrThrow({ where: { id: actingUserId } });
  const requester = await prisma.user.findUniqueOrThrow({ where: { id: currentFlow.requesterId } });

  const updated = await prisma.$transaction(async (tx) => {
    await tx.documentApprovalFlow.update({
      where: { id: currentFlow.id },
      data: { status: newStatus, approverNote: input.approverNote, decidedAt: new Date() },
    });

    const doc = await tx.qualityDocument.update({
      where: { id },
      data: { approvalStatus: newStatus },
    });

    await tx.documentApprovalHistoryEvent.create({
      data: {
        qualityDocumentId: id,
        cycleNumber: currentFlow.cycleNumber,
        eventType,
        userId: actingUserId,
        approverId: currentFlow.approverId,
        note: input.approverNote,
      },
    });

    await enqueue(tx, {
      type: EMAIL_JOB_TYPE.APPROVAL_DECISION,
      payload: {
        to: requester.email,
        documentTitle: doc.title,
        typeLabel: TYPE_LABELS[doc.type],
        approved: newStatus === "APROVADO",
        approverName: actingUser.badgeNumber,
        approverNote: input.approverNote ?? null,
        link: approvalLink(doc.id),
      },
    });

    return doc;
  });

  await logActivity({
    userId: actingUserId,
    action: input.decision === "APROVAR" ? "APPROVE_QUALITY_DOCUMENT" : "REJECT_QUALITY_DOCUMENT",
    entityType: "QualityDocument",
    entityId: id,
    metadata: { cycle: currentFlow.cycleNumber },
  });

  return getRawById(updated.id);
}

export async function toggleActive(id: string, active: boolean, ctx: VisibilityContext) {
  await getById(id, ctx);

  const document = await prisma.qualityDocument.update({
    where: { id },
    data: { active },
    include: QUALITY_DOCUMENT_INCLUDE,
  });

  await logActivity({
    userId: ctx.userId,
    action: "TOGGLE_QUALITY_DOCUMENT_ACTIVE",
    entityType: "QualityDocument",
    entityId: id,
    metadata: { active },
  });

  return document;
}

export async function remove(id: string, ctx: VisibilityContext) {
  const document = await getById(id, ctx);

  if (document.approvalStatus === "PENDENTE_APROVACAO") {
    throw ApiError.badRequest("Nao e possivel excluir um documento aguardando aprovacao");
  }

  await deleteDocumentFiles([document.filePath]);
  await prisma.qualityDocument.delete({ where: { id } });

  await logActivity({
    userId: ctx.userId,
    action: "DELETE_QUALITY_DOCUMENT",
    entityType: "QualityDocument",
    entityId: id,
    metadata: { type: document.type },
  });
}
