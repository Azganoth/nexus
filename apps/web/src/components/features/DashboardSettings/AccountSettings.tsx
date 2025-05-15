"use client";

import { Input } from "$/components/ui/Input";
import { LoadingButton } from "$/components/ui/LoadingButton";
import { Modal } from "$/components/ui/Modal";
import { toast } from "$/components/ui/Toast";
import { useApiForm } from "$/hooks/useApiForm";
import { useAutoSaveForm } from "$/hooks/useAutoSaveForm";
import type { UpdateUserData } from "$/hooks/useUser";
import { unknownError } from "$/lib/utils";
import { apiClient } from "$/services/apiClient";
import type { AuthenticatedUser } from "@repo/shared/contracts";
import { DELETE_USER_SCHEMA, UPDATE_USER_SCHEMA } from "@repo/shared/schemas";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  user: AuthenticatedUser;
  update: (user: UpdateUserData) => Promise<void>;
}

export function AccountSettings({ user, update }: Props) {
  const router = useRouter();

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    register: registerUser,
    handleSubmit: handleUserSubmit,
    control: userControl,
    trigger: triggerUser,
    submitData: submitUserData,
    formState: { errors: userErrors },
  } = useApiForm({
    schema: UPDATE_USER_SCHEMA,
    mutationFn: (data) => update(data),
    onSuccess: () => {
      toast.success("Conta atualizada com sucesso!");
    },
    onUnexpectedError: unknownError,
    defaultValues: {
      name: user.name,
    },
  });

  useAutoSaveForm({
    control: userControl,
    fields: ["name"],
    currentValues: {
      name: user.name,
    },
    trigger: triggerUser,
    submitData: submitUserData,
  });

  const {
    register: registerDelete,
    handleSubmit: handleDeleteSubmit,
    formState: { errors: deleteErrors, isSubmitting: isDeleteSubmitting },
  } = useApiForm({
    schema: DELETE_USER_SCHEMA,
    mutationFn: (data) => apiClient.delete("/users/me", { data }),
    onSuccess: () => {
      toast.success("Conta excluída com sucesso!");
      router.push("/");
    },
    onUnexpectedError: unknownError,
  });

  return (
    <div className="max-w-[500px]">
      <div className="w-full">
        <h2 className="mb-6 text-center text-lg font-semibold">Conta</h2>

        {/* Name Change */}
        <form onSubmit={handleUserSubmit}>
          <div className="space-y-4">
            <Input
              label="Nome"
              defaultValue={user.name}
              error={userErrors.name?.message}
              {...registerUser("name")}
            />
          </div>
        </form>

        {/* Data Export */}
        <div className="mt-6 flex justify-center">
          <button
            className="btn focus-ring bg-black text-white"
            type="button"
            onClick={() => setShowDeleteModal(true)}
          >
            Exportar dados
          </button>
        </div>
      </div>

      {/* Account Deletion */}
      <div className="rounded-4xl bg-red/15 mt-12 p-6 shadow-lg">
        <h2 className="mb-2 text-lg font-semibold">Zona de Perigo</h2>
        <p className="text-dark-grey mb-6 text-sm">
          Esta ação não pode ser desfeita. Isso excluirá permanentemente sua
          conta e removerá todos os seus dados.
        </p>
        <button
          className="btn bg-red focus-ring w-full text-white"
          type="button"
          onClick={() => setShowDeleteModal(true)}
        >
          Excluir Conta
        </button>
      </div>

      <Modal
        title="Confirmar Exclusão"
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      >
        <form onSubmit={handleDeleteSubmit}>
          <p className="mb-4 text-gray-600">
            Tem certeza que você deseja excluir a conta? Todos os dados serão
            excluídos permanentemente. Digite sua senha para confirmar:
          </p>
          <Input
            label="Senha"
            type="password"
            autoComplete="current-password"
            error={deleteErrors.password?.message}
            {...registerDelete("password")}
          />
          <div className="flex justify-center gap-4">
            <LoadingButton
              className="bg-red text-white"
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
