import { redirect } from "next/navigation";

export default function ProjectChatIndex({
  params,
}: {
  params: { projectSlug: string };
}) {
  redirect(`/projects/${params.projectSlug}/chat/conv-sales`);
}
