export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pb-20">
      <div className="w-16 h-16 border-4 border-hijau-100 border-t-hijau-600 rounded-full animate-spin mb-4"></div>
      <p className="text-teks-500 font-medium text-sm animate-pulse">Memuat data...</p>
    </div>
  );
}
