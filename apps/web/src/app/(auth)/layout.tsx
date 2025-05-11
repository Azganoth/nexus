import { Logo } from "$/components/ui/Logo";
import { getAuth } from "$/lib/auth/server";
import "$/styles/globals.css";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const auth = await getAuth();
  if (auth) {
    redirect("/dashboard");
  }

  return (
    <div className="view items-center">
      <header>
        <Logo variant="icon-and-name" />
      </header>
      {children}
    </div>
  );
}
