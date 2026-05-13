import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hung Yen BRT - Gate Scanner",
  description: "Terminal Gate Station for BRT System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} min-h-screen bg-[#FDFBF7] antialiased`}>
        {children}
      </body>
    </html>
  );
}
