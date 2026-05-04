import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function ProjectChatIndex({
  params,
}: {
  params: { projectSlug: string };
}) {
  redirect(`/projects/${params.projectSlug}/chat/conv-sales`);
}
