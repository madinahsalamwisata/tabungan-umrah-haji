const { Client } = require('pg');
const { PrismaClient } = require('@prisma/client');

const supabaseUrl = "postgresql://postgres.cflmxebgehhgsdefvewp:MSwisata2024@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
const prisma = new PrismaClient(); // Connects to MySQL via .env

async function migrateData() {
  const pgClient = new Client({
    connectionString: supabaseUrl,
  });

  try {
    console.log("Connecting to Supabase (PostgreSQL)...");
    await pgClient.connect();
    console.log("Connected to Supabase.");

    console.log("Connecting to Hostinger (MySQL)...");
    await prisma.$connect();
    console.log("Connected to Hostinger.");

    // Migrate Setting
    console.log("Migrating Setting...");
    const settings = await pgClient.query('SELECT * FROM "Setting"');
    if (settings.rows.length > 0) {
      await prisma.setting.createMany({ data: settings.rows, skipDuplicates: true });
    }
    console.log(`Migrated ${settings.rows.length} settings.`);

    // Migrate Pengumuman
    console.log("Migrating Pengumuman...");
    const pengumuman = await pgClient.query('SELECT * FROM "Pengumuman"');
    if (pengumuman.rows.length > 0) {
      await prisma.pengumuman.createMany({ data: pengumuman.rows, skipDuplicates: true });
    }
    console.log(`Migrated ${pengumuman.rows.length} pengumuman.`);

    // Migrate Jamaah
    console.log("Migrating Jamaah...");
    const jamaah = await pgClient.query('SELECT * FROM "Jamaah"');
    if (jamaah.rows.length > 0) {
      await prisma.jamaah.createMany({ data: jamaah.rows, skipDuplicates: true });
    }
    console.log(`Migrated ${jamaah.rows.length} jamaah.`);

    // Migrate Paket
    console.log("Migrating Paket...");
    // Cast Decimal to number for Prisma MySQL insertion if needed, but Prisma usually handles Decimal
    const paket = await pgClient.query('SELECT * FROM "Paket"');
    if (paket.rows.length > 0) {
      await prisma.paket.createMany({ data: paket.rows, skipDuplicates: true });
    }
    console.log(`Migrated ${paket.rows.length} paket.`);

    // Migrate RencanaTabungan
    console.log("Migrating RencanaTabungan...");
    const rencana = await pgClient.query('SELECT * FROM "RencanaTabungan"');
    if (rencana.rows.length > 0) {
      await prisma.rencanaTabungan.createMany({ data: rencana.rows, skipDuplicates: true });
    }
    console.log(`Migrated ${rencana.rows.length} rencana tabungan.`);

    // Migrate RiwayatSetoran
    console.log("Migrating RiwayatSetoran...");
    const riwayat = await pgClient.query('SELECT * FROM "RiwayatSetoran"');
    if (riwayat.rows.length > 0) {
      await prisma.riwayatSetoran.createMany({ data: riwayat.rows, skipDuplicates: true });
    }
    console.log(`Migrated ${riwayat.rows.length} riwayat setoran.`);

    console.log("Migration completed successfully!");

  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    await pgClient.end();
    await prisma.$disconnect();
  }
}

migrateData();
