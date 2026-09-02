import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.DEMO_USER_EMAIL ?? "demo@nutrifind.local";

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  console.log("Demo user ready: " + user.email + " (" + user.id + ")");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
