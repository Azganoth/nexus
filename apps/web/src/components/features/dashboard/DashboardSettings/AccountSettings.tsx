"use client";

import { Button } from "$/components/ui/Button";
import { Input } from "$/components/ui/Input";
import { toast } from "$/components/ui/Toast";
import { useApiForm } from "$/hooks/useApiForm";
import { useAutoSaveForm } from "$/hooks/useAutoSaveForm";
import type { UpdateUserData } from "$/hooks/useUser";
import { exportUserData } from "$/lib/export";
import { unknownError } from "$/lib/utils";
import type { AuthenticatedUser } from "@repo/shared/contracts";
import { UPDATE_USER_SCHEMA } from "@repo/shared/schemas";

const getUserFormData = ({ name }: AuthenticatedUser) => ({ name });

interface AccountSettingsProps {
  user: AuthenticatedUser;
  update: (user: UpdateUserData) => Promise<void>;
}

export function AccountSettings({ user, update }: AccountSettingsProps) {
  const {
    register,
    handleSubmit,
    control,
    trigger,
    submitData,
    reset,
    formState: { errors: userErrors },
  } = useApiForm({
    schema: UPDATE_USER_SCHEMA,
    mutationFn: (data) => update(data),
    onSuccess: () => {
      toast.success("Conta atualizada com sucesso!");
    },
    onUnexpectedError: (error) => {
      reset();
      unknownError(error);
    },
    defaultValues: getUserFormData(user),
  });

  useAutoSaveForm({
    control,
    fields: ["name"],
    currentValues: getUserFormData(user),
    trigger,
    submitData,
  });

  const exportData = async () => {
    try {
      await exportUserData();
      toast.success("Dados exportados com sucesso!");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Erro ao exportar dados.");
    }
  };

  return (
    <div className="w-full">
      <h2 className="mb-8 text-center text-lg font-semibold">Conta</h2>
      <form onSubmit={handleSubmit} aria-label="Configurações da conta">
        <Input
          label="Nome"
          error={userErrors.name?.message}
          {...register("name")}
        />
      </form>
      <Button className="mt-8 w-full" onClick={exportData}>
        Exportar dados
      </Button>
    </div>
  );
}
