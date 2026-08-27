const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.jamaah.updateMany({
    data: { is_verified: true }
  });
  console.log('Updated all existing users to is_verified = true');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
