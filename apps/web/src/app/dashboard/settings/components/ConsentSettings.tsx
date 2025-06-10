"use client";

import { LabeledSwitch } from "$/components/ui/LabeledSwitch";
import { useConsentContext } from "$/contexts/ConsentContext";
import type { CookieConsentType } from "$/lib/consent";

export function ConsentSettings() {
  const { consents, updateConsents } = useConsentContext();

  const handleSwitch = (type: CookieConsentType) => (checked: boolean) => {
    updateConsents({ [type]: checked });
  };

  if (!consents) {
    return null;
  }

  return (
    <div className="w-full">
      <h2 className="mb-8 text-center text-lg font-semibold">Consentimentos</h2>
      <div className="space-y-2">
        <LabeledSwitch
          className="w-full"
          label="Cookies Necessários"
          description="Permito o uso de cookies essenciais para o funcionamento do site."
          position="right"
          checked={consents.NECESSARY_COOKIES}
          disabled
        />
        <LabeledSwitch
          className="w-full"
          label="Cookies de Analytics"
          description="Permito o uso de cookies para análise de uso do site."
          position="right"
          checked={consents.ANALYTICS_COOKIES}
          onChange={handleSwitch("ANALYTICS_COOKIES")}
        />
        <LabeledSwitch
          className="w-full"
          label="Cookies de Terceiros"
          description="Permito o uso de cookies de terceiros para funcionalidades adicionais."
          position="right"
          checked={consents.THIRD_PARTY_COOKIES}
          onChange={handleSwitch("THIRD_PARTY_COOKIES")}
        />
      </div>
    </div>
  );
}
