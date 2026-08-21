type ApprovalRequestInput = {
  documentTitle: string;
  typeLabel: string;
  requesterName: string;
  requesterNote?: string | null;
  link: string;
};

export function approvalRequestEmailTemplate({
  documentTitle,
  typeLabel,
  requesterName,
  requesterNote,
  link,
}: ApprovalRequestInput) {
  return {
    subject: `Documento aguardando sua aprovacao: ${documentTitle}`,
    html: `
      <p>Um documento foi enviado para sua aprovacao no DocShare:</p>
      <ul>
        <li><strong>Documento:</strong> ${documentTitle}</li>
        <li><strong>Categoria:</strong> ${typeLabel}</li>
        <li><strong>Solicitado por:</strong> ${requesterName}</li>
      </ul>
      ${requesterNote ? `<p><strong>Observacao do solicitante:</strong> ${requesterNote}</p>` : ""}
      <br />
      <p><a href="${link}">Acesse a tela de aprovacao</a> para visualizar o documento.</p>
    `,
  };
}
