import { z } from "zod";

export const labelTypeSchema = z.enum(["PISO_LAMINADO", "ACESSORIO", "DOCUMENTO"]);

export const createLabelSchema = z.object({
  name: z.string().min(1, "Informe o nome do produto"),
  description: z.string().optional(),
  type: labelTypeSchema,
});

export const updateLabelSchema = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  });

export const labelIdParamSchema = z.object({
  id: z.string().min(1),
});

export const listLabelsQuerySchema = z.object({
  type: labelTypeSchema.optional(),
});
