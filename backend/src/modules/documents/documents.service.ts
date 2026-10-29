import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { UPLOAD_ROOT } from "../../config/multer";
import { ApiError } from "../../utils/apiError";
import { sanitizeFilename } from "../../utils/sanitizeFilename";
import { logActivity } from "../../services/activityLog.service";
import { sendNewDocumentNotificationEmail } from "../../services/email.service";

// Margem de seguranca: anexos em e-mail ficam ~37% maiores apos codificacao base64,
// e a maioria dos provedores de SMTP rejeita mensagens acima de ~20-25MB no total.
const MAX_EMAIL_ATTACHMENT_BYTES = 15 * 1024 * 1024;

const DOCUMENT_INCLUDE = {
  uploadedBy: { select: { id: true, badgeNumber: true, email: true } },
} as const;

const DOCUMENT_WITH_CATEGORY_INCLUDE = {
  ...DOCUMENT_INCLUDE,
  category: {
    select: {
      id: true,
      name: true,
      label: { select: { id: true, name: true, photoPath: true } },
    },
  },
} as const;

export async function deleteDocumentFiles(filePaths: string[]) {
  await Promise.all(
    filePaths.map(async (filePath) => {
      try {
        await fs.unlink(path.join(UPLOAD_ROOT, filePath));
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
          throw err;
        }
      }
    })
  );
}

type ListDocumentsInput = {
  categoryId?: string;
  search?: string;
  page: number;
  pageSize: number;
};

export async function list(input: ListDocumentsInput) {
  const where = {
    ...(input.categoryId ? { categoryId: input.categoryId } : {}),
    ...(input.search ? { originalName: { contains: input.search } } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.document.findMany({
      where,
      include: DOCUMENT_WITH_CATEGORY_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
    }),
    prisma.document.count({ where }),
  ]);

  return { data, total, page: input.page, pageSize: input.pageSize };
}

export async function getById(id: string) {
  const document = await prisma.document.findUnique({
    where: { id },
    include: DOCUMENT_INCLUDE,
  });

  if (!document) {
    throw ApiError.notFound("Documento nao encontrado");
  }

  return document;
}

export async function getFileForDownload(id: string) {
  const document = await getById(id);
  return {
    document,
    absolutePath: path.join(UPLOAD_ROOT, document.filePath),
  };
}

export async function create(
  input: { categoryId: string; file: Express.Multer.File; notify: boolean },
  uploadedById: string
) {
  const category = await prisma.category.findUnique({
    where: { id: input.categoryId },
    include: { label: true },
  });

  if (!category) {
    throw ApiError.notFound("Categoria nao encontrada");
  }

  const document = await prisma.document.create({
    data: {
      categoryId: input.categoryId,
      originalName: sanitizeFilename(input.file.originalname),
      storedFileName: input.file.filename,
      mimeType: input.file.mimetype,
      sizeBytes: input.file.size,
      filePath: input.file.filename,
      uploadedById,
    },
  });

  await logActivity({
    userId: uploadedById,
    action: "UPLOAD_DOCUMENT",
    entityType: "Document",
    entityId: document.id,
    metadata: { categoryId: category.id, labelId: category.labelId },
  });

  if (input.notify) {
    const activeUsers = await prisma.user.findMany({
      where: { status: "ACTIVE" },
      select: { email: true },
    });
    await sendDocumentNotification(document, category, activeUsers.map((u) => u.email));
  }

  return getById(document.id);
}

async function sendDocumentNotification(
  document: { id: string; originalName: string; filePath: string; sizeBytes: number },
  category: { id: string; name: string; label: { id: string; name: string } },
  recipientEmails: string[]
) {
  const link = `${env.FRONTEND_URL}/labels/${category.label.id}/categories/${category.id}?documentId=${document.id}`;
  const canAttach = document.sizeBytes <= MAX_EMAIL_ATTACHMENT_BYTES;
  const attachmentPath = canAttach ? path.join(UPLOAD_ROOT, document.filePath) : undefined;

  await Promise.all(
    recipientEmails.map((email) =>
      sendNewDocumentNotificationEmail(email, {
        documentName: document.originalName,
        categoryName: category.name,
        labelName: category.label.name,
        link,
        attachmentPath,
      })
    )
  );
}

export async function notify(
  documentId: string,
  input: { toAll: boolean; userIds?: string[] },
  actingUserId: string
) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { category: { include: { label: true } } },
  });

  if (!document) {
    throw ApiError.notFound("Documento nao encontrado");
  }

  const recipients = input.toAll
    ? await prisma.user.findMany({ where: { status: "ACTIVE" }, select: { id: true, email: true } })
    : await prisma.user.findMany({
        where: { id: { in: input.userIds ?? [] }, status: "ACTIVE" },
        select: { id: true, email: true },
      });

  if (recipients.length === 0) {
    throw ApiError.badRequest("Nenhum destinatario ativo encontrado");
  }

  await sendDocumentNotification(
    document,
    document.category,
    recipients.map((recipient) => recipient.email)
  );

  await logActivity({
    userId: actingUserId,
    action: "RESEND_DOCUMENT_NOTIFICATION",
    entityType: "Document",
    entityId: documentId,
    metadata: { toAll: input.toAll, recipientCount: recipients.length },
  });

  return { recipientCount: recipients.length };
}

export async function remove(id: string, actingUserId: string) {
  const document = await getById(id);

  await deleteDocumentFiles([document.filePath]);
  await prisma.document.delete({ where: { id } });

  await logActivity({
    userId: actingUserId,
    action: "DELETE_DOCUMENT",
    entityType: "Document",
    entityId: id,
  });
}
