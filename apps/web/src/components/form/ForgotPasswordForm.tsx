"use client";

import { SlidingView } from "$/components/layout/SlidingView";
import { ErrorHint } from "$/components/ui/ErrorHint";
import { Input } from "$/components/ui/Input";
import { LoadingButton } from "$/components/ui/LoadingButton";
import { toast } from "$/components/ui/Toast";
import { useApiForm } from "$/hooks/useApiForm";
import { apiClient } from "$/services/apiClient";
import { FORGOT_PASSWORD_SCHEMA } from "@repo/shared/schemas";
import { useEffect, useState } from "react";

const TIMEOUT = 60;

const schema = FORGOT_PASSWORD_SCHEMA;

export function ForgotPasswordForm() {
  const [view, setView] = useState<"form" | "notice">("form");
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
    schema,
    mutationFn: (data) => apiClient.post("/auth/forgot-password", data),
    onSuccess: () => {
      const email = getValues("email");
      setSubmittedEmail(email);
      setView("notice");
      setCountdown(TIMEOUT);
      toast.success("Email de redefinição enviado!");
    },
    onUnexpectedError: (error) => {
      console.log(error);
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
    form: (
      <form
        className="mt-auto w-full transition-opacity"
        onSubmit={handleSubmit}
      >
        <Input
          id="reset-email"
          label="Email"
          type="email"
          autoComplete="email"
          autoFocus
          error={errors.email?.message}
          {...register("email")}
        />
        <ErrorHint
          className="mt-6 text-center"
          message={errors.root?.message}
        />
        <LoadingButton
          className="bg-purple mt-2 w-full min-w-56 text-white"
          type="submit"
          isPending={isSubmitting}
        >
          Redefinir senha
        </LoadingButton>
      </form>
    ),
    notice: (
      <div className="flex w-full flex-col text-center">
        <button
          onClick={() => setView("form")}
          className="text-medium-grey hover:text-black"
          aria-label="Voltar"
        >
          <span className="icon-[fa6-solid--arrow-left] text-xl"></span>
        </button>
        <p className="mt-4" role="status" aria-live="polite">
          Um email foi enviado para{" "}
          <strong className="font-bold">{submittedEmail}</strong> com as
          instruções para redefinir sua senha.
        </p>
        <p className="text-medium-grey mt-8 text-sm">
          Não recebeu o email? Verifique sua caixa de spam ou tente reenviar o
          email.
        </p>
        <LoadingButton
          onClick={handleResend}
          isPending={isResending}
          disabled={countdown > 0}
          className="bg-purple mt-4 w-full min-w-56 text-white"
        >
          {countdown > 0 ? `Reenviar em ${countdown}s` : "Reenviar email"}
        </LoadingButton>
      </div>
    ),
  };

  return <SlidingView views={views} currentView={view} autoFocus />;
}
