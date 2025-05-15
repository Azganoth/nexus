import { ErrorHint } from "$/components/ui/ErrorHint";
import { Input } from "$/components/ui/Input";
import { LoadingButton } from "$/components/ui/LoadingButton";
import { Modal } from "$/components/ui/Modal";
import { useApiForm } from "$/hooks/useApiForm";
import { apiClient } from "$/services/apiClient";
import type { AuthenticatedLink } from "@repo/shared/contracts";
import { CREATE_LINK_SCHEMA } from "@repo/shared/schemas";
import { useEffect } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
}

export function ProfileModalAddLink({ isOpen, onAdd, onClose }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useApiForm({
    schema: CREATE_LINK_SCHEMA,
    mutationFn: (data) => apiClient.post<AuthenticatedLink>("/links", data),
    onSuccess: () => {
      onAdd();
      reset();
      onClose();
    },
    defaultValues: {
      title: "",
      url: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  return (
    <Modal title="Adicionar Link" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="mt-8 space-y-4">
          <Input
            label="Título"
            error={errors.title?.message}
            {...register("title")}
          />
          <Input
            type="url"
            label="URL"
            error={errors.url?.message}
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
            Adicionar
          </LoadingButton>
        </div>
      </form>
    </Modal>
  );
}
