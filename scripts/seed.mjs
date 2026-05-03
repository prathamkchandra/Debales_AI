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
