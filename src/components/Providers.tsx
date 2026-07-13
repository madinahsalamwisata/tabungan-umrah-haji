"use client";

import { SessionProvider } from "next-auth/react";
import IdleSessionHandler from "./IdleSessionHandler";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <IdleSessionHandler />
      {children}
    </SessionProvider>
  );
}
