import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchJson } from "@/hooks/api";
import type { SessionPayload } from "@/lib/types";

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: () => fetchJson<SessionPayload>("/api/session"),
  });
}

export function useSwitchUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      fetchJson<SessionPayload>("/api/session", {
        method: "POST",
        body: JSON.stringify({ userId }),
      }),
    onSuccess: () => {
      queryClient.clear();
      window.location.reload();
    },
  });
}
