import { NextResponse } from "next/server";

import { jsonError } from "@/lib/http";
import { createConversationSchema, routeParamsSchema } from "@/lib/schemas";
import { createConversation } from "@/lib/services/chat-service";
import { getProjectContext } from "@/lib/services/project-service";
import { getRequestUserId } from "@/lib/services/session-service";

export async function GET(
  request: Request,
  { params }: { params: { projectSlug: string } },
) {
  try {
    const { projectSlug } = routeParamsSchema.parse(params);
    const context = await getProjectContext(projectSlug, getRequestUserId(request));

    return NextResponse.json(context.conversations);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: { projectSlug: string } },
) {
  try {
    const { projectSlug } = routeParamsSchema.parse(params);
    const body = createConversationSchema.parse(await request.json());

    return NextResponse.json(
      await createConversation(
        projectSlug,
        getRequestUserId(request),
        body.title ?? "New sales assist",
      ),
      { status: 201 },
    );
  } catch (error) {
    return jsonError(error);
  }
}
