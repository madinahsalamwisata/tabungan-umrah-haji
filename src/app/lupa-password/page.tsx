"use client";

import { useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";

export default function LupaPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/lupa-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        Swal.fire({
          icon: "success",
          title: "Email Terkirim!",
          text: data.message || "Silakan periksa kotak masuk email Anda untuk instruksi selanjutnya.",
          confirmButtonColor: "#059669",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: data.error || "Gagal mengirim permintaan reset password.",
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
          Lupa Kata Sandi?
        </h2>
        <p className="mt-2 text-center text-sm text-gray-800 drop-shadow">
          Masukkan alamat email Anda yang terdaftar. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi.
        </p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="backdrop-blur-md bg-white/50 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/70">
          {success ? (
            <div className="text-center space-y-6">
              <div className="bg-emerald-500/20 backdrop-blur-sm border border-emerald-500 p-4 rounded-xl">
                <p className="text-emerald-900 font-medium">
                  Tautan pemulihan telah dikirim ke <span className="font-bold text-emerald-950">{email}</span>
                </p>
              </div>
              <p className="text-sm text-gray-700">
                Silakan periksa kotak masuk (atau folder spam) Anda.
              </p>
              <Link
                href="/login"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-lg text-sm font-bold text-emerald-900 bg-yellow-400 hover:bg-yellow-300 transition-all"
              >
                Kembali ke halaman Login
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-100">
                  Alamat Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 bg-white/40 border border-white/70 rounded-md shadow-sm placeholder-gray-400 text-emerald-950 focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 focus:bg-white/60 sm:text-sm transition-all"
                    placeholder="email@anda.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-lg text-sm font-bold text-emerald-900 bg-yellow-400 hover:bg-yellow-300 focus:outline-none disabled:opacity-50 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? "Mengirim..." : "Kirim Tautan Reset"}
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
