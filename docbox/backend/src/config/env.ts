import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().default(3333),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  FRONTEND_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("8h"),
  COOKIE_NAME: z.string().default("docbox_token"),
  INVITE_TOKEN_EXPIRES_HOURS: z.coerce.number().default(48),
  RESET_TOKEN_EXPIRES_HOURS: z.coerce.number().default(1),
  UPLOAD_DIR: z.string().default("uploads"),
  MAX_FILE_SIZE_MB: z.coerce.number().default(20),
  SMTP_HOST: z.string().optional().default(""),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASS: z.string().optional().default(""),
  SMTP_FROM: z.string().default("DocShare <no-reply@docshare.local>"),
  // Cloudflare Turnstile (protecao contra login por forca bruta/bots).
  // Default: chave de teste publica da Cloudflare que sempre passa - so para dev,
  // sem precisar de conta. Em producao, configure a chave secreta real no .env do servidor.
  TURNSTILE_SECRET_KEY: z.string().default("1x0000000000000000000000000000000AA"),
});

export const env = envSchema.parse(process.env);
