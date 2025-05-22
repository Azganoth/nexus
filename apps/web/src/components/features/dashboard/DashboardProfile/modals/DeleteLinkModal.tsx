import { LoadingButton } from "$/components/ui/LoadingButton";
import { Modal } from "$/components/ui/Modal";
import { apiClient } from "$/lib/apiClient";
import type { AuthenticatedLink } from "@repo/shared/contracts";
import { useState } from "react";

interface DeleteLinkModalProps {
  link: AuthenticatedLink;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export function DeleteLinkModal({
  link,
  isOpen,
  onClose,
  onDelete,
}: DeleteLinkModalProps) {
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
      <div className="mt-8">
        <p className="text-center">
          Tem certeza que você deseja excluir o link{" "}
          <strong>&ldquo;{link.title}&rdquo;</strong>?
        </p>
        <div className="mt-12 flex gap-4">
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
