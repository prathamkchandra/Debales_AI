import { NextResponse } from "next/server";

import { jsonError } from "@/lib/http";
import { productRecordsSchema, routeParamsSchema } from "@/lib/schemas";
import { updateProductRecords } from "@/lib/services/admin-service";
import { getRequestUserId } from "@/lib/services/session-service";

export async function PATCH(
  request: Request,
  { params }: { params: { projectSlug: string } },
) {
  try {
    const { projectSlug } = routeParamsSchema.parse(params);
    const body = productRecordsSchema.parse(await request.json());

    return NextResponse.json(
      await updateProductRecords(
        projectSlug,
        getRequestUserId(request),
        body.integration,
        body.records,
      ),
    );
  } catch (error) {
    return jsonError(error);
  }
}
