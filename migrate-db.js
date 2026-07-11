const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    console.log("Adding jumlah_jamaah column...");
    await prisma.$executeRawUnsafe('ALTER TABLE "RencanaTabungan" ADD COLUMN IF NOT EXISTS "jumlah_jamaah" INTEGER NOT NULL DEFAULT 1;');
    console.log("Column added successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
