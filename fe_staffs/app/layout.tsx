import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// PrimeReact Styles
import "primereact/resources/themes/lara-light-amber/theme.css";

import AppProvider from "./prime-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BRT Ticket Staff System",
  description: "Phần mềm Bán vé và Quản lý Kiosk Ga cho Nhân viên BRT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} min-h-screen bg-[#F8FAFC] antialiased`}>
        <AppProvider>     
           {children}
        </AppProvider>
      </body>
    </html>
  );
}
