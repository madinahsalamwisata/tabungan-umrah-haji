export default function GlobalLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black/90">
      <div className="flex flex-col items-center justify-center p-8 bg-[#111814]/80 backdrop-blur-md rounded-2xl border border-emerald-500/30 shadow-2xl">
        <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
        <p className="text-emerald-400 font-bold text-lg animate-pulse">Loading...</p>
        <p className="text-emerald-200/60 text-sm mt-1">Harap tunggu sebentar</p>
      </div>
    </div>
  );
}
