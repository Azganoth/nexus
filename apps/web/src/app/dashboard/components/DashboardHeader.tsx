"use client";

import { Icon } from "$/components/ui/Icon";
import { Link } from "$/components/ui/Link";
import { useAuth } from "$/contexts/AuthContext";
import { useProfile } from "$/hooks/useProfile";
import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";

const DASHBOARD_URL = "/dashboard";
const SETTINGS_URL = `${DASHBOARD_URL}/settings`;
const PREVIEW_URL = `${DASHBOARD_URL}/preview`;

export function DashboardHeader() {
  const { logout } = useAuth();
  const { profile, isProfileLoading } = useProfile();

  const pathname = usePathname();
  const router = useRouter();

  if (isProfileLoading) {
    return <DashboardHeaderSkeleton />;
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const isDashboard = pathname === DASHBOARD_URL;
  const isSettings = pathname === SETTINGS_URL;
  const isPreview = pathname === PREVIEW_URL;

  const title = isPreview ? "Prévia" : isSettings ? "Configurações" : "Nexus";

  return (
    <header
      className="bg-stardust flex items-center rounded-full"
      role="banner"
      aria-label="Cabeçalho do dashboard"
    >
      <Link
        className="text-comet btn-icon hover:text-charcoal rounded-full p-4"
        href={isDashboard ? SETTINGS_URL : DASHBOARD_URL}
        aria-label={
          isDashboard ? "Ir para as configurações" : "Voltar ao dashboard"
        }
        variant="none"
      >
        <Icon
          className={`min-w-6 text-xl ${
            isDashboard
              ? "icon-[fa6-solid--gear]"
              : "icon-[fa6-solid--arrow-left]"
          }`}
        />
      </Link>
      <h1 className="font-semibold">{title}</h1>
      {isSettings && (
        <button
          className="btn focus-ring bg-charcoal hover:bg-charcoal/90 ml-auto flex items-center gap-2 text-white"
          onClick={handleLogout}
          aria-label="Sair da conta"
        >
          <Icon className="icon-[fa6-solid--arrow-right-to-bracket]" />
          <span>Sair</span>
        </button>
      )}
      {(isDashboard || isPreview) && (
        <Link
          className={clsx(
            "btn bg-charcoal hover:bg-charcoal/90 ml-auto flex items-center gap-2 text-white",
            isDashboard && "max-desktop:hidden",
          )}
          href={`/p/${profile?.username ?? "me"}`}
          variant="none"
          aria-label="Visitar página pública do perfil"
          newTab
        >
          <Icon className="icon-[fa6-solid--arrow-up-right-from-square]" />
          <span>Visitar</span>
        </Link>
      )}
      {isDashboard && (
        <Link
          className="btn desktop:hidden bg-charcoal hover:bg-charcoal/90 ml-auto flex items-center gap-2 text-white"
          href={PREVIEW_URL}
          variant="none"
          aria-label="Ver prévia do perfil"
        >
          <Icon className="icon-[fa6-solid--eye]" />
          <span>Prévia</span>
        </Link>
      )}
    </header>
  );
}

function DashboardHeaderSkeleton() {
  return (
    <header
      className="flex items-center rounded-full bg-black/10"
      role="banner"
      aria-label="Carregando cabeçalho do dashboard"
      aria-busy="true"
    >
      <div className="mx-4 h-6 w-6 animate-pulse rounded-full bg-black/10" />
      <div className="h-6 w-32 animate-pulse rounded bg-black/10" />
      <div className="ml-auto h-14 w-28 animate-pulse rounded-full bg-black/10" />
    </header>
  );
}
