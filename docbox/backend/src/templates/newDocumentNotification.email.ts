type NewDocumentNotificationInput = {
  documentName: string;
  categoryName: string;
  labelName: string;
  link: string;
  attached: boolean;
};

export function newDocumentNotificationEmailTemplate({
  documentName,
  categoryName,
  labelName,
  link,
  attached,
}: NewDocumentNotificationInput) {
  return {
    subject: `Novo documento em ${labelName}: ${documentName}`,
    html: `
      <p>Um novo documento foi adicionado ao DocShare:</p>
      <ul>
        <li><strong>Documento:</strong> ${documentName}</li>
        <li><strong>Categoria:</strong> ${categoryName}</li>
        <li><strong>Produto:</strong> ${labelName}</li>
      </ul>
      <br /><br />
      ${
        attached
          ? `<p>O documento esta anexado a este e-mail.</p>`
          : `<p>O arquivo e grande demais para ser anexado por e-mail. <a href="${link}">Acesse o documento no sistema</a>.</p>`
      }
    `,
  };
}
