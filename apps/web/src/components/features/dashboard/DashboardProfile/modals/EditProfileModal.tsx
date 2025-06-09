import { Button } from "$/components/ui/Button";
import { ErrorHint } from "$/components/ui/ErrorHint";
import { Input } from "$/components/ui/Input";
import { Modal } from "$/components/ui/Modal";
import { Textarea } from "$/components/ui/Textarea";
import { useApiForm } from "$/hooks/useApiForm";
import type { UpdateProfileData } from "$/hooks/useProfile";
import type { AuthenticatedProfile } from "@repo/shared/contracts";
import { UPDATE_PROFILE_SCHEMA } from "@repo/shared/schemas";
import { useEffect } from "react";

interface EditProfileModalProps {
  profile: AuthenticatedProfile;
  updateProfile: (updateData: UpdateProfileData) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileModal({
  profile,
  updateProfile,
  isOpen,
  onClose,
}: EditProfileModalProps) {
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
      bio: profile.bio ?? "",
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
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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
        <div className="mt-12 space-y-4">
          <ErrorHint className="text-center" error={errors.root?.message} />
          <Button
            className="w-full"
            type="submit"
            variant="accent"
            isLoading={isSubmitting}
          >
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
