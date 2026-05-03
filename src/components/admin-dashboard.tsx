"use client";

import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Database,
  LayoutDashboard,
  MessageSquare,
  RefreshCw,
  Save,
  Settings2,
} from "lucide-react";
import Link from "next/link";

import { LoginSwitcher } from "@/components/login-switcher";
import { ErrorPanel, LoadingPanel } from "@/components/state-panels";
import { useDashboard, useSaveDashboard } from "@/hooks/use-dashboard";
import type {
  DashboardSection,
  DashboardWidget,
  IntegrationConfig,
  ProductInstance,
} from "@/lib/types";
import { cn } from "@/lib/utils";

function toneClasses(tone: "good" | "watch" | "risk") {
  return {
    good: "border-teal-200 bg-teal-50 text-teal-950",
    watch: "border-amber-200 bg-amber-50 text-amber-950",
    risk: "border-rose-200 bg-rose-50 text-rose-950",
  }[tone];
}

function severityClasses(severity: "info" | "warning" | "critical") {
  return {
    info: "border-sky-200 bg-sky-50 text-sky-950",
    warning: "border-amber-200 bg-amber-50 text-amber-950",
    critical: "border-rose-200 bg-rose-50 text-rose-950",
  }[severity];
}

function WidgetRenderer({
  widget,
  productInstance,
}: {
  widget: DashboardWidget;
  productInstance: ProductInstance;
}) {
  if (widget.type === "metric") {
    return (
      <article className={cn("rounded-md border p-4", toneClasses(widget.tone))}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">{widget.label}</p>
          <Activity className="size-4 shrink-0" aria-hidden="true" />
        </div>
        <p className="mt-3 text-3xl font-semibold tracking-normal">{widget.value}</p>
        <p className="mt-2 text-sm">{widget.delta}</p>
      </article>
    );
  }

  if (widget.type === "insight") {
    return (
      <article
        className={cn("rounded-md border p-4", severityClasses(widget.severity))}
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div>
            <h3 className="font-semibold">{widget.label}</h3>
            <p className="mt-2 text-sm leading-6">{widget.body}</p>
          </div>
        </div>
      </article>
    );
  }

  if (widget.type === "integrationStatus") {
    return (
      <article className="rounded-md border border-stone-200 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-stone-950">{widget.label}</h3>
          <Database className="size-4 text-teal-700" aria-hidden="true" />
        </div>
        <div className="mt-4 space-y-2">
          {widget.integrations.map((key) => {
            const integration = productInstance.integrations[key] as IntegrationConfig;

            return (
              <div
                key={key}
                className="flex items-center justify-between gap-3 rounded-md border border-stone-200 px-3 py-2 text-sm"
              >
                <span className="font-medium text-stone-800">
                  {integration.label}
                </span>
                <span
                  className={cn(
                    "rounded-sm px-2 py-1 text-xs font-semibold uppercase",
                    integration.enabled
                      ? "bg-teal-100 text-teal-800"
                      : "bg-stone-100 text-stone-500",
                  )}
                >
                  {integration.status}
                </span>
              </div>
            );
          })}
        </div>
      </article>
    );
  }

  if (widget.type === "integrationRecords") {
    const integration = productInstance.integrations[widget.integration] as
      | IntegrationConfig
      | undefined;
    const records = integration?.mockRecords ?? [];

    return (
      <article className="rounded-md border border-stone-200 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="size-4 text-teal-700" aria-hidden="true" />
            <h3 className="font-semibold text-stone-950">{widget.label}</h3>
          </div>
          {integration ? (
            <span
              className={cn(
                "rounded-sm px-2 py-1 text-xs font-semibold uppercase",
                integration.enabled
                  ? "bg-teal-100 text-teal-800"
                  : "bg-stone-100 text-stone-500",
              )}
            >
              {integration.status}
            </span>
          ) : null}
        </div>
        {integration ? (
          <p className="mt-2 text-xs font-medium text-stone-500">
            {integration.label}
          </p>
        ) : null}
        {records.length > 0 ? (
          <ul className="mt-4 space-y-3 text-sm text-stone-700">
            {records.map((record) => (
              <li key={record} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-teal-700" />
                <span>{record}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600">
            {widget.emptyState ?? "No records are available for this integration."}
          </p>
        )}
      </article>
    );
  }

  if (widget.type === "list") {
    return (
      <article className="rounded-md border border-stone-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="size-4 text-teal-700" aria-hidden="true" />
          <h3 className="font-semibold text-stone-950">{widget.label}</h3>
        </div>
        <ul className="mt-4 space-y-3 text-sm text-stone-700">
          {widget.items.map((item) => (
            <li key={item} className="flex gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-teal-700" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </article>
    );
  }

  return (
    <article className="rounded-md border border-stone-200 bg-stone-950 p-4 text-white">
      <div className="flex items-center gap-2">
        <Settings2 className="size-4 text-amber-300" aria-hidden="true" />
        <h3 className="font-semibold">{widget.label}</h3>
      </div>
      <p className="mt-3 text-sm leading-6 text-stone-200">{widget.cta}</p>
      <p className="mt-4 rounded-md bg-white/10 px-3 py-2 font-mono text-xs">
        {widget.target}
      </p>
    </article>
  );
}

export function AdminDashboard({ projectSlug }: { projectSlug: string }) {
  const dashboard = useDashboard(projectSlug);
  const saveDashboard = useSaveDashboard(projectSlug);

  if (dashboard.isLoading) {
    return <LoadingPanel label="Loading admin dashboard" />;
  }

  if (dashboard.error || !dashboard.data) {
    return (
      <ErrorPanel
        message={
          (dashboard.error as Error | undefined)?.message ??
          "Unable to load the dashboard config."
        }
      />
    );
  }

  const { project, productInstance, config } = dashboard.data;

  function saveSections(sections: DashboardSection[]) {
    saveDashboard.mutate(sections);
  }

  function rotateFirstSection() {
    const nextSections = config.sections.map((section, index) =>
      index === 0
        ? { ...section, widgets: [...section.widgets].reverse() }
        : section,
    );

    saveSections(nextSections);
  }

  function renameFirstSection() {
    const nextSections = config.sections.map((section, index) =>
      index === 0
        ? {
            ...section,
            title: section.title.includes("edited")
              ? "Executive pulse"
              : "Executive pulse edited",
          }
        : section,
    );

    saveSections(nextSections);
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-950">
      <header className="border-b border-stone-200 bg-white">
        <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-teal-700 text-white">
              <LayoutDashboard className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
                Admin dashboard
              </p>
              <h1 className="truncate text-base font-semibold sm:text-lg">
                {project.name} config-driven control room
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/projects/${projectSlug}/chat/conv-sales`}
              className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-100"
            >
              <MessageSquare className="size-4" aria-hidden="true" />
              Chat
            </Link>
            <LoginSwitcher />
          </div>
        </div>
      </header>

      <main className="px-4 py-5 sm:px-6" data-testid="admin-dashboard">
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-md border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
              MongoDB document
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950">
              {config.id}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">
              This page maps the stored dashboard config into widgets. The chat
              shell stays conventional, while this dashboard changes when the
              stored sections or widget order change.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
                <p className="text-xs text-stone-500">Collection</p>
                <p className="mt-1 font-mono text-sm font-semibold">
                  dashboard_configs
                </p>
              </div>
              <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
                <p className="text-xs text-stone-500">Project ID</p>
                <p className="mt-1 font-mono text-sm font-semibold">
                  {config.projectId}
                </p>
              </div>
              <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
                <p className="text-xs text-stone-500">Updated</p>
                <p className="mt-1 text-sm font-semibold">
                  {new Date(config.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <aside className="rounded-md border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Save className="size-4 text-teal-700" aria-hidden="true" />
              <h2 className="font-semibold text-stone-950">Config edit demo</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              These buttons PATCH the same config document shape that MongoDB
              stores. Refreshing keeps the changed dashboard layout in the active
              data store.
            </p>
            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={rotateFirstSection}
                disabled={saveDashboard.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-stone-950 px-3 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                Rotate first section widgets
              </button>
              <button
                type="button"
                onClick={renameFirstSection}
                disabled={saveDashboard.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Settings2 className="size-4" aria-hidden="true" />
                Toggle section title
              </button>
            </div>
            {saveDashboard.error ? (
              <p className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                {(saveDashboard.error as Error).message}
              </p>
            ) : null}
          </aside>
        </section>

        <div className="mt-5 space-y-5">
          {config.sections.map((section) => (
            <section
              key={section.id}
              className="rounded-md border border-stone-200 bg-white p-5 shadow-sm"
              data-testid="config-driven-section"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
                    Section: {section.id}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-stone-950">
                    {section.title}
                  </h2>
                  <p className="mt-1 max-w-3xl text-sm leading-6 text-stone-600">
                    {section.description}
                  </p>
                </div>
                <span className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-600">
                  {section.widgets.length} widgets
                </span>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {section.widgets.map((widget) => (
                  <WidgetRenderer
                    key={widget.id}
                    widget={widget}
                    productInstance={productInstance}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
