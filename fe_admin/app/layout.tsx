import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppProvider from "./prime-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Admin Workspace | HungYenBRT",
  description: "Trang quản trị cho tuyến xe buýt nhanh BRT Hưng Yên",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className="antialiased font-sans">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
