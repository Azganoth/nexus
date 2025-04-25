import { toast } from "@lib/toast";

export const unknownError = (error: unknown) => {
  console.error(error);
  toast("Algo deu errado. Tente novamente mais tarde.", {
    variant: "error",
    duration: 5000,
  });
};
