import { Button } from "$/components/ui/Button";
import { ErrorHint } from "$/components/ui/ErrorHint";
import { Input } from "$/components/ui/Input";
import { Modal } from "$/components/ui/Modal";
import { useApiForm } from "$/hooks/useApiForm";
import { apiClient } from "$/lib/apiClient";
import type { AuthenticatedLink } from "@repo/shared/contracts";
import { CREATE_LINK_SCHEMA } from "@repo/shared/schemas";
import { useEffect } from "react";

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
}

export function AddLinkModal({ isOpen, onAdd, onClose }: AddLinkModalProps) {
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
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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
        <div className="mt-12 space-y-4">
          <ErrorHint className="text-center" error={errors.root?.message} />
          <Button
            className="w-full"
            type="submit"
            variant="accent"
            isLoading={isSubmitting}
          >
            Adicionar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
