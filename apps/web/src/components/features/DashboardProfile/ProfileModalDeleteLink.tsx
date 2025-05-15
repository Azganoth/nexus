import { LoadingButton } from "$/components/ui/LoadingButton";
import { Modal } from "$/components/ui/Modal";
import { apiClient } from "$/services/apiClient";
import type { AuthenticatedLink } from "@repo/shared/contracts";
import { useState } from "react";

interface Props {
  link: AuthenticatedLink;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export function ProfileModalDeleteLink({
  link,
  isOpen,
  onClose,
  onDelete,
}: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/links/${link.id}`);
      onDelete();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal title="Excluir Link" isOpen={isOpen} onClose={onClose}>
      <div className="mt-8 space-y-12">
        <p className="text-center">
          Tem certeza que você deseja excluir o link{" "}
          <strong>&ldquo;{link.title}&rdquo;</strong>?
        </p>
        <div className="flex justify-center gap-4">
          <LoadingButton
            className="bg-red w-full max-w-48 text-white"
            type="submit"
            isPending={isDeleting}
            onClick={handleConfirm}
          >
            Excluir
          </LoadingButton>
          <button
            type="button"
            onClick={onClose}
            className="btn focus-ring bg-black text-white"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
}
