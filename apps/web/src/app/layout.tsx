import "$/styles/globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

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
        {children}
        <Toaster
          position="bottom-right"
          gap={16}
          offset="1.5rem"
          mobileOffset="1.5rem"
          visibleToasts={6}
        />
      </body>
    </html>
  );
}
