# DocShare — Portal de Gestão de Documentos por Produto

Portal interno para organizar documentos por Produto (**Label**) → **Categoria** → **Documento**, com controle de acesso por perfil (Admin / Editor / Leitor) e fluxo de convite por e-mail.

## Stack

- **Frontend**: React + Vite + TypeScript + Mantine
- **Backend**: Node.js + Express + TypeScript
- **Banco**: MySQL (via XAMPP)
- **ORM**: Prisma 7 (com driver adapter `@prisma/adapter-mariadb`)
- **Autenticação**: JWT em cookie httpOnly + bcrypt
- **E-mail**: Nodemailer (Ethereal em dev)
- **Upload**: Multer, salvo em `backend/uploads/`

## Pré-requisitos

- [Node.js 20 LTS](https://nodejs.org/) (`node -v` deve mostrar `v20.x`)
- [XAMPP](https://www.apachefriends.org/) com o módulo **MySQL** iniciado

## Setup local

### 1. Banco de dados (XAMPP)

1. Abra o **XAMPP Control Panel** e clique em **Start** ao lado de **MySQL**.
2. Crie o banco `docshare` com charset `utf8mb4`. Pode ser feito pelo phpMyAdmin (`http://localhost/phpmyadmin`) ou via terminal:
   ```bash
   "C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS docshare CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```
   O usuário padrão do XAMPP é `root` sem senha.

### 2. Backend

```bash
cd backend
cp .env.example .env    # ajuste DATABASE_URL/JWT_SECRET se necessário
npm install
npx prisma migrate dev  # cria as tabelas no banco docshare
npm run dev              # inicia em http://localhost:3333
```

Verifique em `http://localhost:3333/health` → deve retornar `{"status":"ok"}`.

**Sobre e-mails em dev**: com `SMTP_HOST` vazio no `.env` (padrao), o backend cria automaticamente uma conta de teste na [Ethereal](https://ethereal.email/) na primeira vez que um e-mail e enviado. Nenhum e-mail sai de verdade — o console mostra uma linha `[EMAIL] Preview: https://ethereal.email/message/...` com o link para visualizar o conteudo. Para usar um SMTP real, preencha `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS` no `.env`.

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev               # inicia em http://localhost:5173
```

### 4. Rodar os dois juntos (opcional)

Na raiz do projeto:

```bash
npm install
npm run dev
```

## Estrutura de pastas

```
docbox/
├── deploy.sh    # script de redeploy para o VPS de producao
├── backend/     # API Express + Prisma
│   ├── prisma/  # schema.prisma, migrations, seed
│   ├── src/
│   └── uploads/ # arquivos enviados (gerado em runtime)
└── frontend/    # SPA React (Vite)
    ├── .env.production  # VITE_API_URL=/api, usado so no build de producao
    └── src/
```

## Variáveis de ambiente

Cada pacote (`backend/`, `frontend/`) tem seu próprio `.env.example` — copie para `.env` e ajuste conforme necessário. O `.env` real nunca deve ser commitado.

## Solução de problemas

**`npm install` falha com `SELF_SIGNED_CERT_IN_CHAIN`**, ou a criacao da conta de teste Ethereal falha ao iniciar o backend: rede corporativa com antivírus interceptando HTTPS (ex.: Kaspersky). É necessário confiar no certificado raiz correspondente — configure a variável de ambiente `NODE_EXTRA_CA_CERTS` apontando para o certificado exportado do repositório de certificados do Windows (isso vale tanto para `npm install` quanto para o processo do backend em si, ja que ele tambem faz uma chamada HTTPS para criar a conta Ethereal), e rode `npm config set cafile <caminho-do-certificado>`.

## Deploy (Hostinger VPS)

Produção roda em um VPS Hostinger (Ubuntu 24.04), com Nginx como proxy reverso + servidor de estáticos, backend gerenciado pelo PM2, e MySQL local ao servidor.

### Arquitetura

- **Nginx** (porta 80/443, com SSL via Let's Encrypt/Certbot): serve o build estático do frontend e faz proxy de `/api/*` para o backend Node (porta interna 3333, não exposta)
- **Backend**: gerenciado pelo **PM2** (`pm2 start dist/server.js --name docshare-backend`), reinicia sozinho no boot (`pm2 startup` + `pm2 save`)
- **MySQL**: instalado no próprio VPS, com um usuário de aplicação dedicado (não root). **Importante**: como o MySQL no Linux por padrão diferencia maiúsculas/minúsculas em nomes de tabela (diferente do Windows/XAMPP), o servidor precisa de `lower_case_table_names=1` em `/etc/mysql/mysql.conf.d/mysqld.cnf` — sem isso, os nomes de tabela gerados pelo Prisma (`User`, `Label`, etc.) não batem com o que fica salvo no disco. Essa configuração só pode ser definida ao inicializar o diretório de dados do MySQL (não dá para mudar depois sem reinicializar).
- Como frontend e backend ficam atrás do mesmo domínio/Nginx, o **frontend de produção usa `VITE_API_URL=/api`** (caminho relativo, ver `frontend/.env.production`) em vez do endereço completo do dev — elimina a necessidade de CORS cross-origin
- **Firewall (UFW)**: libera só 22 (SSH), 80 e 443
- Como o Node fica atrás do Nginx, o Express precisa de `app.set("trust proxy", 1)` (já configurado em `src/app.ts` quando `NODE_ENV=production`) — sem isso, o `express-rate-limit` rejeita o header `X-Forwarded-For` que o Nginx envia

### Setup inicial do servidor (já feito, documentado para referência)

```bash
# Node 20 LTS, Nginx, Git
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs nginx git

# MySQL
apt-get install -y mysql-server
# adicionar lower_case_table_names=1 em /etc/mysql/mysql.conf.d/mysqld.cnf ANTES do primeiro start
systemctl enable mysql --now

# PM2 e Certbot
npm install -g pm2
apt-get install -y certbot python3-certbot-nginx

# Firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

Criar banco e usuário dedicado (nunca usar root na `DATABASE_URL` da aplicação):

```sql
CREATE DATABASE docshare CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'docshare_app'@'localhost' IDENTIFIED BY '<senha-forte>';
GRANT ALL PRIVILEGES ON docshare.* TO 'docshare_app'@'localhost';
```

`backend/.env` de produção (criado direto no servidor, nunca versionado): mesmas variáveis do `.env.example`, com `NODE_ENV=production`, `FRONTEND_URL=https://docshare.tech`, `DATABASE_URL` apontando pro MySQL local do VPS, `JWT_SECRET` próprio (diferente do dev), e `SMTP_HOST=smtp.hostinger.com` / `SMTP_PORT=465` / `SMTP_SECURE=true` com as credenciais do e-mail da Hostinger.

Nginx (`/etc/nginx/sites-available/docshare`): serve `frontend/dist` como estático com fallback de rotas (`try_files $uri /index.html`) e proxy de `/api/` para `http://127.0.0.1:3333`. Depois do DNS apontar pro servidor: `certbot --nginx -d docshare.tech -d www.docshare.tech`.

DNS: registros tipo **A** de `docshare.tech` e `www.docshare.tech` apontando para o IP do VPS, configurados no hPanel da Hostinger.

### Atualizar produção com mudanças novas

Depois do setup inicial, use o script `deploy.sh` na raiz do projeto (rode localmente, fora do Claude Code):

```bash
./deploy.sh
```

Ele empacota `backend/` e `frontend/`, envia para o servidor, reinstala dependências, roda `prisma migrate deploy` (aplica migrations pendentes sem interatividade), builda os dois e reinicia o backend no PM2. Requer acesso SSH já configurado para `root@<ip-do-vps>`.

### Observações de segurança

- O `.env` de produção nunca é commitado nem gerado a partir do `.env` local — é criado direto no servidor
- A senha do usuário admin padrão deve ser trocada após o primeiro login em produção
- Segredos (JWT, senha do banco, senha SMTP) são únicos de produção, diferentes dos valores de desenvolvimento
