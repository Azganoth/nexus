"use client";

import { LabeledSwitch } from "$/components/ui/LabeledSwitch";
import { Link } from "$/components/ui/Link";
import { useConsentContext } from "$/contexts/ConsentContext";
import {
  DEFAULT_COOKIE_CONSENT_STATUS,
  type LocalConsentStatus,
} from "$/lib/consent";
import { useEffect, useState } from "react";

export function ConsentBanner() {
  const { consents, isLoading, updateConsents } = useConsentContext();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!consents) {
      setShowBanner(true);
    }
  }, [consents, isLoading]);

  const handleDecision = async (consentStatus: LocalConsentStatus) => {
    setShowBanner(false);
    await updateConsents(consentStatus);
  };

  if (!showBanner) {
    return null;
  }

  return <Banner onDecision={handleDecision} />;
}

interface BannerProps {
  onDecision: (consentStatus: LocalConsentStatus) => void;
}

function Banner({ onDecision }: BannerProps) {
  const [analyticsCookies, setAnalyticsCookies] = useState(
    DEFAULT_COOKIE_CONSENT_STATUS.ANALYTICS_COOKIES,
  );
  const [thirdPartyCookies, setThirdPartyCookies] = useState(
    DEFAULT_COOKIE_CONSENT_STATUS.THIRD_PARTY_COOKIES,
  );

  const handleAcceptAll = async () => {
    onDecision({
      NECESSARY_COOKIES: true,
      ANALYTICS_COOKIES: true,
      THIRD_PARTY_COOKIES: true,
    });
  };

  const handleAcceptSelected = async () => {
    onDecision({
      NECESSARY_COOKIES: true,
      ANALYTICS_COOKIES: analyticsCookies,
      THIRD_PARTY_COOKIES: thirdPartyCookies,
    });
  };

  const handleNecessaryOnly = async () => {
    onDecision({
      NECESSARY_COOKIES: true,
      ANALYTICS_COOKIES: false,
      THIRD_PARTY_COOKIES: false,
    });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-black bg-white p-6 shadow-lg">
      <div className="mx-auto max-w-[800px]">
        <h3 className="font-semibold">Preferências de Cookies</h3>
        <p className="text-dark-grey mb-4 text-xs">
          Utilizamos cookies para melhorar sua experiência. Você pode escolher
          quais tipos de cookies aceitar. Para mais informações, consulte nossa{" "}
          <Link href="/about/cookies">Política de Cookies</Link>.
        </p>
        <div className="space-y-2">
          <LabeledSwitch
            className="w-full text-sm"
            label="Cookies Necessários"
            description={
              <p className="text-dark-grey text-xs">
                Essenciais para o funcionamento do site
              </p>
            }
            checked={true}
            disabled
          />
          <LabeledSwitch
            className="w-full text-sm"
            label="Cookies de Analytics"
            description={
              <p className="text-dark-grey text-xs">
                Para análise de uso e melhorias
              </p>
            }
            checked={analyticsCookies}
            onChange={setAnalyticsCookies}
          />
          <LabeledSwitch
            className="w-full text-sm"
            label="Cookies de Terceiros"
            description={
              <p className="text-dark-grey text-xs">
                Para funcionalidades adicionais
              </p>
            }
            checked={thirdPartyCookies}
            onChange={setThirdPartyCookies}
          />
        </div>
        <div className="tablet:grid-cols-3 mt-6 grid gap-2">
          <button
            className="btn bg-black px-5 py-3 text-sm text-white"
            onClick={handleNecessaryOnly}
          >
            Apenas Necessários
          </button>
          <button
            className="btn bg-black px-5 py-3 text-sm text-white"
            onClick={handleAcceptSelected}
          >
            Aceitar Selecionados
          </button>
          <button
            className="btn bg-purple px-5 py-3 text-sm text-white"
            onClick={handleAcceptAll}
          >
            Aceitar Todos
          </button>
        </div>
      </div>
    </div>
  );
}
