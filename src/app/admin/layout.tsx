"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Matikan loading saat pathname berubah (selesai navigasi)
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated") {
      if (session?.user?.email !== "madinahsalamwisata@gmail.com") {
        router.replace("/dashboard");
      }
    }
  }, [status, session, router]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsCollapsed(false);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsCollapsed(true);
    }, 400);
  };

  const navigation = [
    { name: "Admin Dashboard", href: "/admin", icon: HomeIcon },
    { name: "Data Jamaah", href: "/admin/jamaah", icon: UsersIcon },
    { name: "Pengumuman", href: "/admin/pengumuman", icon: MegaphoneIcon },
    { name: "Manajemen Paket", href: "/admin/paket", icon: MapIcon },
  ];


  if (status === "loading" || session?.user?.email !== "madinahsalamwisata@gmail.com") {
    return (
      <div className="min-h-screen bg-white/60 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50 flex text-emerald-950 font-sans">
      {/* Sidebar for desktop */}
      <div className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 transition-all duration-300 ${isCollapsed ? 'md:w-20' : 'md:w-64'} z-30`}>
        <div 
          className="flex-1 flex flex-col min-h-0 relative overflow-hidden shadow-2xl border-r border-white/60 bg-white/60"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: "url('/images/bg/madinah_thumbnail.webp')", backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f1712]/90 via-[#0f1712]/80 to-[#0f1712] z-0"></div>
          
          <div className="relative z-10 flex flex-col flex-1 min-h-0">
            <div className={`flex flex-row items-center pt-5 pb-5 flex-shrink-0 px-4 border-b border-white/60 bg-white/40 backdrop-blur-md rounded-b-lg transition-all duration-300 ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
              <img src="/images/ms-wisata-new-logo.png" alt="Logo" className={`${isCollapsed ? 'h-10' : 'h-12'} w-auto drop-shadow-md shrink-0 transition-all duration-300`} />
              <div className={`text-left flex flex-col justify-center overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}>
                <h1 className="text-sm font-extrabold text-emerald-950 drop-shadow-sm leading-tight w-[140px]">
                  Admin Panel
                </h1>
                <p className="text-[10px] font-bold text-emerald-700 drop-shadow-sm mt-0.5 w-[140px] uppercase tracking-wider">
                  Madinah Salam Wisata
                </p>
              </div>
            </div>

            <div className="flex flex-col flex-1 min-h-0">
              <nav className="custom-scrollbar overflow-y-auto flex-1 px-3 py-6 space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href!}
                      prefetch={true}
                      onClick={(e) => {
                        if (pathname !== item.href) setIsNavigating(true);
                        setMobileMenuOpen(false);
                      }}
                      className={`group flex items-center py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden backdrop-blur-sm ${
                        isCollapsed ? 'px-0 justify-center' : 'px-4'
                      } ${
                        isActive
                          ? "text-emerald-950 bg-emerald-600/20 border border-emerald-500/40 shadow-md font-bold"
                          : "text-gray-700 bg-white/40 hover:bg-white/50 hover:text-emerald-950 border border-transparent"
                      }`}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <item.icon
                        className={`h-5 w-5 flex-shrink-0 transition-colors duration-300 ${
                          isActive ? "text-emerald-700" : "text-gray-600 group-hover:text-emerald-700"
                        }`}
                        aria-hidden="true"
                      />
                      <span className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-[150px] opacity-100 ml-3 text-left'}`}>
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </nav>

              <div className="flex-shrink-0 p-4 border-t border-white/60 bg-white/50 backdrop-blur-md">
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'mb-4'}`}>
                  <div className="w-10 h-10 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-700 font-bold uppercase overflow-hidden shrink-0">
                    A
                  </div>
                  <div className={`truncate transition-all duration-300 ease-in-out overflow-hidden ${isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[200px] opacity-100 ml-3'}`}>
                    <p className="text-sm font-semibold text-emerald-950 truncate">Administrator</p>
                    <p className="text-[10px] text-gray-600 truncate">Sistem Pusat</p>
                  </div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className={`w-full flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-bold transition-colors shadow-sm ${
                    isCollapsed ? 'p-2 mt-4' : 'px-4 py-2.5'
                  }`}
                  title="Keluar"
                >
                  <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                  <span className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[100px] opacity-100 ml-2'}`}>
                    Keluar Admin
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full z-40">
        <div className="flex items-center justify-between bg-white/60/90 backdrop-blur-md h-16 px-4 shadow-md border-b border-white/60">
          <div className="flex items-center gap-3">
            <img src="/images/ms-wisata-new-logo.png" alt="Logo" className="h-9 w-auto" />
            <div className="flex flex-col">
              <h1 className="text-sm font-bold text-emerald-950 drop-shadow-md leading-tight">Admin Panel</h1>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-emerald-950 hover:text-gray-800 p-2"
          >
            {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>
        
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-white/60 border-b border-white/60 shadow-xl">
            <div className="px-3 pt-4 pb-6 space-y-2">
              <div className="space-y-2 mt-2">
                <Link href="/admin" prefetch={true} onClick={() => { if (pathname !== '/admin') setIsNavigating(true); setMobileMenuOpen(false); }}>
                  <div className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 font-medium active:scale-95 ${
                    pathname === '/admin' 
                      ? 'bg-emerald-600/20 text-emerald-700 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                      : 'text-gray-600 hover:text-emerald-950 hover:bg-white/40 border border-transparent'
                  }`}>
                    <HomeIcon className="w-5 h-5" />
                    <span className="text-sm">Dashboard</span>
                  </div>
                </Link>
                
                <Link href="/admin/jamaah" prefetch={true} onClick={() => { if (!pathname.startsWith('/admin/jamaah')) setIsNavigating(true); setMobileMenuOpen(false); }}>
                  <div className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 font-medium active:scale-95 ${
                    pathname.startsWith('/admin/jamaah') 
                      ? 'bg-emerald-600/20 text-emerald-700 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                      : 'text-gray-600 hover:text-emerald-950 hover:bg-white/40 border border-transparent'
                  }`}>
                    <UsersIcon className="w-5 h-5" />
                    <span className="text-sm">Data Jamaah</span>
                  </div>
                </Link>

                <Link href="/admin/pengumuman" prefetch={true} onClick={() => { if (!pathname.startsWith('/admin/pengumuman')) setIsNavigating(true); setMobileMenuOpen(false); }}>
                  <div className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 font-medium active:scale-95 ${
                    pathname.startsWith('/admin/pengumuman') 
                      ? 'bg-emerald-600/20 text-emerald-700 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                      : 'text-gray-600 hover:text-emerald-950 hover:bg-white/40 border border-transparent'
                  }`}>
                    <MegaphoneIcon className="w-5 h-5" />
                    <span className="text-sm">Pengumuman</span>
                  </div>
                </Link>

                <Link href="/admin/paket" prefetch={true} onClick={() => { if (!pathname.startsWith('/admin/paket')) setIsNavigating(true); setMobileMenuOpen(false); }}>
                  <div className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 font-medium active:scale-95 ${
                    pathname.startsWith('/admin/paket') 
                      ? 'bg-emerald-600/20 text-emerald-700 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                      : 'text-gray-600 hover:text-emerald-950 hover:bg-white/40 border border-transparent'
                  }`}>
                    <MapIcon className="w-5 h-5" />
                    <span className="text-sm">Manajemen Paket</span>
                  </div>
                </Link>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full text-left mt-4 text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 active:scale-95 transition-transform"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                Keluar Admin
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className={`flex-1 flex flex-col min-w-0 pt-16 md:pt-0 transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'} relative`}>
        {/* Instant Loading Overlay */}
        {isNavigating && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-emerald-50/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 p-8 bg-white/60/90 rounded-2xl shadow-2xl border border-emerald-500/20 backdrop-blur-md">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-900/50"></div>
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
              </div>
              <p className="text-sm font-medium text-emerald-700 animate-pulse">Memuat halaman...</p>
            </div>
          </div>
        )}
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none bg-emerald-50 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function HomeIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function UsersIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
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

function MegaphoneIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
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
