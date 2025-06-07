"use client";

import { ErrorHint } from "$/components/ui/ErrorHint";
import { Icon } from "$/components/ui/Icon";
import { Input } from "$/components/ui/Input";
import { SlidingView } from "$/components/ui/layout/SlidingView";
import { Link } from "$/components/ui/Link";
import { LoadingButton } from "$/components/ui/LoadingButton";
import { toast } from "$/components/ui/Toast";
import { useApiForm } from "$/hooks/useApiForm";
import { apiClient } from "$/lib/apiClient";
import { FORGOT_PASSWORD_SCHEMA } from "@repo/shared/schemas";
import { useEffect, useState } from "react";

const TIMEOUT = 60;

export function ForgotPassword() {
  const [view, setView] = useState<"sending" | "sent">("sending");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  const [countdown, setCountdown] = useState(0);
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useApiForm({
    schema: FORGOT_PASSWORD_SCHEMA,
    mutationFn: (data) => apiClient.post("/auth/forgot-password", data),
    onSuccess: () => {
      const email = getValues("email");
      setSubmittedEmail(email);
      setView("sent");
      setCountdown(TIMEOUT);
      toast.success("Email de redefinição enviado!");
    },
    defaultValues: {
      email: "",
    },
  });

  const handleResend = async () => {
    setIsResending(true);
    try {
      await apiClient.post("/auth/forgot-password", {
        email: submittedEmail,
      });
      toast.success("Email de redefinição reenviado!");
      setCountdown(TIMEOUT);
    } catch (error) {
      console.error(error);
      toast.error("Ocorreu um erro ao reenviar o email.");
    } finally {
      setIsResending(false);
    }
  };

  const views = {
    sending: (
      <div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            autoFocus
            error={errors.email?.message}
            {...register("email")}
          />
          <div className="mt-12 space-y-4">
            <ErrorHint className="text-center" error={errors.root?.message} />
            <LoadingButton
              className="bg-purple w-full min-w-56 text-white"
              type="submit"
              isPending={isSubmitting}
            >
              Redefinir senha
            </LoadingButton>
          </div>
        </form>
        <div className="mt-8 text-center">
          <span className="text-dark-grey text-sm font-bold">
            Não tem uma conta? <Link href="/signup">Cadastre-se agora!</Link>
          </span>
        </div>
      </div>
    ),
    sent: (
      <div className="flex w-full flex-col text-center">
        <button
          onClick={() => setView("sending")}
          className="text-medium-grey hover:text-black"
          aria-label="Voltar"
        >
          <Icon className="icon-[fa6-solid--arrow-left] mx-auto text-xl" />
        </button>
        <div className="mt-8 space-y-4" role="status" aria-live="polite">
          <p>
            Um email foi enviado para{" "}
            <strong className="font-bold">{submittedEmail}</strong> com as
            instruções para redefinir sua senha.
          </p>
          <p className="text-medium-grey text-sm">
            Não recebeu o email? Verifique sua caixa de spam ou tente reenviar o
            email.
          </p>
        </div>
        <LoadingButton
          onClick={handleResend}
          isPending={isResending}
          disabled={countdown > 0}
          className="bg-purple mt-12 w-full min-w-56 text-white"
        >
          {countdown > 0 ? `Reenviar em ${countdown}s` : "Reenviar email"}
        </LoadingButton>
      </div>
    ),
  };

  return <SlidingView views={views} currentView={view} autoFocus />;
}
