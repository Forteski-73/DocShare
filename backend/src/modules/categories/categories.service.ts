import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/apiError";
import { logActivity } from "../../services/activityLog.service";
import { deleteDocumentFiles } from "../documents/documents.service";

export async function list(labelId: string) {
  return prisma.category.findMany({
    where: { labelId },
    orderBy: { name: "asc" },
    include: { _count: { select: { documents: true } } },
  });
}

export async function getById(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      label: { select: { id: true, name: true, type: true, photoPath: true } },
      documents: {
        orderBy: { createdAt: "desc" },
        include: { uploadedBy: { select: { id: true, badgeNumber: true, email: true } } },
      },
    },
  });

  if (!category) {
    throw ApiError.notFound("Categoria nao encontrada");
  }

  return category;
}

export async function create(
  input: { labelId: string; name: string; description?: string },
  createdById: string
) {
  const label = await prisma.label.findUnique({ where: { id: input.labelId } });
  if (!label) {
    throw ApiError.notFound("Label nao encontrada");
  }

  const category = await prisma.category.create({
    data: {
      labelId: input.labelId,
      name: input.name,
      description: input.description,
      createdById,
    },
  });

  await logActivity({
    userId: createdById,
    action: "CREATE_CATEGORY",
    entityType: "Category",
    entityId: category.id,
    metadata: { labelId: input.labelId },
  });

  return category;
}

export async function update(
  id: string,
  data: Partial<{ name: string; description: string }>,
  actingUserId: string
) {
  await getById(id);

  const category = await prisma.category.update({ where: { id }, data });

  await logActivity({
    userId: actingUserId,
    action: "UPDATE_CATEGORY",
    entityType: "Category",
    entityId: id,
    metadata: data,
  });

  return category;
}

export async function remove(id: string, actingUserId: string) {
  await getById(id);

  const documents = await prisma.document.findMany({
    where: { categoryId: id },
    select: { filePath: true },
  });

  await deleteDocumentFiles(documents.map((doc) => doc.filePath));

  await prisma.category.delete({ where: { id } });

  await logActivity({
    userId: actingUserId,
    action: "DELETE_CATEGORY",
    entityType: "Category",
    entityId: id,
    metadata: { deletedDocuments: documents.length },
  });
}
