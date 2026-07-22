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
      <div className="fixed inset-0 z-0">
        <img 
          src="/images/bg/makkah_thumbnail.webp" 
          alt="Background Makkah" 
          className="w-full h-full object-cover" 
        />

      </div>

      {/* Sidebar for desktop */}
      <div tabIndex={0} className="peer group outline-none hidden md:flex md:flex-col md:fixed md:inset-y-0 transition-all duration-200 ease-in-out md:w-20 hover:md:w-64 focus-within:md:w-64 z-30">
        <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden shadow-2xl border-r border-white/20 bg-emerald-950 backdrop-blur-xl border-emerald-800">
          <div className="relative z-10 flex flex-col flex-1 min-h-0">

            <div className="flex flex-row items-center pt-5 pb-5 flex-shrink-0 px-4 border-b border-white/20 bg-white/10 backdrop-blur-sm transition-all duration-200 justify-center group-hover:justify-start group-focus-within:justify-start group-hover:gap-3 group-focus-within:gap-3">
              <img src="/images/ms-wisata-new-logo.png" alt="Logo" className="h-10 group-hover:h-14 group-focus-within:h-14 w-auto drop-shadow-md shrink-0 transition-all duration-200" />
                <div className="text-left flex flex-col justify-center overflow-hidden transition-all duration-200 ease-in-out max-w-0 opacity-0 group-hover:max-w-[200px] group-focus-within:max-w-[200px] group-hover:opacity-100 group-focus-within:opacity-100">
                  <h1 className="text-sm font-extrabold text-white drop-shadow-sm leading-tight w-[140px]">
                    Tabungan Umrah dan Haji
                  </h1>
                  <p className="text-[11px] font-bold text-yellow-300 drop-shadow-sm mt-0.5 w-[140px]">
                    Madinah Salam Wisata
                  </p>
                </div>
            </div>
          <div className="flex flex-col flex-1 min-h-0">
            <nav className="custom-scrollbar overflow-y-auto flex-1 px-2 py-6 space-y-2">
              {navigation.map((item) => {
                if (item.children) {
                  const isOpen = openMenus.includes(item.name);
                  // Parent menu without active highlight
                  return (
                    <div key={item.name} className="space-y-1 relative">
                      <button
                        onClick={() => toggleMenu(item.name)}
                        className={`group w-full flex items-center py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden backdrop-blur-sm px-0 justify-center group-hover:px-4 group-focus-within:px-4 group-hover:justify-between group-focus-within:justify-between ${
                          isOpen 
                            ? "text-white bg-white/10" 
                            : "text-gray-200 bg-white/5 hover:bg-white/10 hover:text-white"
                        }`}
                        title={item.name}
                      >
                        <div className="flex items-center">
                          <item.icon
                            className={`h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                              isOpen ? "text-white" : "text-gray-300 group-hover:text-white group-focus-within:text-white"
                            }`}
                            aria-hidden="true"
                          />
                          <span className="transition-all duration-200 ease-in-out overflow-hidden whitespace-nowrap w-0 opacity-0 ml-0 group-hover:w-[150px] group-focus-within:w-[150px] group-hover:opacity-100 group-focus-within:opacity-100 group-hover:ml-3 group-focus-within:ml-3 text-left">
                            {item.name}
                          </span>
                        </div>
                        <ChevronDownIcon
                          className={`flex-shrink-0 transition-all duration-200 ease-in-out ${
                            isOpen ? "rotate-180 text-white" : "text-gray-400 group-hover:text-white group-focus-within:text-white"
                          } w-0 opacity-0 ml-0 border-none group-hover:w-4 group-focus-within:w-4 group-hover:opacity-100 group-focus-within:opacity-100 group-hover:ml-3 group-focus-within:ml-3`}
                          aria-hidden="true"
                        />
                      </button>
                      
                      {/* Submenu Dropdown */}
                      <div
                        className={`overflow-hidden transition-all duration-200 ease-in-out max-h-0 opacity-0 ${
                          isOpen ? "group-hover:max-h-96 group-focus-within:max-h-96 group-hover:opacity-100 group-focus-within:opacity-100 group-hover:mt-2 group-focus-within:mt-2" : ""
                        }`}
                      >
                        <div className="space-y-1 pl-2 pr-2">
                          {item.children.map((child: any) => {
                            const isChildActive = pathname === child.href;
                            return (
                              <Link
                                key={child.name}
                                href={child.href}
                                prefetch={true}
                                onClick={(e) => {
                                  if (pathname !== child.href) setIsNavigating(true);
                                }}
                                className={`group flex items-center py-2.5 text-sm font-medium rounded-xl transition-all duration-300 backdrop-blur-sm px-4 ${
                                  isChildActive
                                    ? "text-white bg-white/20 shadow-md font-bold"
                                    : "text-gray-300 bg-white/5 hover:text-white hover:bg-white/10"
                                }`}
                              >
                                {child.name}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                }

                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
                return (
                  <Link
                    key={item.name}
                    href={item.href!}
                    prefetch={true}
                    onClick={(e) => {
                      if (pathname !== item.href) setIsNavigating(true);
                    }}
                    className={`group flex items-center py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden backdrop-blur-sm px-0 justify-center group-hover:px-4 group-focus-within:px-4 group-hover:justify-start group-focus-within:justify-start ${
                      isActive
                        ? "text-white bg-white/20 shadow-md font-bold"
                        : "text-gray-200 bg-white/5 hover:bg-white/10 hover:text-white"
                    }`}
                    title={item.name}
                  >
                    <item.icon
                      className={`h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                        isActive ? "text-white" : "text-gray-300 group-hover:text-white group-focus-within:text-white"
                      }`}
                      aria-hidden="true"
                    />
                    <span className="transition-all duration-200 ease-in-out overflow-hidden whitespace-nowrap w-0 opacity-0 ml-0 group-hover:w-[150px] group-focus-within:w-[150px] group-hover:opacity-100 group-focus-within:opacity-100 group-hover:ml-3 group-focus-within:ml-3 text-left">
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </nav>
            <div className="flex-shrink-0 p-4 border-t border-white/20 bg-black/20 backdrop-blur-md">
              <div className="flex items-center justify-center group-hover:justify-start group-focus-within:justify-start group-hover:mb-4 group-focus-within:mb-4">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white font-bold uppercase drop-shadow-md overflow-hidden shrink-0">
                  {userProfile?.foto_url ? (
                    <img src={userProfile.foto_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    session?.user?.name?.charAt(0) || "U"
                  )}
                </div>
                <div className="truncate transition-all duration-200 ease-in-out overflow-hidden max-w-0 opacity-0 ml-0 group-hover:max-w-[200px] group-focus-within:max-w-[200px] group-hover:opacity-100 group-focus-within:opacity-100 group-hover:ml-3 group-focus-within:ml-3">
                  <p className="text-sm font-medium text-white truncate drop-shadow-md">{session?.user?.name}</p>
                  <p className="text-xs font-medium text-gray-300 truncate drop-shadow-md">{session?.user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center justify-center bg-red-500/20 hover:bg-red-500/30 backdrop-blur-md text-red-100 hover:text-white border border-red-500/30 rounded-xl text-sm font-bold transition-all shadow-sm p-2 mt-4 group-hover:px-4 group-focus-within:px-4 group-hover:py-2.5 group-focus-within:py-2.5 group-hover:mt-0 group-focus-within:mt-0"
                title="Keluar"
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                <span className="transition-all duration-200 ease-in-out overflow-hidden whitespace-nowrap max-w-0 opacity-0 ml-0 group-hover:max-w-[100px] group-focus-within:max-w-[100px] group-hover:opacity-100 group-focus-within:opacity-100 group-hover:ml-2 group-focus-within:ml-2">
                  Keluar
                </span>
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Mobile Top Bar (Banking App Style) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-gradient-to-br from-hijau-900 to-hijau-700 h-16 px-4 flex items-center justify-between shadow-md">
        {pathname === "/dashboard" || pathname === "/dashboard/tabungan" || pathname === "/dashboard/paket" || pathname === "/dashboard/profil" ? (
          /* Main Brand Header */
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-hijau-100 flex items-center justify-center font-serif font-black text-hijau-900 text-sm shadow-sm">
              MS
            </div>
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
              className="text-white hover:text-white/80 p-1 -ml-1 flex items-center justify-center"
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
      <div className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0 transition-all duration-200 ease-in-out md:ml-20 peer-hover:md:ml-64 peer-focus-within:md:ml-64 relative z-10 h-full">
        {/* Instant Loading Overlay */}
        {isNavigating && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
            <div className="flex flex-col items-center gap-3 sm:gap-4 p-5 sm:p-8 bg-white/10 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-xl">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-900/50"></div>
                <div className="absolute inset-0 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin"></div>
              </div>
              <p className="text-sm font-medium text-emerald-300 animate-pulse">Memuat halaman...</p>
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
