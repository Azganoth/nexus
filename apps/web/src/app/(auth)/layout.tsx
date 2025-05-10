import { Logo } from "$/components/ui/Logo";
import "$/styles/globals.css";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="view items-center">
      <header>
        <Logo variant="icon-and-name" />
      </header>
      {children}
    </div>
  );
}
