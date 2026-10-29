import bcrypt from "bcryptjs";
import { prisma } from "../src/config/prisma";

const ADMIN_BADGE = "admin";
const ADMIN_EMAIL = "admin@docshare.local";
const ADMIN_PASSWORD = "admin123";

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      badgeNumber: ADMIN_BADGE,
      email: ADMIN_EMAIL,
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log("Usuario admin pronto:");
  console.log(`  cracha/e-mail: ${admin.badgeNumber} / ${admin.email}`);
  console.log(`  senha: ${ADMIN_PASSWORD} (troque depois do primeiro login)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
