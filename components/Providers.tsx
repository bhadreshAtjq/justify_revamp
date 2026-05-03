"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--primary)',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 600,
            padding: '12px 24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          }
        }}
      />
    </SessionProvider>
  );
}
