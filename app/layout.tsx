import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "QA Issue Reporter",
  description: "Report QA issues straight to GitHub.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased text-ink">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
