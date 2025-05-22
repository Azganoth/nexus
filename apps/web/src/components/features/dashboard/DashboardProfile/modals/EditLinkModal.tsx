import { ErrorHint } from "$/components/ui/ErrorHint";
import { Input } from "$/components/ui/Input";
import { LoadingButton } from "$/components/ui/LoadingButton";
import { Modal } from "$/components/ui/Modal";
import { useApiForm } from "$/hooks/useApiForm";
import { apiClient } from "$/lib/apiClient";
import type { AuthenticatedLink } from "@repo/shared/contracts";
import { UPDATE_LINK_SCHEMA } from "@repo/shared/schemas";
import { useEffect } from "react";

interface EditLinkModalProps {
  link: AuthenticatedLink;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export function EditLinkModal({ link, isOpen, onClose }: EditLinkModalProps) {
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
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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
        <div className="mt-12 space-y-4">
          <ErrorHint className="text-center" error={errors.root?.message} />
          <LoadingButton
            type="submit"
            isPending={isSubmitting}
            className="bg-purple w-full text-white"
          >
            Salvar
          </LoadingButton>
        </div>
      </form>
    </Modal>
  );
}
