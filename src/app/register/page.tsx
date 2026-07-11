"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nama: "",
    email: "",
    no_hp: "",
    nik: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const images = [
    "/images/bg/makkah_thumbnail.webp",
    "/images/bg/madinah_thumbnail.webp",
    "/images/bg/Thaif_thumbnail.webp",
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(interval);
  }, [images.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      return setError("Konfirmasi password tidak cocok");
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama: form.nama,
          email: form.email,
          no_hp: form.no_hp,
          nik: form.nik,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal melakukan registrasi");
      }

      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Carousel */}
      {images.map((src, idx) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out z-0 ${
            idx === currentImageIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="Background" className="w-full h-full object-cover" />
        </div>
      ))}
      
      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 z-0"></div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white drop-shadow-md">
          Daftar Akun Baru
        </h2>
        <p className="mt-2 text-center text-sm text-gray-200 drop-shadow">
          Atau{" "}
          <Link
            href="/login"
            className="font-medium text-yellow-400 hover:text-yellow-300 underline underline-offset-2 transition-colors"
          >
            masuk jika sudah punya akun
          </Link>
        </p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Glassmorphism Container */}
        <div className="backdrop-blur-md bg-white/10 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/20">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/20 backdrop-blur-sm border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-100 font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="nama"
                className="block text-sm font-medium text-gray-100"
              >
                Nama Lengkap
              </label>
              <div className="mt-1">
                <input
                  id="nama"
                  name="nama"
                  type="text"
                  required
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 bg-black/20 border border-white/20 rounded-md shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 focus:bg-black/40 sm:text-sm transition-all"
                  placeholder="Nama Lengkap Anda"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-100"
              >
                Alamat Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 bg-black/20 border border-white/20 rounded-md shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 focus:bg-black/40 sm:text-sm transition-all"
                  placeholder="email@anda.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="no_hp"
                className="block text-sm font-medium text-gray-100"
              >
                No. HP / WhatsApp
              </label>
              <div className="mt-1">
                <input
                  id="no_hp"
                  name="no_hp"
                  type="text"
                  required
                  value={form.no_hp}
                  onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 bg-black/20 border border-white/20 rounded-md shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 focus:bg-black/40 sm:text-sm transition-all"
                  placeholder="081234567890"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="nik"
                className="block text-sm font-medium text-gray-100"
              >
                NIK (Nomor Induk Kependudukan)
              </label>
              <div className="mt-1">
                <input
                  id="nik"
                  name="nik"
                  type="text"
                  required
                  value={form.nik}
                  onChange={(e) => setForm({ ...form, nik: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 bg-black/20 border border-white/20 rounded-md shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 focus:bg-black/40 sm:text-sm transition-all"
                  placeholder="16 digit NIK Anda"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-100"
              >
                Kata Sandi
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="appearance-none block w-full px-3 py-2 bg-black/20 border border-white/20 rounded-md shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 focus:bg-black/40 sm:text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-100"
              >
                Konfirmasi Kata Sandi
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  className="appearance-none block w-full px-3 py-2 bg-black/20 border border-white/20 rounded-md shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 focus:bg-black/40 sm:text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-lg text-sm font-bold text-emerald-900 bg-yellow-400 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 focus:ring-offset-black/50 disabled:opacity-50 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? "Memproses..." : "Daftar Sekarang"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
