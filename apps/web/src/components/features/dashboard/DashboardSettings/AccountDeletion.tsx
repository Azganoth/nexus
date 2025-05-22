import { Input } from "$/components/ui/Input";
import { LoadingButton } from "$/components/ui/LoadingButton";
import { Modal } from "$/components/ui/Modal";
import { toast } from "$/components/ui/Toast";
import { useApiForm } from "$/hooks/useApiForm";
import { apiClient } from "$/lib/apiClient";
import { unknownError } from "$/lib/utils";
import { DELETE_USER_SCHEMA } from "@repo/shared/schemas";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AccountDeletion() {
  const router = useRouter();

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors: deleteErrors, isSubmitting: isDeleteSubmitting },
  } = useApiForm({
    schema: DELETE_USER_SCHEMA,
    mutationFn: (data) => apiClient.delete("/users/me", { data }),
    onSuccess: () => {
      toast.success("Conta excluída com sucesso!");
      router.push("/");
    },
    onUnexpectedError: (error) => {
      unknownError(error);
      setShowDeleteModal(false);
    },
  });

  return (
    <div className="rounded-4xl bg-red/15 p-6 shadow-lg">
      <h2 className="mb-2 text-lg font-semibold">Zona de Perigo</h2>
      <p className="text-dark-grey mb-6 text-sm">
        Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta
        e removerá todos os seus dados.
      </p>
      <button
        className="btn bg-red focus-ring w-full text-white"
        type="button"
        onClick={() => setShowDeleteModal(true)}
      >
        Excluir Conta
      </button>
      <Modal
        title="Confirmar Exclusão"
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      >
        <form onSubmit={handleSubmit}>
          <p className="mb-6">
            Tem certeza que você deseja excluir a conta?{" "}
            <strong>
              Todos os dados serão excluídos permanentemente.
            </strong>{" "}
          </p>
          <p className="mb-2">Digite sua senha para confirmar:</p>
          <Input
            label="Senha"
            type="password"
            autoComplete="current-password"
            error={deleteErrors.password?.message}
            {...register("password")}
          />
          <div className="mt-12 flex gap-4">
            <LoadingButton
              className="bg-red w-full text-white"
              type="submit"
              isPending={isDeleteSubmitting}
            >
              Excluir
            </LoadingButton>
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="btn focus-ring bg-black text-white"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
