import { z } from "zod";

export const routeParamsSchema = z.object({
  projectSlug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/),
});

export const conversationParamsSchema = routeParamsSchema.extend({
  conversationId: z.string().min(3).max(120),
});

export const chatRequestSchema = z.object({
  conversationId: z.string().min(3).max(120),
  content: z.string().trim().min(1).max(1200),
});

export const createConversationSchema = z.object({
  title: z.string().trim().min(2).max(80).optional(),
});

export const sessionRequestSchema = z.object({
  userId: z.string().min(3).max(80),
});

const integrationKeySchema = z.enum(["shopify", "crm"]);

const metricWidgetSchema = z.object({
  id: z.string().min(2),
  type: z.literal("metric"),
  label: z.string().min(2),
  value: z.string().min(1),
  delta: z.string().min(1),
  tone: z.enum(["good", "watch", "risk"]),
});

const insightWidgetSchema = z.object({
  id: z.string().min(2),
  type: z.literal("insight"),
  label: z.string().min(2),
  body: z.string().min(2),
  severity: z.enum(["info", "warning", "critical"]),
});

const integrationStatusWidgetSchema = z.object({
  id: z.string().min(2),
  type: z.literal("integrationStatus"),
  label: z.string().min(2),
  integrations: z.array(integrationKeySchema).min(1),
});

const integrationRecordsWidgetSchema = z.object({
  id: z.string().min(2),
  type: z.literal("integrationRecords"),
  label: z.string().min(2),
  integration: integrationKeySchema,
  emptyState: z.string().min(2).optional(),
});

const listWidgetSchema = z.object({
  id: z.string().min(2),
  type: z.literal("list"),
  label: z.string().min(2),
  items: z.array(z.string().min(1)).min(1),
});

const actionWidgetSchema = z.object({
  id: z.string().min(2),
  type: z.literal("action"),
  label: z.string().min(2),
  cta: z.string().min(2),
  target: z.string().min(1),
});

export const dashboardWidgetSchema = z.discriminatedUnion("type", [
  metricWidgetSchema,
  insightWidgetSchema,
  integrationStatusWidgetSchema,
  integrationRecordsWidgetSchema,
  listWidgetSchema,
  actionWidgetSchema,
]);

export const dashboardConfigSchema = z.object({
  sections: z
    .array(
      z.object({
        id: z.string().min(2),
        title: z.string().min(2),
        description: z.string().min(2),
        widgets: z.array(dashboardWidgetSchema).min(1),
      }),
    )
    .min(1),
});

export const productRecordsSchema = z.object({
  integration: integrationKeySchema,
  records: z.array(z.string().trim().min(1).max(240)).max(50),
});
