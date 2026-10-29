import { z } from "zod";

export const qualityDocumentTypeSchema = z.enum(["FORMULARIO", "PROCEDIMENTO_INTERNO"]);

export const listQualityDocumentsQuerySchema = z.object({
  type: qualityDocumentTypeSchema,
  active: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true")),
});

export const qualityDocumentIdParamSchema = z.object({
  id: z.string().min(1),
});

export const uploadQualityDocumentBodySchema = z.object({
  type: qualityDocumentTypeSchema,
  title: z.string().min(1, "Informe o titulo do documento"),
  approverId: z.string().min(1, "Selecione um aprovador"),
  requesterNote: z.string().optional(),
});

export const resubmitQualityDocumentBodySchema = z.object({
  approverId: z.string().min(1, "Selecione um aprovador"),
  requesterNote: z.string().optional(),
});

export const toggleQualityDocumentActiveSchema = z.object({
  active: z.boolean(),
});

export const decisionSchema = z
  .object({
    decision: z.enum(["APROVAR", "REPROVAR"]),
    approverNote: z.string().optional(),
  })
  .refine((data) => data.decision === "APROVAR" || !!data.approverNote?.trim(), {
    message: "Observacao obrigatoria ao reprovar",
    path: ["approverNote"],
  });
