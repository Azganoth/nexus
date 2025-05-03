import { toast } from "$/lib/toast";
import { ERRORS } from "@repo/shared/constants";

export const unknownError = (error: unknown) => {
  console.error(error);
  toast(`${ERRORS.UNEXPECTED_ERROR} Tente novamente mais tarde.`, {
    variant: "error",
    duration: 5000,
  });
};
