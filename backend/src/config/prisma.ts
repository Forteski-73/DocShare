import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { env } from "./env";

// MySQL 8 usa "caching_sha2_password" por padrao, que exige troca de chave RSA
// para enviar a senha com seguranca. Sem isso, toda conexao falha (mesmo com a
// senha certa) e o Prisma reporta isso como "pool timeout" generico, escondendo
// a causa real.
const databaseUrl = new URL(env.DATABASE_URL);
databaseUrl.searchParams.set("allowPublicKeyRetrieval", "true");

const adapter = new PrismaMariaDb(databaseUrl.toString());

export const prisma = new PrismaClient({ adapter });
