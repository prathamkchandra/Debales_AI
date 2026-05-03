import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchJson } from "@/hooks/api";
import { dashboardKey } from "@/hooks/use-project";
import type {
  DashboardConfig,
  DashboardSection,
  ProductInstance,
  Project,
} from "@/lib/types";

type DashboardPayload = {
  project: Project;
  productInstance: ProductInstance;
  config: DashboardConfig;
};

export function useDashboard(projectSlug: string) {
  return useQuery({
    queryKey: dashboardKey(projectSlug),
    queryFn: () =>
      fetchJson<DashboardPayload>(
        `/api/projects/${projectSlug}/admin/dashboard`,
      ),
  });
}

export function useSaveDashboard(projectSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sections: DashboardSection[]) =>
      fetchJson<DashboardConfig>(`/api/projects/${projectSlug}/admin/dashboard`, {
        method: "PATCH",
        body: JSON.stringify({ sections }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKey(projectSlug) });
    },
  });
}
