"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Jamaah = {
  id: string;
  nama: string;
  email: string;
  no_hp: string;
  nik: string;
  alamat: string | null;
};

export default function ProfileForm({ jamaah }: { jamaah: Jamaah }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    nama: jamaah.nama,
    no_hp: jamaah.no_hp,
    nik: jamaah.nik,
    alamat: jamaah.alamat || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/profil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal memperbarui profil");
      }

      setSuccess("Profil berhasil diperbarui!");
      setIsEditing(false);
      router.refresh(); // Refresh the page to get the latest data from server
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg border-t-4 border-emerald-600">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-emerald-900">
            Data Diri Jamaah
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-emerald-600">
            Informasi pribadi dan kontak yang terdaftar.
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-900 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-900"
          >
            Edit Profil
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 m-4">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <div className="border-t border-emerald-100">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-emerald-700">Email (Tidak bisa diubah)</label>
                <input
                  type="text"
                  disabled
                  value={jamaah.email}
                  className="mt-1 block w-full px-3 py-2 border border-emerald-200 rounded-md shadow-sm bg-emerald-50 text-emerald-500 sm:text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="nama" className="block text-sm font-medium text-emerald-700">Nama Lengkap</label>
                <input
                  type="text"
                  id="nama"
                  required
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-emerald-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-900 focus:border-emerald-900 sm:text-sm text-black"
                />
              </div>

              <div>
                <label htmlFor="no_hp" className="block text-sm font-medium text-emerald-700">No. HP / WhatsApp</label>
                <input
                  type="text"
                  id="no_hp"
                  required
                  value={form.no_hp}
                  onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-emerald-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-900 focus:border-emerald-900 sm:text-sm text-black"
                />
              </div>

              <div>
                <label htmlFor="nik" className="block text-sm font-medium text-emerald-700">NIK</label>
                <input
                  type="text"
                  id="nik"
                  required
                  value={form.nik}
                  onChange={(e) => setForm({ ...form, nik: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-emerald-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-900 focus:border-emerald-900 sm:text-sm text-black"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="alamat" className="block text-sm font-medium text-emerald-700">Alamat Lengkap</label>
                <textarea
                  id="alamat"
                  rows={3}
                  value={form.alamat}
                  onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-emerald-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-900 focus:border-emerald-900 sm:text-sm text-black"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setForm({
                    nama: jamaah.nama,
                    no_hp: jamaah.no_hp,
                    nik: jamaah.nik,
                    alamat: jamaah.alamat || "",
                  });
                }}
                className="bg-white py-2 px-4 border border-emerald-300 rounded-md shadow-sm text-sm font-medium text-emerald-700 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-900"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-900 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-900 disabled:opacity-50"
              >
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        ) : (
          <dl className="divide-y divide-emerald-100">
            <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 hover:bg-emerald-50/50 transition-colors">
              <dt className="text-sm font-medium text-emerald-500">Nama Lengkap</dt>
              <dd className="mt-1 text-sm text-emerald-900 sm:mt-0 sm:col-span-2 font-medium">{jamaah.nama}</dd>
            </div>
            <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 hover:bg-emerald-50/50 transition-colors">
              <dt className="text-sm font-medium text-emerald-500">Alamat Email</dt>
              <dd className="mt-1 text-sm text-emerald-900 sm:mt-0 sm:col-span-2 font-medium">{jamaah.email}</dd>
            </div>
            <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 hover:bg-emerald-50/50 transition-colors">
              <dt className="text-sm font-medium text-emerald-500">No. HP / WhatsApp</dt>
              <dd className="mt-1 text-sm text-emerald-900 sm:mt-0 sm:col-span-2 font-medium">{jamaah.no_hp}</dd>
            </div>
            <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 hover:bg-emerald-50/50 transition-colors">
              <dt className="text-sm font-medium text-emerald-500">Nomor Induk Kependudukan (NIK)</dt>
              <dd className="mt-1 text-sm text-emerald-900 sm:mt-0 sm:col-span-2 font-medium">{jamaah.nik}</dd>
            </div>
            <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 hover:bg-emerald-50/50 transition-colors">
              <dt className="text-sm font-medium text-emerald-500">Alamat Lengkap</dt>
              <dd className="mt-1 text-sm text-emerald-900 sm:mt-0 sm:col-span-2 font-medium">{jamaah.alamat || "-"}</dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}
