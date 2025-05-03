import { AuthProvider } from "$/contexts/AuthContext";
import "$/styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

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
      <body className="text-md font-inter bg-white text-black">
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            gap={16}
            offset="1.5rem"
            mobileOffset="1.5rem"
            visibleToasts={6}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
