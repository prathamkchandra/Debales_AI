import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchJson } from "@/hooks/api";
import type { Conversation, ProjectContext } from "@/lib/types";

export function projectKey(projectSlug: string) {
  return ["project", projectSlug] as const;
}

export function conversationKey(projectSlug: string, conversationId: string) {
  return ["conversation", projectSlug, conversationId] as const;
}

export function dashboardKey(projectSlug: string) {
  return ["dashboard", projectSlug] as const;
}

export function useProject(projectSlug: string) {
  return useQuery({
    queryKey: projectKey(projectSlug),
    queryFn: () => fetchJson<ProjectContext>(`/api/projects/${projectSlug}`),
  });
}

export function useConversation(projectSlug: string, conversationId: string) {
  return useQuery({
    queryKey: conversationKey(projectSlug, conversationId),
    queryFn: () =>
      fetchJson<Conversation>(
        `/api/projects/${projectSlug}/conversations/${conversationId}`,
      ),
  });
}

export function useCreateConversation(projectSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title?: string) =>
      fetchJson<Conversation>(`/api/projects/${projectSlug}/conversations`, {
        method: "POST",
        body: JSON.stringify({ title }),
      }),
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: projectKey(projectSlug) });
      queryClient.setQueryData(
        conversationKey(projectSlug, conversation.id),
        conversation,
      );
    },
  });
}

export function useSendMessage(projectSlug: string, conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) =>
      fetchJson<Conversation>(`/api/projects/${projectSlug}/chat`, {
        method: "POST",
        body: JSON.stringify({ conversationId, content }),
      }),
    onSuccess: (conversation) => {
      queryClient.setQueryData(
        conversationKey(projectSlug, conversationId),
        conversation,
      );
      queryClient.invalidateQueries({ queryKey: projectKey(projectSlug) });
    },
  });
}
