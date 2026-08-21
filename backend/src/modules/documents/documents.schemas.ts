import { z } from "zod";

export const listDocumentsQuerySchema = z.object({
  categoryId: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const documentIdParamSchema = z.object({
  id: z.string().min(1),
});

export const uploadDocumentBodySchema = z.object({
  categoryId: z.string().min(1, "Informe a categoria"),
  notify: z
    .string()
    .optional()
    .transform((value) => value === "true"),
});

export const notifyDocumentSchema = z
  .object({
    toAll: z.boolean(),
    userIds: z.array(z.string().min(1)).optional(),
  })
  .refine((data) => data.toAll || (data.userIds && data.userIds.length > 0), {
    message: "Selecione ao menos um usuario ou marque enviar para todos",
    path: ["userIds"],
  });
