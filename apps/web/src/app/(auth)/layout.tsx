import { Logo } from "$/components/Logo";
import "$/styles/globals.css";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="tablet:p-12 flex flex-col items-center p-8">
      <Logo variant="icon-and-name" />
      {children}
    </div>
  );
}
