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
          duration: 4000,
          style: {
            background: '#393E46',
            color: '#F7F7F7',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 500,
            padding: '12px 20px',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            maxWidth: '420px',
          },
          success: {
            iconTheme: {
              primary: '#2D6A4F',
              secondary: '#F7F7F7',
            },
          },
          error: {
            iconTheme: {
              primary: '#C0392B',
              secondary: '#F7F7F7',
            },
          },
        }}
      />
    </SessionProvider>
  );
}
