import fs from "node:fs/promises";
import path from "node:path";
import type { LabelType } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/apiError";
import { logActivity } from "../../services/activityLog.service";
import { deleteDocumentFiles } from "../documents/documents.service";
import { LABEL_PHOTOS_ROOT } from "../../config/multer";

async function deletePhotoFile(photoPath: string | null) {
  if (!photoPath) return;
  try {
    await fs.unlink(path.join(LABEL_PHOTOS_ROOT, photoPath));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      throw err;
    }
  }
}

export async function list(filters: { type?: LabelType } = {}) {
  return prisma.label.findMany({
    where: filters.type ? { type: filters.type } : undefined,
    orderBy: { name: "asc" },
    include: { _count: { select: { categories: true } } },
  });
}

export async function getById(id: string) {
  const label = await prisma.label.findUnique({
    where: { id },
    include: {
      categories: {
        orderBy: { name: "asc" },
        include: { _count: { select: { documents: true } } },
      },
    },
  });

  if (!label) {
    throw ApiError.notFound("Label nao encontrada");
  }

  return label;
}

export async function create(
  input: { name: string; description?: string; type: LabelType },
  createdById: string
) {
  const label = await prisma.label.create({
    data: { name: input.name, description: input.description, type: input.type, createdById },
  });

  await logActivity({
    userId: createdById,
    action: "CREATE_LABEL",
    entityType: "Label",
    entityId: label.id,
  });

  return label;
}

export async function update(
  id: string,
  data: Partial<{ name: string; description: string }>,
  actingUserId: string
) {
  await getById(id);

  const label = await prisma.label.update({ where: { id }, data });

  await logActivity({
    userId: actingUserId,
    action: "UPDATE_LABEL",
    entityType: "Label",
    entityId: id,
    metadata: data,
  });

  return label;
}

export async function uploadPhoto(id: string, file: Express.Multer.File, actingUserId: string) {
  const existing = await getById(id);

  await deletePhotoFile(existing.photoPath);

  const label = await prisma.label.update({
    where: { id },
    data: { photoPath: file.filename, photoMimeType: file.mimetype },
  });

  await logActivity({
    userId: actingUserId,
    action: "UPDATE_LABEL_PHOTO",
    entityType: "Label",
    entityId: id,
  });

  return label;
}

export async function removePhoto(id: string, actingUserId: string) {
  const existing = await getById(id);

  await deletePhotoFile(existing.photoPath);

  const label = await prisma.label.update({
    where: { id },
    data: { photoPath: null, photoMimeType: null },
  });

  await logActivity({
    userId: actingUserId,
    action: "REMOVE_LABEL_PHOTO",
    entityType: "Label",
    entityId: id,
  });

  return label;
}

export async function getPhotoForDownload(id: string) {
  const label = await getById(id);

  if (!label.photoPath || !label.photoMimeType) {
    throw ApiError.notFound("Este produto nao possui foto");
  }

  return {
    absolutePath: path.join(LABEL_PHOTOS_ROOT, label.photoPath),
    mimeType: label.photoMimeType,
  };
}

export async function remove(id: string, actingUserId: string) {
  const label = await getById(id);

  const documents = await prisma.document.findMany({
    where: { category: { labelId: id } },
    select: { filePath: true },
  });

  await deleteDocumentFiles(documents.map((doc) => doc.filePath));
  await deletePhotoFile(label.photoPath);

  await prisma.label.delete({ where: { id } });

  await logActivity({
    userId: actingUserId,
    action: "DELETE_LABEL",
    entityType: "Label",
    entityId: id,
    metadata: { deletedDocuments: documents.length },
  });
}
