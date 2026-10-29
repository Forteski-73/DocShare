# Checklist para pedir deploy em produção

Use isto como referência rápida na hora de me pedir um deploy do DocShare
para o VPS. Objetivo: eu ter tudo que preciso de cara, sem improvisar
workaround, e sem risco de mexer errado em produção.

## O que já é fixo (não precisa repetir a cada pedido)

Isso já está documentado no [deploy.sh](deploy.sh) e no [README.md](README.md) —
eu leio de lá, não preciso que você me informe de novo:

- Host: `187.127.56.80` (VPS Hostinger) — usuário SSH `root`
- Caminhos remotos: `/var/www/docshare/backend` e `/var/www/docshare/frontend`
- Processo PM2: `docshare-backend`
- Site: `https://docshare.tech`
- O deploy sempre: empacota `backend/` e `frontend/` (sem `node_modules`,
  `.env`, `uploads`, `dist`) → envia → `npm install` → `prisma generate` →
  `prisma migrate deploy` → `npm run build` nos dois → `chmod -R o+rX
  /var/www/docshare` → `pm2 restart docshare-backend` → `pm2 save`

## O que eu preciso que você me passe a cada deploy

**1. Acesso SSH válido — escolha UMA opção, da mais segura pra menos segura:**

| Opção | Como funciona | Recomendação |
|---|---|---|
| **A. Chave SSH dedicada sem passphrase** | Uma chave só para automação de deploy, sem senha, autorizada no servidor. Eu conecto sem pedir nada a cada vez. | ✅ Melhor opção — nada sensível passa pelo chat depois de configurada uma vez. |
| **B. Passphrase da chave já existente** | Este PC já tem uma chave em `~/.ssh/id_ed25519`, mas ela tem passphrase e eu não sei qual é. Se você me passar a passphrase (uma vez, ou por sessão), eu destravo essa chave e uso normalmente. | ✅ Boa opção, reaproveita o que já existe. |
| **C. Senha root do VPS** | Funciona (foi o que usei no último deploy), mas fica registrada no histórico da conversa em texto puro. | ⚠️ Evite se der — e se usar, troque a senha depois. |

Se nenhuma dessas estiver configurada quando eu for fazer o deploy, eu aviso
e paro antes de tentar qualquer workaround (instalar ferramentas extras,
etc.) — prefiro perguntar a improvisar em cima de credencial de produção.

**2. Confirmação explícita para prosseguir.** Eu nunca disparo o passo que
mexe de fato em produção (`prisma migrate deploy` + `pm2 restart`) sem você
confirmar depois que eu mostrar o que vai rodar. Isso não muda — não peço
pra "pular" essa confirmação.

**3. Avisos extras, só se houver algo fora do padrão:**
- Mudança de schema que precise de cuidado manual (ex: coluna nova sem
  `DEFAULT`, rename que quebra dado existente, algo que precise de backfill
  antes do `migrate deploy` rodar sozinho)
- Se quiser que eu pare em algum ponto intermediário (ex: só build, sem
  restart) em vez de ir até o fim
- Qualquer mudança de infraestrutura que o `deploy.sh` ainda não conhece
  (novo domínio, novo processo PM2, etc.)

## O que eu sempre faço por padrão, sem precisar pedir

- Confiro o estado do servidor **antes** de mexer (`pm2 list`, `prisma
  migrate status`, disco/estrutura de pastas)
- Confiro **depois** (health check, HTTP 200 no site, `/api/...` respondendo,
  logs do PM2 sem erro)
- Sigo exatamente a mesma estrutura de pastas e permissões que o
  `deploy.sh` já usa — não crio caminho novo nem mudo dono/permissão fora
  do que o script já faz
- Apago do disco local qualquer arquivo temporário que contenha senha
  assim que termino de usar
- Nunca uso `--force`, nunca apago dado do servidor além do que o
  `deploy.sh` já apaga (código-fonte antigo, não uploads/banco)

## Resumindo: a mensagem ideal pra me mandar

> "Pode fazer o deploy. [Passphrase da chave / aviso de que configurei a
> chave A / senha root, se não tiver outra opção]. [Algum aviso extra, se
> houver]."

Se só disser "faz o deploy" e eu já tiver acesso SSH configurado (opção A
ou B ativa), nem precisa de mais nada — eu sigo o checklist acima sozinho e
só paro pra confirmar antes do passo que mexe em produção.
