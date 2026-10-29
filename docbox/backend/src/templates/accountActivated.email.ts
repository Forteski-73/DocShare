export function accountActivatedEmailTemplate() {
  return {
    subject: "Sua conta no DocShare foi ativada",
    html: `
      <p>Ola,</p>
      <p>Sua conta no DocShare foi ativada com sucesso. Voce ja pode fazer login normalmente.</p>
    `,
  };
}
