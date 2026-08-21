type ApprovalDecisionInput = {
  documentTitle: string;
  typeLabel: string;
  approved: boolean;
  approverName: string;
  approverNote?: string | null;
  link: string;
};

export function approvalDecisionEmailTemplate({
  documentTitle,
  typeLabel,
  approved,
  approverName,
  approverNote,
  link,
}: ApprovalDecisionInput) {
  const statusLabel = approved ? "aprovado" : "nao aprovado";

  return {
    subject: `Seu documento foi ${statusLabel}: ${documentTitle}`,
    html: `
      <p>O documento que voce enviou para aprovacao no DocShare foi <strong>${statusLabel}</strong>:</p>
      <ul>
        <li><strong>Documento:</strong> ${documentTitle}</li>
        <li><strong>Categoria:</strong> ${typeLabel}</li>
        <li><strong>Decidido por:</strong> ${approverName}</li>
      </ul>
      <br />
      ${approverNote ? `<p><strong>Observacao do aprovador:</strong><br /> ${approverNote}</p>` : ""}
      <br />
      <p><a href="${link}">Acesse o documento no sistema</a>.</p>
      ${
        !approved
          ? `<p>Voce pode editar e reenviar este documento para uma nova aprovacao.</p>`
          : ""
      }
    `,
  };
}
