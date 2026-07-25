const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    console.log("Running migrations...");
    console.log("Adding jumlah_jamaah column...");
    await prisma.$executeRawUnsafe('ALTER TABLE "RencanaTabungan" ADD COLUMN IF NOT EXISTS "jumlah_jamaah" INTEGER NOT NULL DEFAULT 1;');
    
    console.log("Adding paket_snapshot_nama column...");
    await prisma.$executeRawUnsafe('ALTER TABLE "RencanaTabungan" ADD COLUMN IF NOT EXISTS "paket_snapshot_nama" TEXT;');
    
    console.log("Adding paket_snapshot_is_estimasi column...");
    await prisma.$executeRawUnsafe('ALTER TABLE "RencanaTabungan" ADD COLUMN IF NOT EXISTS "paket_snapshot_is_estimasi" BOOLEAN;');
    
    console.log("Adding paket_snapshot_tanggal_berangkat column...");
    await prisma.$executeRawUnsafe('ALTER TABLE "RencanaTabungan" ADD COLUMN IF NOT EXISTS "paket_snapshot_tanggal_berangkat" TIMESTAMP;');
    
    console.log("Adding paket_snapshot_tanggal_kepulangan column...");
    await prisma.$executeRawUnsafe('ALTER TABLE "RencanaTabungan" ADD COLUMN IF NOT EXISTS "paket_snapshot_tanggal_kepulangan" TIMESTAMP;');
    
    console.log("Adding paket_snapshot_maskapai column...");
    await prisma.$executeRawUnsafe('ALTER TABLE "RencanaTabungan" ADD COLUMN IF NOT EXISTS "paket_snapshot_maskapai" TEXT;');
    
    console.log("Migrations run successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
