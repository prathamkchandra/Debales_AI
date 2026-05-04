import { ChatExperience } from "@/components/chat-experience";

export const dynamic = "force-dynamic";

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
