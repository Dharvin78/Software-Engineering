"use client";

import { ReactNode } from "react";
import { Provider } from "@/components/ui/provider";
import { AuthProvider } from "@/contexts/AuthContext";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Provider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Provider>
      </body>
    </html>
  );
}
