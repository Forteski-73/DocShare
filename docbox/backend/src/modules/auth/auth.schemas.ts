import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(1, "Informe o e-mail ou cracha"),
  password: z.string().min(1, "Informe a senha"),
  turnstileToken: z.string().min(1, "Verificacao de seguranca obrigatoria"),
});

export const activateAccountSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "A senha deve ter no minimo 8 caracteres"),
});

export const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, "Informe o e-mail ou cracha"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "A senha deve ter no minimo 8 caracteres"),
});
