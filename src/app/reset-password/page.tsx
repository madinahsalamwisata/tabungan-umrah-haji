"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Token Tidak Valid",
        text: "Link reset kata sandi tidak valid atau tidak ditemukan.",
      });
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Perhatian",
        text: "Kata sandi dan konfirmasi kata sandi tidak cocok.",
      });
      return;
    }

    if (password.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Perhatian",
        text: "Kata sandi minimal 6 karakter.",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Kata sandi Anda berhasil diperbarui. Silakan masuk dengan kata sandi baru.",
          confirmButtonColor: "#059669",
        }).then(() => {
          router.push("/login");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: data.error || "Gagal mengubah kata sandi.",
          confirmButtonColor: "#059669",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Terjadi kesalahan pada sistem.",
        confirmButtonColor: "#059669",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/bg/makkah_thumbnail.webp" alt="Background" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/80 to-black/60 z-0"></div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-emerald-950 drop-shadow-md">
          Buat Kata Sandi Baru
        </h2>
        <p className="mt-2 text-center text-sm text-gray-800 drop-shadow">
          Silakan masukkan kata sandi baru Anda. Pastikan mudah diingat dan aman.
        </p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="backdrop-blur-md bg-white/50 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/70">
          {!token ? (
            <div className="text-center space-y-6">
              <div className="bg-red-500/20 backdrop-blur-sm border border-red-500 p-4 rounded-xl">
                <p className="text-red-100 font-medium">Token Reset Tidak Ditemukan</p>
              </div>
              <p className="text-sm text-gray-700">
                URL yang Anda kunjungi tidak memiliki token yang valid.
              </p>
              <Link
                href="/lupa-password"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-lg text-sm font-bold text-emerald-900 bg-yellow-400 hover:bg-yellow-300 transition-all"
              >
                Minta Link Baru
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-100">
                  Kata Sandi Baru
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 bg-white/40 border border-white/70 rounded-md shadow-sm placeholder-gray-400 text-emerald-950 focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 focus:bg-white/60 sm:text-sm transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-100">
                  Konfirmasi Kata Sandi Baru
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 bg-white/40 border border-white/70 rounded-md shadow-sm placeholder-gray-400 text-emerald-950 focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 focus:bg-white/60 sm:text-sm transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || !password || !confirmPassword}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-lg text-sm font-bold text-emerald-900 bg-yellow-400 hover:bg-yellow-300 focus:outline-none disabled:opacity-50 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? "Menyimpan..." : "Simpan Kata Sandi"}
                </button>
              </div>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-700 hover:text-emerald-950 transition-colors"
                >
                  Batal dan kembali ke Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-emerald-950">Memuat...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
