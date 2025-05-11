import { apiClient } from "$/services/apiClient";
import type { ApiError } from "$/services/errors";
import type { AuthenticatedUser } from "@repo/shared/contracts";
import type { UPDATE_USER_SCHEMA } from "@repo/shared/schemas";
import useSWR from "swr";
import type { z } from "zod/v4";

const swrFetcher = (url: string) => apiClient.get<AuthenticatedUser>(url);

export const useUser = () => {
  const { data, error, isLoading, mutate } = useSWR<
    AuthenticatedUser,
    ApiError
  >("/users/me", swrFetcher);

  const updateUser = async (updateData: UpdateUserData) => {
    if (!data) return;

    await mutate(apiClient.patch<AuthenticatedUser>("/users/me", updateData), {
      optimisticData: { ...data, ...updateData },
      revalidate: false,
    });
  };

  return {
    user: data,
    updateUser,
    revalidateUser: mutate,
    isUserLoading: isLoading,
    userError: error,
  };
};

export type UpdateUserData = z.infer<typeof UPDATE_USER_SCHEMA>;
