"use client";

import { Input } from "$/components/ui/Input";
import { Switch } from "$/components/ui/Switch";
import { Textarea } from "$/components/ui/Textarea";
import { toast } from "$/components/ui/Toast";
import { useApiForm } from "$/hooks/useApiForm";
import { useAutoSaveForm } from "$/hooks/useAutoSaveForm";
import type { UpdateProfileData } from "$/hooks/useProfile";
import { unknownError } from "$/lib/utils";
import type { AuthenticatedProfile } from "@repo/shared/contracts";
import { UPDATE_PROFILE_SCHEMA } from "@repo/shared/schemas";
import { Controller } from "react-hook-form";

interface Props {
  profile: AuthenticatedProfile;
  update: (profile: UpdateProfileData) => Promise<void>;
}

export function ProfileSettings({ profile, update }: Props) {
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
      reset();
    },
    onUnexpectedError: unknownError,
    defaultValues: {
      username: profile.username,
      seoTitle: profile.seoTitle ?? undefined,
      seoDescription: profile.seoDescription ?? undefined,
      isPublic: profile.isPublic,
    },
  });

  useAutoSaveForm({
    control,
    fields: ["username", "seoTitle", "seoDescription", "isPublic"],
    currentValues: {
      username: profile.username,
      seoTitle: profile.seoTitle ?? undefined,
      seoDescription: profile.seoDescription ?? undefined,
      isPublic: profile.isPublic,
    },
    trigger,
    submitData,
  });

  return (
    <div className="w-full max-w-[500px]">
      <h2 className="mb-6 text-center text-lg font-semibold">Perfil</h2>
      <form onSubmit={handleSubmit} aria-label="Configurações do perfil">
        <div className="space-y-4">
          <div className="mb-6 flex items-center justify-between gap-8">
            <div>
              <label
                className="text-dark-grey font-semibold"
                htmlFor="profile-isPublic"
                id="profile-public-label"
              >
                Público
              </label>
              <p
                className="text-medium-grey text-xs"
                id="profile-public-description"
              >
                Permite que outras pessoas vejam seu perfil
              </p>
            </div>
            <Controller
              name="isPublic"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                  aria-labelledby="profile-public-label"
                  aria-describedby="profile-public-description"
                />
              )}
            />
          </div>

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
        </div>
      </form>
    </div>
  );
}
