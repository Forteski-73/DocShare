import { z } from "zod";

export const updateHeaderColorSchema = z.object({
  headerColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Informe uma cor no formato #RRGGBB"),
});
