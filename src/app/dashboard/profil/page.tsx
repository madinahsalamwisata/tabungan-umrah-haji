import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileForm from "@/components/ProfileForm";
import Link from "next/link";



export default async function ProfilPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect("/login");
  }

  const jamaah = await prisma.jamaah.findUnique({
    where: { email: session.user.email },
    include: {
      RencanaTabungan: {
        include: {
          paket: true,
          RiwayatSetoran: true
        }
      }
    }
  });

  if (!jamaah) {
    redirect("/login");
  }

  // Because this is a server component passing to client component, 
  // we must avoid passing complex Prisma objects with Dates directly if not serialized,
  // but Strings and nulls are fine.
  const serializedJamaah = {
    id: jamaah.id,
    nama: jamaah.nama,
    email: jamaah.email,
    no_hp: jamaah.no_hp,
    nik: jamaah.nik,
    alamat: jamaah.alamat,
    foto_url: jamaah.foto_url,
  };

  // Riwayat Tabungan removed per user request

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">


      {/* Komponen Form Profil */}
      <ProfileForm jamaah={serializedJamaah} />
    </div>
  );
}
