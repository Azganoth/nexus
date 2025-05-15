import { apiClient } from "$/services/apiClient";
import type { ApiError } from "$/services/errors";
import type { AuthenticatedProfile } from "@repo/shared/contracts";
import type { UPDATE_PROFILE_SCHEMA } from "@repo/shared/schemas";
import useSWR from "swr";
import type { z } from "zod/v4";

const swrFetcher = (url: string) => apiClient.get<AuthenticatedProfile>(url);

export const useProfile = () => {
  const { data, error, isLoading, mutate } = useSWR<
    AuthenticatedProfile,
    ApiError
  >("/profiles/me", swrFetcher);

  const updateProfile = async (updateData: UpdateProfileData) => {
    if (!data) return;

    await mutate(
      apiClient.patch<AuthenticatedProfile>("/profiles/me", updateData),
      {
        optimisticData: { ...data, ...updateData },
        revalidate: false,
      },
    );
  };

  return {
    profile: data,
    updateProfile,
    revalidateProfile: mutate,
    isProfileLoading: isLoading,
    profileError: error,
  };
};

export type UpdateProfileData = z.infer<typeof UPDATE_PROFILE_SCHEMA>;
