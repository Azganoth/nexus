import { ErrorHint } from "$/components/ui/ErrorHint";
import { Input } from "$/components/ui/Input";
import { LoadingButton } from "$/components/ui/LoadingButton";
import { Modal } from "$/components/ui/Modal";
import { useApiForm } from "$/hooks/useApiForm";
import { apiClient } from "$/services/apiClient";
import type { AuthenticatedLink } from "@repo/shared/contracts";
import { UPDATE_LINK_SCHEMA } from "@repo/shared/schemas";
import { useEffect } from "react";

interface Props {
  link: AuthenticatedLink;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export function ProfileModalEditLink({ link, isOpen, onClose }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useApiForm({
    schema: UPDATE_LINK_SCHEMA,
    mutationFn: (data) =>
      apiClient.patch<AuthenticatedLink>(`/links/${link.id}`, data),
    onSuccess: () => {
      onClose();
    },
    defaultValues: {
      title: link.title,
      url: link.url,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        title: link.title,
        url: link.url,
      });
    }
  }, [isOpen, link, reset]);

  return (
    <Modal title="Editar Link" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            label="Título"
            error={errors.title?.message}
            {...register("title")}
          />
          <Input
            label="URL"
            type="url"
            error={errors.url?.message}
            placeholder="https://exemplo.com"
            {...register("url")}
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
