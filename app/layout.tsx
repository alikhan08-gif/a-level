import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminHotkeyListener from "@/components/AdminHotkeyListener";
import AosInit from "@/components/AosInit";
import MusicPlayer from "@/components/MusicPlayer";
import { CartProvider } from "@/lib/cart-context";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getLocale } from "@/lib/i18n/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Harrington Academy",
  description: "A-Level, Milliy sertifikat va Attestatsiya kurslari",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userId = await getSessionUserId();
  const user = userId
    ? await prisma.user.findUnique({ where: { id: userId }, select: { firstName: true } })
    : null;
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <Header userFirstName={user?.firstName} isLoggedIn={!!userId} locale={locale} />
          <main className="flex-1">{children}</main>
          <Footer />
          <AdminHotkeyListener />
          <AosInit />
          <MusicPlayer locale={locale} />
        </CartProvider>
      </body>
    </html>
  );
}
