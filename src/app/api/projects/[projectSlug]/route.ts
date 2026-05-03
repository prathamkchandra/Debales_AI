import { NextResponse } from "next/server";

import { jsonError } from "@/lib/http";
import { routeParamsSchema } from "@/lib/schemas";
import { getProjectContext } from "@/lib/services/project-service";
import { getRequestUserId } from "@/lib/services/session-service";

export async function GET(
  request: Request,
  { params }: { params: { projectSlug: string } },
) {
  try {
    const { projectSlug } = routeParamsSchema.parse(params);

    return NextResponse.json(
      await getProjectContext(projectSlug, getRequestUserId(request)),
    );
  } catch (error) {
    return jsonError(error);
  }
}
