"use client";

import { Input } from "$/components/ui/Input";
import { LabeledSwitch } from "$/components/ui/LabeledSwitch";
import { Textarea } from "$/components/ui/Textarea";
import { toast } from "$/components/ui/Toast";
import { useApiForm } from "$/hooks/useApiForm";
import { useAutoSaveForm } from "$/hooks/useAutoSaveForm";
import type { UpdateProfileData } from "$/hooks/useProfile";
import { unknownError } from "$/lib/utils";
import type { AuthenticatedProfile } from "@repo/shared/contracts";
import { UPDATE_PROFILE_SCHEMA } from "@repo/shared/schemas";
import { useEffect } from "react";
import { Controller } from "react-hook-form";

const getProfileFormData = ({
  username,
  seoTitle,
  seoDescription,
  isPublic,
}: AuthenticatedProfile) => ({
  username,
  seoTitle: seoTitle ?? undefined,
  seoDescription: seoDescription ?? undefined,
  isPublic,
});

interface ProfileSettingsProps {
  profile: AuthenticatedProfile;
  update: (profile: UpdateProfileData) => Promise<void>;
}

export function ProfileSettings({ profile, update }: ProfileSettingsProps) {
  const {
    register,
    submitData,
    handleSubmit,
    trigger,
    control,
    reset,
    formState: { errors },
  } = useApiForm({
    schema: UPDATE_PROFILE_SCHEMA,
    mutationFn: (data) => update(data),
    onSuccess: () => {
      toast.success("Perfil atualizado com sucesso!");
    },
    onUnexpectedError: (error) => {
      reset();
      unknownError(error);
    },
    defaultValues: getProfileFormData(profile),
  });

  useEffect(() => {
    reset(getProfileFormData(profile));
  }, [profile, reset]);

  useAutoSaveForm({
    control,
    fields: ["username", "seoTitle", "seoDescription", "isPublic"],
    currentValues: getProfileFormData(profile),
    trigger,
    submitData,
  });

  return (
    <div className="w-full">
      <h2 className="mb-8 text-center text-lg font-semibold">Perfil</h2>
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
        aria-label="Configurações do perfil"
      >
        <Controller
          name="isPublic"
          control={control}
          render={({ field }) => (
            <LabeledSwitch
              className="w-full"
              label="Público"
              description="Permite que outras pessoas vejam seu perfil"
              position="right"
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Input
          label="Nome de usuário"
          error={errors.username?.message}
          {...register("username")}
        />
        <Input
          label="Título SEO"
          error={errors.seoTitle?.message}
          {...register("seoTitle")}
        />
        <Textarea
          label="Descrição SEO"
          rows={3}
          error={errors.seoDescription?.message}
          {...register("seoDescription")}
        />
      </form>
    </div>
  );
}
