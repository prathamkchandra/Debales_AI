import type {
  Conversation,
  DashboardConfig,
  DemoUser,
  ProductInstance,
  Project,
} from "@/lib/types";

export const projects: Project[] = [
  {
    id: "project-acme",
    slug: "acme-retail",
    name: "Acme Retail",
    segment: "DTC commerce",
    description:
      "A multi-tenant storefront operator using Debales AI to support revenue, catalog, and customer workflows.",
    health: "strong",
  },
  {
    id: "project-northstar",
    slug: "northstar-b2b",
    name: "Northstar B2B",
    segment: "Wholesale operations",
    description:
      "A second tenant included to prove project scoping and role-based access.",
    health: "watch",
  },
];

export const productInstances: ProductInstance[] = [
  {
    id: "pi-sales-acme",
    projectId: "project-acme",
    namespace: "acme-sales",
    productType: "sales-assistant",
    name: "AI Sales Assistant",
    integrations: {
      shopify: {
        key: "shopify",
        label: "Shopify-style catalog",
        enabled: true,
        status: "connected",
        mockRecords: [
          "Velocity Hoodie: 42 units in stock, 18% conversion lift",
          "Trail Bottle: 7 units in stock, restock recommended",
          "Gift Kit: bundled SKU, high margin, campaign ready",
        ],
      },
      crm: {
        key: "crm",
        label: "CRM-style accounts",
        enabled: true,
        status: "connected",
        mockRecords: [
          "Mira Chen: VIP customer, last order 4 days ago",
          "Atlas Fitness: wholesale lead, proposal pending",
          "Retention cohort: 128 customers inactive for 30 days",
        ],
      },
    },
  },
  {
    id: "pi-sales-northstar",
    projectId: "project-northstar",
    namespace: "northstar-sales",
    productType: "sales-assistant",
    name: "AI Sales Assistant",
    integrations: {
      shopify: {
        key: "shopify",
        label: "Shopify-style catalog",
        enabled: false,
        status: "disabled",
        mockRecords: ["Catalog sync disabled for this tenant"],
      },
      crm: {
        key: "crm",
        label: "CRM-style accounts",
        enabled: true,
        status: "degraded",
        mockRecords: ["CRM mock returns account summaries only"],
      },
    },
  },
];

export const users: DemoUser[] = [
  {
    id: "user-admin",
    name: "Ava Morgan",
    email: "ava@debales.ai",
    title: "Project admin",
    projectRoles: [
      { projectId: "project-acme", role: "admin" },
      { projectId: "project-northstar", role: "member" },
    ],
  },
  {
    id: "user-member",
    name: "Noah Patel",
    email: "noah@debales.ai",
    title: "Sales operator",
    projectRoles: [{ projectId: "project-acme", role: "member" }],
  },
  {
    id: "user-outsider",
    name: "Iris Lee",
    email: "iris@example.com",
    title: "Support analyst",
    projectRoles: [
      { projectId: "project-acme", role: "member" },
      { projectId: "project-northstar", role: "member" },
    ],
  },
];

export const conversations: Conversation[] = [
  {
    id: "conv-sales",
    projectId: "project-acme",
    productInstanceId: "pi-sales-acme",
    title: "Q4 revenue triage",
    status: "active",
    updatedAt: "2026-05-02T08:30:00.000Z",
    messages: [
      {
        id: "msg-1",
        role: "assistant",
        content:
          "I am ready to help with Acme Retail. Shopify-style catalog and CRM-style account context are both enabled for this project.",
        createdAt: "2026-05-02T08:30:00.000Z",
      },
      {
        id: "msg-2",
        role: "user",
        content: "What should we do first to lift repeat purchases this week?",
        createdAt: "2026-05-02T08:31:00.000Z",
      },
      {
        id: "msg-3",
        role: "step",
        content: "Checked tenant access, product instance scope, and integration toggles.",
        createdAt: "2026-05-02T08:31:02.000Z",
      },
      {
        id: "msg-4",
        role: "assistant",
        content:
          "Start with the inactive 30-day CRM cohort and pair it with Gift Kit bundles. The CRM mock shows 128 customers ready for a win-back, and Shopify-style data says the bundle has margin room for a limited incentive.",
        createdAt: "2026-05-02T08:31:05.000Z",
      },
    ],
  },
  {
    id: "conv-catalog",
    projectId: "project-acme",
    productInstanceId: "pi-sales-acme",
    title: "Catalog risk check",
    status: "active",
    updatedAt: "2026-05-02T09:10:00.000Z",
    messages: [
      {
        id: "msg-5",
        role: "assistant",
        content:
          "Ask me about low-stock SKUs, VIP customers, campaign ideas, or integration status.",
        createdAt: "2026-05-02T09:10:00.000Z",
      },
    ],
  },
];

export const dashboardConfigs: DashboardConfig[] = [
  {
    id: "dash-acme-sales",
    projectId: "project-acme",
    updatedAt: "2026-05-02T09:20:00.000Z",
    sections: [
      {
        id: "exec",
        title: "Executive pulse",
        description:
          "Config-driven widgets loaded from the admin dashboard document.",
        widgets: [
          {
            id: "metric-revenue",
            type: "metric",
            label: "Influenced revenue",
            value: "$84.2k",
            delta: "+12.4% vs last week",
            tone: "good",
          },
          {
            id: "metric-risk",
            type: "metric",
            label: "At-risk accounts",
            value: "18",
            delta: "5 need same-day action",
            tone: "watch",
          },
          {
            id: "integration-health",
            type: "integrationStatus",
            label: "Enabled integrations",
            integrations: ["shopify", "crm"],
          },
        ],
      },
      {
        id: "ops",
        title: "Recommended actions",
        description:
          "Changing this section in MongoDB changes only this dashboard.",
        widgets: [
          {
            id: "insight-low-stock",
            type: "insight",
            label: "Inventory watch",
            body: "Trail Bottle has only 7 units left. Pause paid bundles that include it until replenishment is confirmed.",
            severity: "warning",
          },
          {
            id: "list-playbook",
            type: "list",
            label: "This week's playbook",
            items: [
              "Win back 30-day inactive customers",
              "Promote Gift Kit to VIP segment",
              "Route wholesale lead Atlas Fitness to sales",
            ],
          },
          {
            id: "catalog-records",
            type: "integrationRecords",
            label: "Product catalog records",
            integration: "shopify",
            emptyState: "Add Shopify-style mock records to this product instance.",
          },
          {
            id: "action-video-proof",
            type: "action",
            label: "Config proof",
            cta: "Edit dashboard_configs.sections in MongoDB and refresh",
            target: "dashboard_configs",
          },
        ],
      },
    ],
  },
];

export const seedStore = {
  projects,
  productInstances,
  users,
  conversations,
  dashboardConfigs,
};
