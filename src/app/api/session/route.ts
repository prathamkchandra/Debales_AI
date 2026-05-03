import { NextResponse } from "next/server";

import { jsonError } from "@/lib/http";
import { sessionRequestSchema } from "@/lib/schemas";
import {
  DEMO_USER_COOKIE,
  getRequestUserId,
  getSessionPayload,
} from "@/lib/services/session-service";

export async function GET(request: Request) {
  try {
    return NextResponse.json(await getSessionPayload(getRequestUserId(request)));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = sessionRequestSchema.parse(await request.json());
    const payload = await getSessionPayload(userId);
    const response = NextResponse.json(payload);

    response.cookies.set(DEMO_USER_COOKIE, userId, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    return jsonError(error);
  }
}
