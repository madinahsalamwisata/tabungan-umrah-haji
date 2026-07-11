const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  await prisma.paket.updateMany({
    data: { kuota: 29 }
  });
  console.log("Kuota updated to 29");
}
run();
