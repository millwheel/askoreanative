import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { GlobalNavigationBar } from "@/client/components/gnb";
import ToastProvider from "@/client/provider/toastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AsKoreaNative",
  description:
    "Ask real Koreans anything about traveling, food, culture, and daily life in Korea. Get honest answers from locals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GlobalNavigationBar />
        {children}
        <ToastProvider />
        <Analytics />
      </body>
    </html>
  );
}
