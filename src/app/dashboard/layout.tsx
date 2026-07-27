"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<{ foto_url?: string | null } | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Matikan loading saat pathname berubah (selesai navigasi)
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  const fetchProfile = () => {
    if (session?.user?.email && session.user.email !== "madinahsalamwisata@gmail.com") {
      fetch("/api/profil/me")
        .then(res => res.json())
        .then(data => setUserProfile(data))
        .catch(err => console.error("Failed to fetch profile:", err));
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.email === "madinahsalamwisata@gmail.com") {
        router.replace("/admin");
        return;
      }
      fetchProfile();
    }
    
    window.addEventListener('profileUpdated', fetchProfile);
    return () => window.removeEventListener('profileUpdated', fetchProfile);
  }, [status, session]);

  const toggleMenu = (name: string) => {
    setOpenMenus(prev => prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]);
  };

  const navigation = [
    { name: "Beranda", href: "/dashboard", icon: HomeIcon },
    { name: "Profil Saya", href: "/dashboard/profil", icon: UserIcon },
    { 
      name: "Tabungan", 
      icon: WalletIcon,
      children: [
        { name: "Tabungan Umrah", href: "/dashboard/tabungan", short: "TU" },
        { name: "Tabungan Haji", href: "/dashboard/tabungan/haji", short: "TH" },
      ]
    },
    { 
      name: "Paket", 
      icon: MapIcon,
      children: [
        { name: "Paket Umrah", href: "/dashboard/paket", short: "PU" },
        { name: "Paket Haji", href: "/dashboard/paket/haji", short: "PH" },
      ]
    },
  ];

  useEffect(() => {
    navigation.forEach(item => {
      if (item.children) {
        const isChildActive = item.children.some(child => 
          pathname === child.href
        );
        if (isChildActive && !openMenus.includes(item.name)) {
          setOpenMenus(prev => [...prev, item.name]);
        }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div className="fixed inset-0 flex text-white font-sans overflow-hidden">
      <div className="fixed inset-0 z-0 bg-white md:bg-slate-50"></div>

      {/* Sidebar for desktop */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-[264px] z-30 bg-white border-r border-garis">
        {/* Sidebar Head */}
        <div className="bg-gradient-to-br from-hijau-900 to-hijau-700 px-5 py-[26px] flex items-center gap-3 shrink-0">
          <img 
            src="/ms-wisata-new-logo.png" 
            alt="MS Wisata Logo" 
            className="w-[42px] h-[42px] rounded-xl bg-white/10 p-1 object-contain shrink-0 border border-white/15" 
          />
          <div className="text-left flex flex-col justify-center">
            <h1 className="text-sm font-bold text-white leading-tight">
              Tabungan Umrah &amp; Haji
            </h1>
            <p className="text-[11px] font-medium text-white/60 mt-0.5">
              Madinah Salam Wisata
            </p>
          </div>
        </div>

        {/* Sidebar Body */}
        <div className="flex-1 flex flex-col min-h-0 px-4 pt-[22px] pb-4 text-slate-800 overflow-hidden">
          <nav className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-1 pb-4">
            {/* Menu Utama Group */}
            <div className="text-[10.5px] uppercase tracking-wider text-teks-300 font-extrabold mt-2 mb-2 mx-3">Menu Utama</div>
            
            {/* Beranda Link */}
            <Link
              href="/dashboard"
              prefetch={true}
              onClick={() => { if (pathname !== "/dashboard") setIsNavigating(true); }}
              className={`group flex items-center py-2.5 px-3 text-[13.5px] font-semibold rounded-xl transition-all duration-200 gap-3 ${
                pathname === "/dashboard"
                  ? "text-hijau-900 bg-hijau-100 font-bold"
                  : "text-teks-500 hover:bg-krem hover:text-teks-900"
              }`}
            >
              <HomeIcon className={`h-[18px] w-[18px] flex-shrink-0 transition-colors duration-200 ${pathname === "/dashboard" ? "text-hijau-800" : "text-teks-300 group-hover:text-teks-900"}`} />
              <span className="font-sans">Beranda</span>
            </Link>

            {/* Tabungan Link (Dropdown) */}
            {(() => {
              const isTabunganActive = pathname.startsWith("/dashboard/tabungan");
              const isOpen = openMenus.includes("Tabungan") || isTabunganActive;
              return (
                <div className="space-y-0.5">
                  <button
                    onClick={() => toggleMenu("Tabungan")}
                    className={`group w-full flex items-center py-2.5 px-3 text-[13.5px] font-semibold rounded-xl transition-all duration-200 justify-between ${
                      isOpen
                        ? "text-hijau-900 bg-hijau-100/50"
                        : "text-teks-500 hover:bg-krem hover:text-teks-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <WalletIcon className={`h-[18px] w-[18px] flex-shrink-0 transition-colors duration-200 ${isOpen ? "text-hijau-800" : "text-teks-300 group-hover:text-teks-900"}`} />
                      <span className="font-sans">Tabungan</span>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-hijau-800" : "text-teks-300 group-hover:text-teks-900"}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-200 ease-in-out pl-[30px] space-y-0.5 ${isOpen ? "max-h-40 mt-0.5 mb-1.5" : "max-h-0"}`}>
                    <Link
                      href="/dashboard/tabungan/umrah"
                      prefetch={true}
                      onClick={() => { if (pathname !== "/dashboard/tabungan/umrah") setIsNavigating(true); }}
                      className={`flex items-center py-2 px-3 text-[12.5px] font-semibold rounded-xl transition-all duration-200 ${
                        pathname === "/dashboard/tabungan/umrah"
                          ? "text-hijau-900 bg-hijau-100 font-bold"
                          : "text-teks-500 hover:text-teks-900 hover:bg-krem"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-teks-300 mr-2 shrink-0"></span>
                      Tabungan Umrah
                    </Link>
                    <Link
                      href="/dashboard/tabungan/haji"
                      prefetch={true}
                      onClick={() => { if (pathname !== "/dashboard/tabungan/haji") setIsNavigating(true); }}
                      className={`flex items-center py-2 px-3 text-[12.5px] font-semibold rounded-xl transition-all duration-200 ${
                        pathname === "/dashboard/tabungan/haji"
                          ? "text-hijau-900 bg-hijau-100 font-bold"
                          : "text-teks-500 hover:text-teks-900 hover:bg-krem"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-teks-300 mr-2 shrink-0"></span>
                      Tabungan Haji
                    </Link>
                  </div>
                </div>
              );
            })()}

            {/* Paket Link (Dropdown) */}
            {(() => {
              const isPaketActive = pathname.startsWith("/dashboard/paket");
              const isOpen = openMenus.includes("Paket") || isPaketActive;
              return (
                <div className="space-y-0.5">
                  <button
                    onClick={() => toggleMenu("Paket")}
                    className={`group w-full flex items-center py-2.5 px-3 text-[13.5px] font-semibold rounded-xl transition-all duration-200 justify-between ${
                      isOpen
                        ? "text-hijau-900 bg-hijau-100/50"
                        : "text-teks-500 hover:bg-krem hover:text-teks-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MapIcon className={`h-[18px] w-[18px] flex-shrink-0 transition-colors duration-200 ${isOpen ? "text-hijau-800" : "text-teks-300 group-hover:text-teks-900"}`} />
                      <span className="font-sans">Paket</span>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-hijau-800" : "text-teks-300 group-hover:text-teks-900"}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-200 ease-in-out pl-[30px] space-y-0.5 ${isOpen ? "max-h-40 mt-0.5 mb-1.5" : "max-h-0"}`}>
                    <Link
                      href="/dashboard/paket/umrah"
                      prefetch={true}
                      onClick={() => { if (pathname !== "/dashboard/paket/umrah") setIsNavigating(true); }}
                      className={`flex items-center py-2 px-3 text-[12.5px] font-semibold rounded-xl transition-all duration-200 ${
                        pathname === "/dashboard/paket/umrah"
                          ? "text-hijau-900 bg-hijau-100 font-bold"
                          : "text-teks-500 hover:text-teks-900 hover:bg-krem"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-teks-300 mr-2 shrink-0"></span>
                      Paket Umrah
                    </Link>
                    <Link
                      href="/dashboard/paket/haji"
                      prefetch={true}
                      onClick={() => { if (pathname !== "/dashboard/paket/haji") setIsNavigating(true); }}
                      className={`flex items-center py-2 px-3 text-[12.5px] font-semibold rounded-xl transition-all duration-200 ${
                        pathname === "/dashboard/paket/haji"
                          ? "text-hijau-900 bg-hijau-100 font-bold"
                          : "text-teks-500 hover:text-teks-900 hover:bg-krem"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-teks-300 mr-2 shrink-0"></span>
                      Paket Haji
                    </Link>
                  </div>
                </div>
              );
            })()}

            {/* Riwayat Tabungan Link */}
            <Link
              href="/dashboard/riwayat-tabungan"
              prefetch={true}
              onClick={() => { if (pathname !== "/dashboard/riwayat-tabungan") setIsNavigating(true); }}
              className={`group flex items-center py-2.5 px-3 text-[13.5px] font-semibold rounded-xl transition-all duration-200 gap-3 ${
                pathname === "/dashboard/riwayat-tabungan"
                  ? "text-hijau-900 bg-hijau-100 font-bold"
                  : "text-teks-500 hover:bg-krem hover:text-teks-900"
              }`}
            >
              <svg className={`h-[18px] w-[18px] flex-shrink-0 stroke-[2.1] fill-none transition-colors duration-200 ${pathname === "/dashboard/riwayat-tabungan" ? "stroke-hijau-800" : "stroke-teks-300 group-hover:stroke-teks-900"}`} viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg>
              <span className="font-sans">Riwayat Tabungan</span>
            </Link>

            {/* Akun Group */}
            <div className="text-[10.5px] uppercase tracking-wider text-teks-300 font-extrabold mt-6 mb-2 mx-3">Akun</div>

            {/* Profil Saya Link */}
            <Link
              href="/dashboard/profil"
              prefetch={true}
              onClick={() => { if (pathname !== "/dashboard/profil") setIsNavigating(true); }}
              className={`group flex items-center py-2.5 px-3 text-[13.5px] font-semibold rounded-xl transition-all duration-200 gap-3 ${
                pathname === "/dashboard/profil"
                  ? "text-hijau-900 bg-hijau-100 font-bold"
                  : "text-teks-500 hover:bg-krem hover:text-teks-900"
              }`}
            >
              <UserIcon className={`h-[18px] w-[18px] flex-shrink-0 transition-colors duration-200 ${pathname === "/dashboard/profil" ? "text-hijau-800" : "text-teks-300 group-hover:text-teks-900"}`} />
              <span className="font-sans">Profil Saya</span>
            </Link>

            {/* Tentang Kami Link */}
            <Link
              href="/dashboard/tentang-kami"
              prefetch={true}
              onClick={() => { if (pathname !== "/dashboard/tentang-kami") setIsNavigating(true); }}
              className={`group flex items-center py-2.5 px-3 text-[13.5px] font-semibold rounded-xl transition-all duration-200 gap-3 ${
                pathname === "/dashboard/tentang-kami"
                  ? "text-hijau-900 bg-hijau-100 font-bold"
                  : "text-teks-500 hover:bg-krem hover:text-teks-900"
              }`}
            >
              <svg className={`h-[18px] w-[18px] flex-shrink-0 stroke-[2.1] transition-colors duration-200 ${pathname === "/dashboard/tentang-kami" ? "text-hijau-800 stroke-hijau-800" : "text-teks-300 stroke-teks-300 group-hover:stroke-teks-900 group-hover:text-teks-900"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              <span className="font-sans">Tentang Kami</span>
            </Link>

            {/* Syarat & Ketentuan Link */}
            <Link
              href="/dashboard/syarat-ketentuan"
              prefetch={true}
              onClick={() => { if (pathname !== "/dashboard/syarat-ketentuan") setIsNavigating(true); }}
              className={`group flex items-center py-2.5 px-3 text-[13.5px] font-semibold rounded-xl transition-all duration-200 gap-3 ${
                pathname === "/dashboard/syarat-ketentuan"
                  ? "text-hijau-900 bg-hijau-100 font-bold"
                  : "text-teks-500 hover:bg-krem hover:text-teks-900"
              }`}
            >
              <svg className={`h-[18px] w-[18px] flex-shrink-0 stroke-[2.1] fill-none transition-colors duration-200 ${pathname === "/dashboard/syarat-ketentuan" ? "stroke-hijau-800" : "stroke-teks-300 group-hover:stroke-teks-900"}`} viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
              <span className="font-sans">Syarat &amp; Ketentuan</span>
            </Link>
          </nav>

          {/* Sidebar Foot */}
          <div className="pt-4 border-t border-garis shrink-0 mt-auto">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-[13px] font-bold text-[#B3423A] hover:bg-[#FBEAE8] transition-colors text-left"
            >
              <svg className="w-4 h-4 stroke-[#B3423A] stroke-[2.1] fill-none" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Keluar dari Akun
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar (Banking App Style) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-gradient-to-br from-hijau-900 to-hijau-700 h-16 px-4 flex items-center justify-between shadow-md">
        {pathname === "/dashboard" || pathname === "/dashboard/tabungan" || pathname === "/dashboard/paket" || pathname === "/dashboard/profil" ? (
          /* Main Brand Header */
          <div className="flex items-center gap-2">
            <img src="/images/ms-wisata-new-logo.png" alt="Logo MS" className="h-9 w-auto object-contain drop-shadow-md" />
            <div className="flex flex-col">
              <h1 className="text-sm font-bold text-white leading-tight">
                Tabungan Umrah &amp; Haji
              </h1>
              <p className="text-[10px] text-white/70">
                Madinah Salam Wisata
              </p>
            </div>
          </div>
        ) : (
          /* Sub-page Header with Back Button */
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (pathname.startsWith("/dashboard/tabungan/")) {
                  router.push("/dashboard/tabungan");
                } else if (pathname.startsWith("/dashboard/paket/")) {
                  router.push("/dashboard/paket");
                } else {
                  router.push("/dashboard");
                }
              }}
              className="text-white hover:text-white/80 p-3 -ml-3 active:scale-95 transition-transform flex items-center justify-center cursor-pointer touch-manipulation"
              aria-label="Kembali"
            >
              <svg className="w-6 h-6 stroke-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            <h1 className="text-base font-bold text-white">
              {(() => {
                if (pathname === "/dashboard/tabungan/baru") return "Setor Baru";
                if (pathname === "/dashboard/tabungan/haji") return "Tabungan Haji";
                if (pathname === "/dashboard/tabungan") return "Tabungan Umrah";
                if (pathname === "/dashboard/paket") return "Paket Umrah";
                if (pathname === "/dashboard/paket/haji") return "Paket Haji";
                if (pathname === "/dashboard/profil") return "Profil Saya";
                if (pathname === "/dashboard/tentang-kami") return "Tentang Kami";
                if (pathname === "/dashboard/lokasi") return "Lokasi Kantor";
                if (pathname === "/dashboard/informasi") return "Informasi & Update";
                return "Kembali";
              })()}
            </h1>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <Link href="/dashboard/informasi" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center relative">
            <svg className="w-5 h-5 stroke-white" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <div className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-emas border border-hijau-900"></div>
          </Link>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0 transition-all duration-200 ease-in-out md:ml-[264px] relative z-10 h-full text-slate-800">
        {/* Desktop Top Bar */}
        <header className="hidden md:flex h-[76px] shrink-0 bg-white border-b border-garis items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center gap-3 bg-krem border border-garis rounded-xl px-3.5 py-2 w-[320px]">
            <svg className="w-4 h-4 text-teks-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input type="text" placeholder="Cari paket, transaksi, atau info..." className="border-none bg-transparent outline-none text-xs w-full text-teks-900 placeholder-teks-300 font-sans" />
          </div>

          <div className="flex items-center gap-[18px]">
            <Link href="/dashboard/informasi" className="w-10 h-10 rounded-full bg-hijau-100 flex items-center justify-center relative cursor-pointer active:scale-95 transition-transform">
              <svg className="w-[18px] h-[18px] text-hijau-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <div className="absolute top-[9px] right-[10px] w-[7px] h-[7px] rounded-full bg-emas-deep border border-white"></div>
            </Link>

            <Link href="/dashboard/profil" className="flex items-center gap-2.5 cursor-pointer">
              <div className="w-[38px] h-[38px] rounded-full border-2 border-hijau-100 overflow-hidden">
                {userProfile?.foto_url ? (
                  <img src={userProfile.foto_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs uppercase">
                    {session?.user?.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-teks-900 leading-snug">{session?.user?.name || "Jamaah"}</p>
                <p className="text-[11px] text-teks-500">Jamaah Terdaftar</p>
              </div>
              <svg className="w-3.5 h-3.5 text-teks-300 ml-1 stroke-[2.4]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </Link>
          </div>
        </header>

        {/* Instant Loading Overlay */}
        {isNavigating && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-sm px-4 transition-all duration-300">
            <div className="flex items-center gap-3 py-3 px-5 bg-emerald-950 rounded-full shadow-2xl border border-emerald-800">
              <div className="relative w-5 h-5">
                <div className="absolute inset-0 rounded-full border-2 border-emerald-800"></div>
                <div className="absolute inset-0 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin"></div>
              </div>
              <p className="text-xs font-bold text-white tracking-wide animate-pulse">Memuat...</p>
            </div>
          </div>
        )}
        <main className={`flex-1 relative z-0 overflow-y-auto focus:outline-none p-4 sm:p-6 lg:p-8 ${
          pathname === "/dashboard" || pathname === "/dashboard/tabungan" || pathname === "/dashboard/paket" || pathname === "/dashboard/profil" || pathname === "/dashboard/tabungan/haji" || pathname === "/dashboard/paket/haji"
            ? "pb-24 md:pb-8"
            : "pb-20 md:pb-8"
        }`}>
          {children}
        </main>

        {/* Mobile Bottom Navigation (Visible on Main Pages only) */}
        {(() => {
          const isMainPage = pathname === "/dashboard" || pathname === "/dashboard/tabungan" || pathname === "/dashboard/paket" || pathname === "/dashboard/profil" || pathname === "/dashboard/tabungan/haji" || pathname === "/dashboard/paket/haji";
          if (!isMainPage) return null;
          return (
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-garis rounded-t-[24px] shadow-[0_-14px_30px_-18px_rgba(11,61,48,0.35)] flex py-2 px-1 z-40 pb-safe">
              <Link 
                href="/dashboard" 
                onClick={() => { if (pathname !== "/dashboard") setIsNavigating(true); }}
                className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl transition-all ${pathname === "/dashboard" ? "text-hijau-800 font-bold animate-pulse-subtle" : "text-teks-300"}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <path d="M9 22V12h6v10" />
                </svg>
                <span className="text-[10px]">Beranda</span>
              </Link>
              <Link 
                href="/dashboard/tabungan" 
                onClick={() => { if (pathname !== "/dashboard/tabungan") setIsNavigating(true); }}
                className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl transition-all ${pathname.startsWith("/dashboard/tabungan") ? "text-hijau-800 font-bold" : "text-teks-300"}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                <span className="text-[10px]">Tabungan</span>
              </Link>
              <Link 
                href="/dashboard/paket" 
                onClick={() => { if (pathname !== "/dashboard/paket") setIsNavigating(true); }}
                className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl transition-all ${pathname.startsWith("/dashboard/paket") ? "text-hijau-800 font-bold" : "text-teks-300"}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                  <line x1="8" y1="2" x2="8" y2="18" />
                  <line x1="16" y1="6" x2="16" y2="22" />
                </svg>
                <span className="text-[10px]">Paket</span>
              </Link>
              <Link 
                href="/dashboard/profil" 
                onClick={() => { if (pathname !== "/dashboard/profil") setIsNavigating(true); }}
                className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl transition-all ${pathname === "/dashboard/profil" ? "text-hijau-800 font-bold" : "text-teks-300"}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span className="text-[10px]">Profil</span>
              </Link>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// Icons components to keep it standalone without external dependencies
function HomeIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function UserIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function WalletIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
    </svg>
  );
}

function MapIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
    </svg>
  );
}

function Bars3Icon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function XMarkIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ArrowLeftOnRectangleIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  );
}

function ChevronDownIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}
