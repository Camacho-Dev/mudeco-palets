"use client";

import { SessionProvider } from "next-auth/react";

export function StoreProviders({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
