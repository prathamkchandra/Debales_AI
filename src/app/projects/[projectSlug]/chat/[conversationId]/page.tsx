import { ChatExperience } from "@/components/chat-experience";

export default function ChatPage({
  params,
}: {
  params: { projectSlug: string; conversationId: string };
}) {
  return (
    <ChatExperience
      projectSlug={params.projectSlug}
      conversationId={params.conversationId}
    />
  );
}
