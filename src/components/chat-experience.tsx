"use client";

import {
  Bot,
  Database,
  LayoutDashboard,
  MessageSquare,
  PanelLeft,
  Plus,
  Send,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { LoginSwitcher } from "@/components/login-switcher";
import { ErrorPanel, LoadingPanel } from "@/components/state-panels";
import {
  useConversation,
  useCreateConversation,
  useProject,
  useSendMessage,
} from "@/hooks/use-project";
import type { ChatMessage, IntegrationConfig } from "@/lib/types";
import { cn } from "@/lib/utils";

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function IntegrationBadge({ integration }: { integration: IntegrationConfig }) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium",
        integration.enabled
          ? "border-teal-200 bg-teal-50 text-teal-900"
          : "border-stone-200 bg-stone-100 text-stone-600",
      )}
    >
      <Database className="size-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{integration.label}</span>
      <span
        className={cn(
          "ml-auto rounded-sm px-1.5 py-0.5 text-[11px] uppercase",
          integration.enabled ? "bg-white text-teal-700" : "bg-white text-stone-500",
        )}
      >
        {integration.status}
      </span>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "step") {
    return (
      <div className="mx-auto flex w-full max-w-3xl items-center gap-2 rounded-md border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
        <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
        <span>{message.content}</span>
      </div>
    );
  }

  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-3xl rounded-md border px-4 py-3 shadow-sm",
          isUser
            ? "border-stone-900 bg-stone-950 text-white"
            : "border-stone-200 bg-white text-stone-900",
        )}
      >
        <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] opacity-70">
          {isUser ? "You" : "Assistant"}
          <span>{formatTime(message.createdAt)}</span>
        </div>
        <p className="text-sm leading-6">{message.content}</p>
      </div>
    </div>
  );
}

export function ChatExperience({
  projectSlug,
  conversationId,
}: {
  projectSlug: string;
  conversationId: string;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const projectQuery = useProject(projectSlug);
  const conversationQuery = useConversation(projectSlug, conversationId);
  const createConversation = useCreateConversation(projectSlug);
  const sendMessage = useSendMessage(projectSlug, conversationId);
  const projectContext = projectQuery.data;
  const conversation = conversationQuery.data;
  const integrations = useMemo(
    () =>
      projectContext
        ? Object.values(projectContext.productInstance.integrations)
        : [],
    [projectContext],
  );

  if (projectQuery.isLoading || conversationQuery.isLoading) {
    return <LoadingPanel label="Loading Debales AI" />;
  }

  if (projectQuery.error || conversationQuery.error || !projectContext || !conversation) {
    return (
      <ErrorPanel
        message={
          (projectQuery.error as Error | undefined)?.message ??
          (conversationQuery.error as Error | undefined)?.message ??
          "Unable to load this workspace."
        }
      />
    );
  }

  const role = projectContext.currentUser.projectRoles.find(
    (item) => item.projectId === projectContext.project.id,
  )?.role;

  function handleNewConversation() {
    createConversation.mutate("New sales assist", {
      onSuccess: (nextConversation) => {
        router.push(
          `/projects/${projectSlug}/chat/${nextConversation.id}`,
        );
      },
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();

    if (!content || sendMessage.isPending) {
      return;
    }

    sendMessage.mutate(content, {
      onSuccess: () => setDraft(""),
    });
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-950">
      <header className="border-b border-stone-200 bg-white">
        <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-stone-950 text-white">
              <Bot className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
                Debales AI
              </p>
              <h1 className="truncate text-base font-semibold sm:text-lg">
                {projectContext.project.name} - {projectContext.productInstance.name}
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-600">
              {role}
            </span>
            <Link
              href={`/projects/${projectSlug}/admin`}
              className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-100"
            >
              <LayoutDashboard className="size-4" aria-hidden="true" />
              Admin
            </Link>
            <LoginSwitcher />
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-65px)] grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside
          className="border-b border-stone-200 bg-white lg:border-b-0 lg:border-r"
          data-testid="conversation-sidebar"
        >
          <div className="flex items-center justify-between gap-2 border-b border-stone-200 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <PanelLeft className="size-4 text-teal-700" aria-hidden="true" />
              Conversations
            </div>
            <button
              type="button"
              onClick={handleNewConversation}
              disabled={createConversation.isPending}
              className="inline-flex size-9 items-center justify-center rounded-md bg-stone-950 text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Create conversation"
              title="Create conversation"
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
          </div>
          <nav className="space-y-2 p-3">
            {projectContext.conversations.map((item) => (
              <Link
                key={item.id}
                href={`/projects/${projectSlug}/chat/${item.id}`}
                className={cn(
                  "block rounded-md border p-3 text-sm transition hover:border-teal-300 hover:bg-teal-50",
                  item.id === conversationId
                    ? "border-teal-400 bg-teal-50"
                    : "border-stone-200 bg-white",
                )}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="mt-0.5 size-4 shrink-0 text-teal-700" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-stone-900">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      {item.messages.length} messages
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex min-h-[calc(100vh-65px)] flex-col" data-testid="chat-main">
          <section className="border-b border-stone-200 bg-white px-4 py-4 sm:px-6">
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(360px,520px)]">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
                  Tenant boundary
                </p>
                <h2 className="mt-1 text-xl font-semibold text-stone-950">
                  {conversation.title}
                </h2>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-stone-600">
                  {projectContext.project.description}
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {integrations.map((integration) => (
                  <IntegrationBadge key={integration.key} integration={integration} />
                ))}
              </div>
            </div>
          </section>

          <section className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
            {conversation.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {sendMessage.isPending ? (
              <div className="mx-auto w-full max-w-3xl rounded-md border border-dashed border-teal-300 bg-teal-50 px-3 py-2 text-xs font-medium text-teal-900">
                Assistant is checking access, integrations, and AI fallback rules.
              </div>
            ) : null}
          </section>

          <form
            onSubmit={handleSubmit}
            className="border-t border-stone-200 bg-white p-4 sm:p-5"
            data-testid="chat-input"
          >
            <div className="mx-auto flex max-w-4xl items-end gap-3">
              <label className="sr-only" htmlFor="message">
                Message
              </label>
              <textarea
                id="message"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={2}
                placeholder="Ask about campaigns, inventory risk, CRM follow-up, or integration status"
                className="min-h-12 flex-1 resize-none rounded-md border border-stone-300 bg-white px-3 py-3 text-sm leading-6 outline-none ring-teal-600 transition focus:ring-2"
              />
              <button
                type="submit"
                disabled={!draft.trim() || sendMessage.isPending}
                className="inline-flex size-12 shrink-0 items-center justify-center rounded-md bg-teal-700 text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-stone-300"
                aria-label="Send message"
                title="Send message"
              >
                <Send className="size-5" aria-hidden="true" />
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
