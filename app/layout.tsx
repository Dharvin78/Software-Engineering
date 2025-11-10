"use client";

import { ReactNode } from "react";
import { Provider } from "@/components/ui/provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { AssetsProvider } from "@/contexts/AssetsContext";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Provider>
          <AuthProvider>
            <AssetsProvider> 
              {children}
            </AssetsProvider>
          </AuthProvider>
        </Provider>
      </body>
    </html>
  );
}