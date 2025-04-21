import "@styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

export const metadata: Metadata = {
  title: "Nexus - Agregador de Links",
  description:
    "Seu hub central de links. Organize, compartilhe e simplifique sua presença digital com Nexus.",
};

const inter = Inter({
  weight: "variable",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-white text-black text-md font-inter">{children}</body>
    </html>
  );
}
