import { ReactNode } from "react";
import { Providers } from "./providers";

export const metadata = {
  title: "Product Dashboard",
  description: "Asset Managent",
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="light" style={{ colorScheme: "light" }}>
      <body className="chakra-ui-light">
        <Providers>
          <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            {/* Header */}
            <header style={{ background: "#FFFFFF", color: "black", padding: "1rem 1.5rem", boxShadow: "0 1px 2px rgba(0,0,1,0.1)" }}>
              <h1 style={{ margin: 0, fontSize: "1rem" }}>Asset Management Dashboard</h1>
            </header>

            {/* Main Content */}
            <main style={{ flex: 1, padding: "1.5rem 2rem" }}>{children}</main>

            {/* Footer */}
            <footer style={{ background: "#F3F4F6", padding: "0.75rem 0", textAlign: "center" }}>
              © {new Date().getFullYear()} Asset Management System
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
