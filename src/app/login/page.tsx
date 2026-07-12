"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccess("Registrasi berhasil! Silakan masuk dengan akun Anda.");
    }
    if (searchParams.get("error")) {
      setError("Email atau kata sandi salah. Silakan coba lagi.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
      });

      if (res?.error) {
        setError("Email atau kata sandi salah");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden">
      {/* Logos Header */}
      <div className="absolute top-0 left-0 w-full flex justify-between items-start px-4 sm:px-6 pt-2 sm:pt-4 z-20 pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="/images/ms-wisata-new-logo.png" 
          alt="Madinah Salam Wisata Logo" 
          className="h-16 sm:h-24 md:h-28 w-auto object-contain pointer-events-auto drop-shadow-lg ml-2 sm:ml-8"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="/images/izin-ppiu.png" 
          alt="Izin PPIU" 
          className="h-20 sm:h-28 md:h-32 w-auto object-contain pointer-events-auto drop-shadow-lg"
        />
      </div>

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
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/80 to-black/60 z-0"></div>

      {/* Content Container (z-10 puts it above the background) */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white drop-shadow-md">
          Masuk ke Akun Anda
        </h2>
        <p className="mt-2 text-center text-sm text-gray-200 drop-shadow">
          Atau{" "}
          <Link
            href="/register"
            className="font-medium text-yellow-400 hover:text-yellow-300 underline underline-offset-2 transition-colors"
          >
            daftar akun baru jika belum punya
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

            {success && (
              <div className="bg-emerald-500/20 backdrop-blur-sm border-l-4 border-emerald-500 p-4 rounded-md">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-emerald-100 font-medium">{success}</p>
                  </div>
                </div>
              </div>
            )}

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
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-lg text-sm font-bold text-emerald-900 bg-yellow-400 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 focus:ring-offset-black/50 disabled:opacity-50 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-emerald-50 flex flex-col justify-center py-12"><div className="text-center text-emerald-900">Memuat...</div></div>}>
      <LoginForm />
    </Suspense>
  );
}
