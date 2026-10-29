import { sendMail } from "../config/mailer";
import { env } from "../config/env";
import { inviteEmailTemplate } from "../templates/invite.email";
import { accountActivatedEmailTemplate } from "../templates/accountActivated.email";
import { passwordResetEmailTemplate } from "../templates/passwordReset.email";
import {
  newDocumentNotificationEmailTemplate,
} from "../templates/newDocumentNotification.email";
import { approvalRequestEmailTemplate } from "../templates/approvalRequest.email";
import { approvalDecisionEmailTemplate } from "../templates/approvalDecision.email";

export async function sendInviteEmail(to: string, token: string) {
  const link = `${env.FRONTEND_URL}/ativar-conta?token=${token}`;
  const { subject, html } = inviteEmailTemplate(link);
  await sendMail({ to, subject, html });
}

export async function sendAccountActivatedEmail(to: string) {
  const { subject, html } = accountActivatedEmailTemplate();
  await sendMail({ to, subject, html });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const link = `${env.FRONTEND_URL}/redefinir-senha?token=${token}`;
  const { subject, html } = passwordResetEmailTemplate(link);
  await sendMail({ to, subject, html });
}

export async function sendNewDocumentNotificationEmail(
  to: string,
  input: {
    documentName: string;
    categoryName: string;
    labelName: string;
    link: string;
    attachmentPath?: string;
  }
) {
  const attached = !!input.attachmentPath;
  const { subject, html } = newDocumentNotificationEmailTemplate({ ...input, attached });
  await sendMail({
    to,
    subject,
    html,
    attachments: attached ? [{ filename: input.documentName, path: input.attachmentPath! }] : undefined,
  });
}

export async function sendApprovalRequestEmail(
  to: string,
  input: {
    documentTitle: string;
    typeLabel: string;
    requesterName: string;
    requesterNote?: string | null;
    link: string;
  }
) {
  const { subject, html } = approvalRequestEmailTemplate(input);
  await sendMail({ to, subject, html });
}

export async function sendApprovalDecisionEmail(
  to: string,
  input: {
    documentTitle: string;
    typeLabel: string;
    approved: boolean;
    approverName: string;
    approverNote?: string | null;
    link: string;
  }
) {
  const { subject, html } = approvalDecisionEmailTemplate(input);
  await sendMail({ to, subject, html });
}
