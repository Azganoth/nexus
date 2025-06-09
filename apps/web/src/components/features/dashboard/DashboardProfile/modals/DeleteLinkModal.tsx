import { Button } from "$/components/ui/Button";
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
          <Button
            className="w-full max-w-48"
            type="submit"
            onClick={handleConfirm}
            variant="danger"
            isLoading={isDeleting}
          >
            Excluir
          </Button>
          <Button onClick={onClose}>Cancelar</Button>
        </div>
      </div>
    </Modal>
  );
}
