export function passwordResetEmailTemplate(link: string) {
  return {
    subject: "Redefinicao de senha - DocShare",
    html: `
      <p>Ola,</p>
      <p>Recebemos uma solicitacao para redefinir sua senha no DocShare.</p>
      <p>Clique no link abaixo para definir uma nova senha:</p>
      <p><a href="${link}">${link}</a></p>
      <p>Se voce nao solicitou isso, ignore este e-mail.</p>
    `,
  };
}
