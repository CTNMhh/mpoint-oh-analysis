'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import AdminHeader from "./components/layout/AdminHeader";
import AdminFooter from "./components/layout/AdminFooter";
import { AuthProvider } from "./context/AuthContext";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import { CartProvider } from "@/context/CartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <AuthProvider>
            <CartProvider>
              {isAdmin ? <AdminHeader /> : <Header />}
              {children}
              {isAdmin ? <AdminFooter /> : <Footer />}
            </CartProvider>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
