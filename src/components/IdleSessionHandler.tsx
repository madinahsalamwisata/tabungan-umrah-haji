"use client";

import { useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import Swal from "sweetalert2";

export default function IdleSessionHandler() {
  const { status } = useSession();
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Hanya aktifkan timer jika user sudah login
    if (status !== "authenticated") return;

    // Waktu idle 15 menit (dalam milidetik)
    const timeoutDuration = 15 * 60 * 1000;

    const handleIdleTimeout = () => {
      // Langsung logout tanpa popup
      signOut({ callbackUrl: "/login" });
    };

    const resetTimeout = () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      timeoutIdRef.current = setTimeout(handleIdleTimeout, timeoutDuration);
    };

    // Jalankan pertama kali
    resetTimeout();

    // Daftar event yang menandakan user aktif
    const events = [
      "mousemove",
      "keydown",
      "wheel",
      "mousedown",
      "touchstart",
      "touchmove",
    ];

    // Tambahkan event listener ke window
    events.forEach((event) => {
      window.addEventListener(event, resetTimeout, { passive: true });
    });

    // Cleanup saat komponen unmount
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, resetTimeout);
      });
    };
  }, [status]);

  return null;
}
