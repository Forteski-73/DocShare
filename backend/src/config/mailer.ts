import nodemailer, { type Transporter } from "nodemailer";
import { env } from "./env";

let transporterPromise: Promise<Transporter> | null = null;
let usingEthereal = false;

async function createTransporter(): Promise<Transporter> {
  if (env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    });
  }

  // Sem SMTP configurado (padrao em dev local): cria uma conta de teste Ethereal
  // automaticamente. Os e-mails nao saem de verdade, mas ficam disponiveis
  // para visualizacao em uma URL de preview impressa no console.
  usingEthereal = true;
  const testAccount = await nodemailer.createTestAccount();
  console.log(`[EMAIL] Usando conta de teste Ethereal (dev): ${testAccount.user}`);

  return nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
}

function getTransporter(): Promise<Transporter> {
  if (!transporterPromise) {
    transporterPromise = createTransporter();
  }
  return transporterPromise;
}

type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; path: string }[];
};

export async function sendMail({ to, subject, html, attachments }: SendMailInput) {
  const transporter = await getTransporter();
  const info = await transporter.sendMail({ from: env.SMTP_FROM, to, subject, html, attachments });

  if (usingEthereal) {
    console.log(`[EMAIL] Para: ${to} | Assunto: ${subject}`);
    console.log(`[EMAIL] Preview: ${nodemailer.getTestMessageUrl(info)}`);
  }
}
