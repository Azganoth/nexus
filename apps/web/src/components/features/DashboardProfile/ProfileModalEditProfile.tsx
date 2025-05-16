import { ErrorHint } from "$/components/ui/ErrorHint";
import { Input } from "$/components/ui/Input";
import { LoadingButton } from "$/components/ui/LoadingButton";
import { Modal } from "$/components/ui/Modal";
import { Textarea } from "$/components/ui/Textarea";
import { useApiForm } from "$/hooks/useApiForm";
import type { UpdateProfileData } from "$/hooks/useProfile";
import type { AuthenticatedProfile } from "@repo/shared/contracts";
import { UPDATE_PROFILE_SCHEMA } from "@repo/shared/schemas";
import { useEffect } from "react";

interface Props {
  profile: AuthenticatedProfile;
  updateProfile: (updateData: UpdateProfileData) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModalEditProfile({
  profile,
  updateProfile,
  isOpen,
  onClose,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useApiForm({
    schema: UPDATE_PROFILE_SCHEMA,
    mutationFn: async (data) => updateProfile(data),
    onSuccess: () => {
      onClose();
    },
    defaultValues: {
      displayName: profile.displayName,
      bio: profile.bio ?? undefined,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        displayName: profile.displayName,
        bio: profile.bio || "",
      });
    }
  }, [isOpen, profile, reset]);

  return (
    <Modal title="Editar Perfil" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <Input
            label="Nome de Exibição"
            error={errors.displayName?.message}
            {...register("displayName")}
          />
          <Textarea
            label="Bio"
            rows={3}
            error={errors.bio?.message}
            {...register("bio")}
          />
        </div>
        <ErrorHint className="mt-4" message={errors.root?.message} />
        <div className="mt-2 flex justify-center">
          <LoadingButton
            type="submit"
            isPending={isSubmitting}
            className="bg-purple min-w-48 text-white"
          >
            Salvar
          </LoadingButton>
        </div>
      </form>
    </Modal>
  );
}
