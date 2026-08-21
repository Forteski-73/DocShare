import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(1, "Informe o e-mail ou cracha"),
  password: z.string().min(1, "Informe a senha"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const setPasswordSchema = z
  .object({
    password: z.string().min(8, "Minimo de 8 caracteres"),
    confirmPassword: z.string().min(8, "Minimo de 8 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas nao conferem",
    path: ["confirmPassword"],
  });
export type SetPasswordFormValues = z.infer<typeof setPasswordSchema>;

export const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, "Informe o e-mail ou cracha"),
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
