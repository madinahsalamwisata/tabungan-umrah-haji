"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Script from "next/script";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
        <p className="text-emerald-900 font-medium text-lg flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-emerald-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Memuat...
        </p>
      </div>
    );
  }

  const navigation = [
    { name: "Beranda", href: "/dashboard", icon: HomeIcon },
    { name: "Profil Saya", href: "/dashboard/profil", icon: UserIcon },
    { name: "Riwayat Tabungan", href: "/dashboard/tabungan", icon: WalletIcon },
    { name: "Paket Umrah", href: "/dashboard/paket", icon: MapIcon },
  ];

  return (
    <div className="min-h-screen bg-white flex text-black">
      <Script 
        src="https://app.sandbox.midtrans.com/snap/snap.js" 
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
      />
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-emerald-900 shadow-xl">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-emerald-950">
            <h1 className="text-xl font-bold text-white truncate">
              Tabungan Umrah
            </h1>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-6 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive
                        ? "bg-emerald-800 text-white border-l-4 border-white"
                        : "text-gray-300 hover:bg-emerald-800 hover:text-white border-l-4 border-transparent"
                    } group flex items-center px-3 py-3 text-sm font-medium rounded-r-md transition-colors`}
                  >
                    <item.icon
                      className={`${
                        isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                      } flex-shrink-0 -ml-1 mr-3 h-6 w-6`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-emerald-800">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-emerald-900 font-bold uppercase">
                  {session?.user?.name?.charAt(0) || "U"}
                </div>
                <div className="ml-3 truncate">
                  <p className="text-sm font-medium text-white truncate">{session?.user?.name}</p>
                  <p className="text-xs font-medium text-gray-300 truncate">{session?.user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-emerald-900 px-4 py-2 rounded-md text-sm font-bold transition-colors shadow-sm"
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                Keluar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header & Nav */}
      <div className="md:hidden fixed top-0 w-full z-10">
        <div className="flex items-center justify-between bg-emerald-900 h-16 px-4 shadow-md">
          <h1 className="text-lg font-bold text-white">
            Tabungan Umrah
          </h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white hover:text-gray-200 p-2"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
        
        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="bg-emerald-900 shadow-xl border-b border-emerald-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`${
                      isActive
                        ? "bg-emerald-800 text-white"
                        : "text-gray-300 hover:bg-emerald-800 hover:text-white"
                    } block px-3 py-2 rounded-md text-base font-medium flex items-center gap-3`}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-400"}`} />
                    {item.name}
                  </Link>
                );
              })}
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full text-left text-gray-300 hover:bg-emerald-800 hover:text-white block px-3 py-2 rounded-md text-base font-medium flex items-center gap-3"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5 text-gray-400" />
                Keluar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0 pt-16 md:pt-0">
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none p-4 sm:p-6 lg:p-8">
          {children}
        </main>
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
