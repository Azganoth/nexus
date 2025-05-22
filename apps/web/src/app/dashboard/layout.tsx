import { DashboardHeader } from "$/components/features/dashboard/DashboardHeader";
import { getAuth } from "$/lib/auth/server";
import "$/styles/globals.css";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const auth = await getAuth();
  if (!auth) {
    redirect("/login");
  }

  return (
    <div className="view">
      <DashboardHeader />
      {children}
    </div>
  );
}
