import { DashboardProfile } from "$/components/features/DashboardProfile";
import { composeTitle } from "$/lib/utils";
import type { Metadata } from "next";

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
