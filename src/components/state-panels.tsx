import { AlertTriangle, Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";

import { LoginSwitcher } from "@/components/login-switcher";

export function LoadingPanel({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 text-stone-700">
      <div className="flex items-center gap-3 rounded-md border border-stone-200 bg-white px-4 py-3 shadow-sm">
        <Loader2 className="size-5 animate-spin text-teal-700" />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </div>
  );
}

export function ErrorPanel({ message }: { message: string }) {
  const isAccessError = message.toLowerCase().includes("access");

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 p-6">
      <div className="w-full max-w-md rounded-md border border-rose-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-5 text-rose-700" />
          <div>
            <h1 className="font-semibold text-stone-950">Something went wrong</h1>
            <p className="mt-1 text-sm text-stone-600">{message}</p>
            {isAccessError ? (
              <div className="mt-4">
                <LoginSwitcher />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ForbiddenPanel({
  projectSlug,
  message,
}: {
  projectSlug: string;
  message: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 p-6">
      <section className="w-full max-w-lg rounded-md border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-1 size-6 text-amber-700" />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
              Server authorization
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-stone-950">
              Admin dashboard protected
            </h1>
            <p className="mt-2 text-sm leading-6 text-stone-600">{message}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <LoginSwitcher />
              <Link
                href={`/projects/${projectSlug}/chat/conv-sales`}
                className="rounded-md border border-stone-300 px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-100"
              >
                Back to chat
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
