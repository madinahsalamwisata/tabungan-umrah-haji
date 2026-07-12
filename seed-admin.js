const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedAdmin() {
  const email = "madinahsalamwisata@gmail.com";
  const password = "MSwisata2024";

  try {
    const existingAdmin = await prisma.jamaah.findUnique({
      where: { email: email }
    });

    if (existingAdmin) {
      console.log("Admin account already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await prisma.jamaah.create({
      data: {
        nama: "Administrator",
        email: email,
        no_hp: "080000000000",
        nik: "0000000000000000",
        password_hash: hashedPassword,
        alamat: "Sistem Pusat Madinah Salam Wisata",
      }
    });

    console.log("Admin account created successfully!");
  } catch (error) {
    console.error("Error seeding admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
