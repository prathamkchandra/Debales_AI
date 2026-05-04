import { NextResponse } from "next/server";

import { jsonError } from "@/lib/http";
import { dashboardConfigSchema, routeParamsSchema } from "@/lib/schemas";
import {
  getAdminDashboard,
  updateAdminDashboard,
} from "@/lib/services/admin-service";
import { getRequestUserId } from "@/lib/services/session-service";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { projectSlug: string } },
) {
  try {
    const { projectSlug } = routeParamsSchema.parse(params);

    return NextResponse.json(
      await getAdminDashboard(projectSlug, getRequestUserId(request)),
    );
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { projectSlug: string } },
) {
  try {
    const { projectSlug } = routeParamsSchema.parse(params);
    const body = dashboardConfigSchema.parse(await request.json());

    return NextResponse.json(
      await updateAdminDashboard(
        projectSlug,
        getRequestUserId(request),
        body.sections,
      ),
    );
  } catch (error) {
    return jsonError(error);
  }
}
