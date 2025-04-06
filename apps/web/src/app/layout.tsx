import "@styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Web App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white text-black">{children}</body>
    </html>
  );
}
