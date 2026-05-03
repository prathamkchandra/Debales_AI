import { NextResponse } from "next/server";

import { jsonError } from "@/lib/http";
import { conversationParamsSchema } from "@/lib/schemas";
import { getConversationForUser } from "@/lib/services/chat-service";
import { getRequestUserId } from "@/lib/services/session-service";

export async function GET(
  request: Request,
  { params }: { params: { projectSlug: string; conversationId: string } },
) {
  try {
    const { projectSlug, conversationId } =
      conversationParamsSchema.parse(params);

    return NextResponse.json(
      await getConversationForUser(
        projectSlug,
        conversationId,
        getRequestUserId(request),
      ),
    );
  } catch (error) {
    return jsonError(error);
  }
}
