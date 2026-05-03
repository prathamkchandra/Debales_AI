import { NextResponse } from "next/server";

import { jsonError } from "@/lib/http";
import { chatRequestSchema, routeParamsSchema } from "@/lib/schemas";
import { sendChatMessage } from "@/lib/services/chat-service";
import { getRequestUserId } from "@/lib/services/session-service";

export async function POST(
  request: Request,
  { params }: { params: { projectSlug: string } },
) {
  try {
    const { projectSlug } = routeParamsSchema.parse(params);
    const body = chatRequestSchema.parse(await request.json());

    return NextResponse.json(
      await sendChatMessage(
        projectSlug,
        body.conversationId,
        getRequestUserId(request),
        body.content,
      ),
    );
  } catch (error) {
    return jsonError(error);
  }
}
