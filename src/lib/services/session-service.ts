import { cookies } from "next/headers";

import { getUserById, listUsers } from "@/lib/services/store";
import type { DemoUser, SessionPayload } from "@/lib/types";

export const DEMO_USER_COOKIE = "debales_user";
export const DEFAULT_USER_ID = "user-admin";

function parseCookieHeader(header: string | null) {
  if (!header) {
    return new Map<string, string>();
  }

  return new Map(
    header.split(";").map((part) => {
      const [key, ...value] = part.trim().split("=");
      return [key, decodeURIComponent(value.join("="))];
    }),
  );
}

export function getRequestUserId(request: Request) {
  return (
    parseCookieHeader(request.headers.get("cookie")).get(DEMO_USER_COOKIE) ??
    DEFAULT_USER_ID
  );
}

export function getPageUserId() {
  return cookies().get(DEMO_USER_COOKIE)?.value ?? DEFAULT_USER_ID;
}

export async function getCurrentUser(userId = DEFAULT_USER_ID) {
  return (await getUserById(userId)) ?? (await getUserById(DEFAULT_USER_ID));
}

export async function getSessionPayload(userId = DEFAULT_USER_ID) {
  const [users, currentUser] = await Promise.all([
    listUsers(),
    getCurrentUser(userId),
  ]);

  return {
    currentUser: currentUser as DemoUser,
    users,
  } satisfies SessionPayload;
}
