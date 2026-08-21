#!/bin/bash
# Script de redeploy do DocShare no VPS de producao (Hostinger).
#
# Uso: ./deploy.sh
# Roda a partir da raiz do projeto. Empacota backend/ e frontend/,
# envia para o servidor, reinstala dependencias, roda migrations
# pendentes, builda e reinicia o processo no PM2.
#
# Requer acesso SSH ja configurado para root@$VPS_HOST (por chave ou senha
# interativa). Nao roda automaticamente pelo Claude Code - é para voce
# rodar manualmente quando quiser atualizar a producao com mudancas novas.

set -e

VPS_HOST="187.127.56.80"
VPS_USER="root"
REMOTE_BACKEND="/var/www/docshare/backend"
REMOTE_FRONTEND="/var/www/docshare/frontend"

echo "== Empacotando backend =="
tar --exclude='node_modules' --exclude='uploads' --exclude='.env' --exclude='dist' \
  -czf /tmp/docshare-backend.tar.gz -C backend .

echo "== Empacotando frontend =="
tar --exclude='node_modules' --exclude='dist' --exclude='.env' \
  -czf /tmp/docshare-frontend.tar.gz -C frontend .

echo "== Enviando para o servidor =="
scp /tmp/docshare-backend.tar.gz "$VPS_USER@$VPS_HOST:/tmp/"
scp /tmp/docshare-frontend.tar.gz "$VPS_USER@$VPS_HOST:/tmp/"

echo "== Atualizando no servidor (build + migrations + restart) =="
ssh "$VPS_USER@$VPS_HOST" "
  set -e
  # Limpa o codigo-fonte antigo antes de extrair: sem isso, arquivos que voce
  # apagou localmente ficam orfaos no servidor e quebram o build (tar nao remove
  # arquivos que nao estao no pacote novo).
  rm -rf $REMOTE_BACKEND/src $REMOTE_BACKEND/prisma
  rm -rf $REMOTE_FRONTEND/src $REMOTE_FRONTEND/public

  tar -xzf /tmp/docshare-backend.tar.gz -C $REMOTE_BACKEND && rm /tmp/docshare-backend.tar.gz
  tar -xzf /tmp/docshare-frontend.tar.gz -C $REMOTE_FRONTEND && rm /tmp/docshare-frontend.tar.gz

  cd $REMOTE_BACKEND
  npm install
  npx prisma generate
  npx prisma migrate deploy
  npm run build

  cd $REMOTE_FRONTEND
  npm install
  npm run build

  chmod -R o+rX /var/www/docshare
  pm2 restart docshare-backend
  pm2 save
"

rm -f /tmp/docshare-backend.tar.gz /tmp/docshare-frontend.tar.gz

echo "== Deploy concluido: https://docshare.tech =="
