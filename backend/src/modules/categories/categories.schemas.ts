import { z } from "zod";

export const createCategorySchema = z.object({
  labelId: z.string().min(1, "Informe a label"),
  name: z.string().min(1, "Informe o nome da categoria"),
  description: z.string().optional(),
});

export const updateCategorySchema = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  });

export const listCategoriesQuerySchema = z.object({
  labelId: z.string().min(1, "Informe a label"),
});

export const categoryIdParamSchema = z.object({
  id: z.string().min(1),
});
