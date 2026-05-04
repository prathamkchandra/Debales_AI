import { AdminDashboard } from "@/components/admin-dashboard";
import { ForbiddenPanel } from "@/components/state-panels";
import { AccessError } from "@/lib/access";
import { getAdminDashboard } from "@/lib/services/admin-service";
import { getPageUserId } from "@/lib/services/session-service";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  params,
}: {
  params: { projectSlug: string };
}) {
  try {
    await getAdminDashboard(params.projectSlug, getPageUserId());
  } catch (error) {
    if (error instanceof AccessError) {
      return (
        <ForbiddenPanel
          projectSlug={params.projectSlug}
          message={error.message}
        />
      );
    }

    throw error;
  }

  return <AdminDashboard projectSlug={params.projectSlug} />;
}
