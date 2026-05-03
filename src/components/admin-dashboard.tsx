"use client";

import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ClipboardList,
  Database,
  LayoutDashboard,
  MessageSquare,
  Plus,
  RefreshCw,
  Save,
  Settings2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { LoginSwitcher } from "@/components/login-switcher";
import { ErrorPanel, LoadingPanel } from "@/components/state-panels";
import {
  useDashboard,
  useSaveDashboard,
  useSaveProductRecords,
} from "@/hooks/use-dashboard";
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

function normalizeRecords(records: string[]) {
  return records.map((record) => record.trim()).filter(Boolean);
}

function ProductRecordsEditor({
  productInstance,
  isSaving,
  error,
  onSave,
}: {
  productInstance: ProductInstance;
  isSaving: boolean;
  error: Error | null;
  onSave: (records: string[]) => void;
}) {
  const sourceRecords = useMemo(
    () => productInstance.integrations.shopify.mockRecords,
    [productInstance.integrations.shopify.mockRecords],
  );
  const [records, setRecords] = useState(sourceRecords);
  const [draft, setDraft] = useState("");
  const normalizedRecords = normalizeRecords(records);
  const hasChanges =
    JSON.stringify(normalizedRecords) !== JSON.stringify(sourceRecords);

  useEffect(() => {
    setRecords(sourceRecords);
  }, [sourceRecords]);

  function updateRecord(index: number, value: string) {
    setRecords((current) =>
      current.map((record, itemIndex) => (itemIndex === index ? value : record)),
    );
  }

  function addRecord() {
    const value = draft.trim();

    if (!value) {
      return;
    }

    setRecords((current) => [...current, value]);
    setDraft("");
  }

  function removeRecord(index: number) {
    setRecords((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  return (
    <aside className="rounded-md border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <ClipboardList className="size-4 text-teal-700" aria-hidden="true" />
        <h2 className="font-semibold text-stone-950">Product records</h2>
      </div>
      <p className="mt-2 text-sm leading-6 text-stone-600">
        Edit the Shopify-style product records used by chat and by product
        record widgets on this dashboard.
      </p>

      <div className="mt-4 space-y-3">
        {records.map((record, index) => (
          <div key={`record-${index}`} className="flex items-start gap-2">
            <label className="sr-only" htmlFor={`record-${index}`}>
              Product record {index + 1}
            </label>
            <textarea
              id={`record-${index}`}
              value={record}
              onChange={(event) => updateRecord(index, event.target.value)}
              rows={2}
              className="min-h-16 flex-1 resize-none rounded-md border border-stone-300 px-3 py-2 text-sm leading-5 outline-none ring-teal-600 focus:ring-2"
            />
            <button
              type="button"
              onClick={() => removeRecord(index)}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
              aria-label={`Delete product record ${index + 1}`}
              title="Delete product record"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <label
            htmlFor="new-product-record"
            className="text-xs font-medium text-stone-600"
          >
            Add product
          </label>
          <input
            id="new-product-record"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Nova Tee: 35 units in stock, launch ready"
            className="mt-1 h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none ring-teal-600 focus:ring-2"
          />
        </div>
        <button
          type="button"
          onClick={addRecord}
          disabled={!draft.trim()}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-stone-950 px-3 text-sm font-medium text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSave(normalizedRecords)}
          disabled={isSaving || !hasChanges}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-teal-700 px-3 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="size-4" aria-hidden="true" />
          Save products
        </button>
        <button
          type="button"
          onClick={() => setRecords(sourceRecords)}
          disabled={isSaving || !hasChanges}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      {error ? (
        <p className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error.message}
        </p>
      ) : null}
    </aside>
  );
}

function WidgetConfigEditor({
  sections,
  isSaving,
  error,
  onSave,
}: {
  sections: DashboardSection[];
  isSaving: boolean;
  error: Error | null;
  onSave: (sections: DashboardSection[]) => void;
}) {
  const [draftSections, setDraftSections] = useState(sections);
  const hasChanges =
    JSON.stringify(draftSections) !== JSON.stringify(sections);
  const layoutIsValid = draftSections.every(
    (section) =>
      section.title.trim().length >= 2 &&
      section.description.trim().length >= 2 &&
      section.widgets.length > 0 &&
      section.widgets.every((widget) => widget.label.trim().length >= 2),
  );

  useEffect(() => {
    setDraftSections(sections);
  }, [sections]);

  function updateSectionTitle(sectionId: string, title: string) {
    setDraftSections((current) =>
      current.map((section) =>
        section.id === sectionId ? { ...section, title } : section,
      ),
    );
  }

  function updateWidgetLabel(
    sectionId: string,
    widgetId: string,
    label: string,
  ) {
    setDraftSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              widgets: section.widgets.map((widget) =>
                widget.id === widgetId ? { ...widget, label } : widget,
              ),
            }
          : section,
      ),
    );
  }

  function moveWidget(sectionId: string, widgetId: string, direction: -1 | 1) {
    setDraftSections((current) =>
      current.map((section) => {
        if (section.id !== sectionId) {
          return section;
        }

        const index = section.widgets.findIndex((widget) => widget.id === widgetId);
        const nextIndex = index + direction;

        if (index < 0 || nextIndex < 0 || nextIndex >= section.widgets.length) {
          return section;
        }

        const widgets = [...section.widgets];
        const [widget] = widgets.splice(index, 1);
        widgets.splice(nextIndex, 0, widget);

        return { ...section, widgets };
      }),
    );
  }

  function deleteWidget(sectionId: string, widgetId: string) {
    setDraftSections((current) =>
      current.map((section) =>
        section.id === sectionId && section.widgets.length > 1
          ? {
              ...section,
              widgets: section.widgets.filter((widget) => widget.id !== widgetId),
            }
          : section,
      ),
    );
  }

  function addProductWidget(sectionId: string) {
    const nextWidget: DashboardWidget = {
      id: `catalog-records-${Date.now().toString(36)}`,
      type: "integrationRecords",
      label: "Product catalog records",
      integration: "shopify",
      emptyState: "Add Shopify-style mock records to this product instance.",
    };

    setDraftSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? { ...section, widgets: [...section.widgets, nextWidget] }
          : section,
      ),
    );
  }

  function saveDraftSections() {
    const nextSections = draftSections.map((section) => ({
      ...section,
      title: section.title.trim(),
      description: section.description.trim(),
      widgets: section.widgets.map(
        (widget) =>
          ({
            ...widget,
            label: widget.label.trim(),
          }) as DashboardWidget,
      ),
    }));

    onSave(nextSections);
  }

  return (
    <section className="mt-5 rounded-md border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
            Dashboard editor
          </p>
          <h2 className="mt-1 text-xl font-semibold text-stone-950">
            Sections and widgets
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-stone-600">
            Change section titles, widget labels, widget order, and widget list.
            Saving writes the MongoDB-backed dashboard config.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={saveDraftSections}
            disabled={isSaving || !hasChanges || !layoutIsValid}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-teal-700 px-3 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="size-4" aria-hidden="true" />
            Save layout
          </button>
          <button
            type="button"
            onClick={() => setDraftSections(sections)}
            disabled={isSaving || !hasChanges}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {draftSections.map((section) => (
          <div
            key={section.id}
            className="rounded-md border border-stone-200 bg-stone-50 p-4"
          >
            <div>
              <label
                htmlFor={`section-title-${section.id}`}
                className="text-xs font-medium text-stone-600"
              >
                Section title
              </label>
              <input
                id={`section-title-${section.id}`}
                value={section.title}
                onChange={(event) =>
                  updateSectionTitle(section.id, event.target.value)
                }
                className="mt-1 h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm font-semibold outline-none ring-teal-600 focus:ring-2"
              />
            </div>

            <div className="mt-4 space-y-2">
              {section.widgets.map((widget, index) => (
                <div
                  key={widget.id}
                  className="rounded-md border border-stone-200 bg-white p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-sm bg-stone-100 px-2 py-1 font-mono text-[11px] text-stone-600">
                      {widget.type}
                    </span>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => moveWidget(section.id, widget.id, -1)}
                        disabled={index === 0}
                        className="inline-flex size-8 items-center justify-center rounded-md border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Move ${widget.label} up`}
                        title="Move up"
                      >
                        <ArrowUp className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveWidget(section.id, widget.id, 1)}
                        disabled={index === section.widgets.length - 1}
                        className="inline-flex size-8 items-center justify-center rounded-md border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Move ${widget.label} down`}
                        title="Move down"
                      >
                        <ArrowDown className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteWidget(section.id, widget.id)}
                        disabled={section.widgets.length <= 1}
                        className="inline-flex size-8 items-center justify-center rounded-md border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Delete ${widget.label}`}
                        title="Delete widget"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <label
                    htmlFor={`widget-label-${section.id}-${widget.id}`}
                    className="mt-3 block text-xs font-medium text-stone-600"
                  >
                    Widget label
                  </label>
                  <input
                    id={`widget-label-${section.id}-${widget.id}`}
                    value={widget.label}
                    onChange={(event) =>
                      updateWidgetLabel(section.id, widget.id, event.target.value)
                    }
                    className="mt-1 h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none ring-teal-600 focus:ring-2"
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addProductWidget(section.id)}
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-100"
            >
              <Plus className="size-4" aria-hidden="true" />
              Add product widget
            </button>
          </div>
        ))}
      </div>

      {error ? (
        <p className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error.message}
        </p>
      ) : null}
    </section>
  );
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
  const saveProductRecords = useSaveProductRecords(projectSlug);

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

  function saveProductCatalog(records: string[]) {
    saveProductRecords.mutate({
      integration: "shopify",
      records,
    });
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

          <ProductRecordsEditor
            productInstance={productInstance}
            isSaving={saveProductRecords.isPending}
            error={(saveProductRecords.error as Error | null) ?? null}
            onSave={saveProductCatalog}
          />
        </section>

        <WidgetConfigEditor
          sections={config.sections}
          isSaving={saveDashboard.isPending}
          error={(saveDashboard.error as Error | null) ?? null}
          onSave={saveSections}
        />

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
