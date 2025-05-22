import type { UserDataExport } from "@repo/shared/contracts";
import { apiClient } from "./apiClient";

export const exportUserData = async () => {
  const data = await apiClient.get<UserDataExport>("/users/me/export");

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  // Create a download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `nexus-data-export-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
