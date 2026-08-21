export function inviteEmailTemplate(link: string) {
  return {
    subject: "Voce foi convidado para o DocShare",
    html: `
      <p>Ola,</p>
      <p>Voce foi cadastrado no DocShare, o portal de gestao de documentos.</p>
      <p>Clique no link abaixo para criar sua senha e ativar sua conta:</p>
      <p><a href="${link}">${link}</a></p>
      <p>Este link expira em breve. Se voce nao esperava este e-mail, ignore-o.</p>
    `,
  };
}
