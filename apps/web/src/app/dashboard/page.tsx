import { composeTitle } from "$/lib/utils";
import type { Metadata } from "next";
import { DashboardProfile } from "./components/DashboardProfile";

export const metadata: Metadata = {
  title: composeTitle("Dashboard"),
  description: "Gerencie seu perfil, links e configurações no painel do Nexus.",
};

export default function Page() {
  return (
    <main className="flex grow flex-col">
      <DashboardProfile />
    </main>
  );
}
