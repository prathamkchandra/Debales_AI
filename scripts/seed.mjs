import mongoose from "mongoose";
import fs from "node:fs";
import path from "node:path";

function loadLocalEnv() {
  const envPath = path.join(process.cwd(), ".env.local");

  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    if (!line || line.trim().startsWith("#") || !line.includes("=")) {
      continue;
    }

    const [key, ...valueParts] = line.split("=");
    const value = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
    process.env[key.trim()] ??= value;
  }
}

loadLocalEnv();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "Debales_ai";

if (!uri) {
  console.error("MONGODB_URI is required for npm run seed.");
  process.exit(1);
}

const projects = [
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

const productInstances = [
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
];

const users = [
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

const conversations = [
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
    ],
  },
];

const dashboardConfigs = [
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
      {
        id: "revenue",
        title: "Revenue operations",
        description:
          "Sales and merchandising signals controlled by the dashboard config document.",
        widgets: [
          {
            id: "metric-aov",
            type: "metric",
            label: "Average order value",
            value: "$72",
            delta: "+5.1% vs last week",
            tone: "good",
          },
          {
            id: "metric-wholesale-pipeline",
            type: "metric",
            label: "Wholesale pipeline",
            value: "$31k",
            delta: "Atlas Fitness proposal pending",
            tone: "watch",
          },
          {
            id: "insight-bundle-opportunity",
            type: "insight",
            label: "Bundle opportunity",
            body: "Gift Kit has margin room and is campaign ready. Pair it with the inactive customer cohort before expanding paid spend.",
            severity: "info",
          },
        ],
      },
      {
        id: "customer-growth",
        title: "Customer growth",
        description:
          "CRM-oriented widgets that can be reordered or renamed from MongoDB.",
        widgets: [
          {
            id: "crm-records",
            type: "integrationRecords",
            label: "CRM account records",
            integration: "crm",
            emptyState: "Add CRM-style mock records to this product instance.",
          },
          {
            id: "list-priority-segments",
            type: "list",
            label: "Priority segments",
            items: [
              "VIP buyers with recent purchase intent",
              "Wholesale leads with open proposals",
              "30-day inactive customers for win-back",
            ],
          },
          {
            id: "insight-vip-follow-up",
            type: "insight",
            label: "VIP follow-up",
            body: "Mira Chen ordered 4 days ago. Route a personalized Gift Kit offer while the account is still warm.",
            severity: "info",
          },
        ],
      },
      {
        id: "governance",
        title: "Admin governance",
        description:
          "Operational controls proving that dashboard behavior is stored as configuration.",
        widgets: [
          {
            id: "metric-config-widgets",
            type: "metric",
            label: "Config widgets",
            value: "16",
            delta: "Loaded from dashboard_configs.sections",
            tone: "good",
          },
          {
            id: "action-config-edit",
            type: "action",
            label: "MongoDB proof",
            cta: "Rename, reorder, add, or remove widgets in dashboard_configs and refresh this admin dashboard.",
            target: "dashboard_configs.sections",
          },
          {
            id: "integration-governance",
            type: "integrationStatus",
            label: "Integration governance",
            integrations: ["shopify", "crm"],
          },
        ],
      },
    ],
  },
];

const collections = [
  ["projects", projects],
  ["product_instances", productInstances],
  ["users", users],
  ["conversations", conversations],
  ["dashboard_configs", dashboardConfigs],
];

await mongoose.connect(uri, { dbName });

for (const [collection, docs] of collections) {
  const target = mongoose.connection.db.collection(collection);

  await target.deleteMany({});
  await target.insertMany(docs);
  console.log(`Seeded ${docs.length} ${collection} documents.`);
}

await mongoose.disconnect();
