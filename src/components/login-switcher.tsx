"use client";

import { UserRound } from "lucide-react";

import { useSession, useSwitchUser } from "@/hooks/use-session";

export function LoginSwitcher() {
  const session = useSession();
  const switchUser = useSwitchUser();

  if (session.isLoading) {
    return (
      <div className="h-10 w-44 animate-pulse rounded-md bg-stone-200" />
    );
  }

  if (!session.data) {
    return null;
  }

  return (
    <label className="flex min-w-0 items-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm">
      <UserRound className="size-4 shrink-0 text-teal-700" aria-hidden="true" />
      <span className="sr-only">Login as</span>
      <select
        className="min-w-0 bg-transparent text-sm font-medium text-stone-800 outline-none"
        value={session.data.currentUser.id}
        disabled={switchUser.isPending}
        onChange={(event) => switchUser.mutate(event.target.value)}
      >
        {session.data.users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
    </label>
  );
}
