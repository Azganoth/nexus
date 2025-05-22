import { DashboardSettings } from "$/components/features/dashboard/DashboardSettings";
import { composeTitle } from "$/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: composeTitle("Configurações do Dashboard"),
  description:
    "Ajuste suas preferências e configurações de conta no painel do Nexus.",
};

export default function Page() {
  return (
    <main className="flex grow flex-col">
      <DashboardSettings />
    </main>
  );
}
