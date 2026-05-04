# Debales AI Internship Assignment

Multi-tenant AI assistant built with Next.js App Router, React, TypeScript, Tailwind CSS, TanStack Query, Zod, and Mongoose.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The root route opens `/projects/acme-retail/chat/conv-sales`.

The app also runs without MongoDB by using the seeded in-memory fallback in `src/lib/seed.ts`.

## Environment

```bash
MONGODB_URI=mongodb+srv://...
MONGODB_DB=Debales_ai
OPENROUTER_API_KEY=optional_free_tier_key
OPENROUTER_MODEL=google/gemini-2.0-flash-exp:free
GEMINI_API_KEY=optional_free_tier_key
GEMINI_MODEL=gemini-1.5-flash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

If no AI key is present, the service layer returns a message-aware local fallback and records the reason in the assistant response.

## Seed MongoDB

```bash
npm run seed
```

Collections:

- `projects`
- `product_instances`
- `users`
- `conversations`
- `dashboard_configs`

The required admin dashboard document is `dashboard_configs.id = "dash-acme-sales"` with `projectId = "project-acme"`.

## Architecture

Required flow is implemented as:

`Access rules -> Services -> Route handlers -> TanStack Query hooks -> UI`

Key files:

- Access: `src/lib/access.ts`
- Services: `src/lib/services/*`
- Route handlers: `src/app/api/projects/[projectSlug]/*`
- Hooks: `src/hooks/*`
- UI: `src/components/chat-experience.tsx`, `src/components/admin-dashboard.tsx`
- Mongoose models: `src/models/demo.ts`

## Auth And Authorization

Full auth is stubbed with a `debales_user` cookie and the "Login as" switcher.

Demo users:

- `Ava Morgan`: admin on `acme-retail`
- `Noah Patel`: member on `acme-retail`
- `Iris Lee`: outsider for `acme-retail`

Server checks protect project access and the admin dashboard. Switching to Noah or Iris blocks `/projects/acme-retail/admin`.

## Config-Driven Admin Proof

Only the admin dashboard is config-driven for the core requirement. The chat/product shell uses normal React components.

Config-driven behavior lives in:

- MongoDB collection: `dashboard_configs`
- Seed fallback: `src/lib/seed.ts`
- Seed script: `scripts/seed.mjs`
- Server service: `src/lib/services/admin-service.ts`
- API route: `src/app/api/projects/[projectSlug]/admin/dashboard/route.ts`
- Renderer/editor: `src/components/admin-dashboard.tsx`

The dashboard config controls section structure, section titles/descriptions, widget labels, widget type list, widget
order, and widget presence. The React component only contains reusable renderers for supported widget types.

To verify with MongoDB:

1. Seed MongoDB with `npm run seed`.
2. Open `/projects/acme-retail/admin` as Ava Morgan.
3. Edit the `dashboard_configs` document:

```js
db.dashboard_configs.updateOne(
  { id: "dash-acme-sales" },
  {
    $set: {
      "sections.0.title": "Executive pulse from MongoDB",
      "sections.0.widgets.0.value": "$91.7k"
    }
  }
)
```

4. Refresh the admin page. The dashboard changes without code changes. The chat UI remains unchanged.

The admin page includes safe edit controls that PATCH the same `sections` shape through the route handler.
It also includes admin edit controls for Shopify-style product records and for dashboard widgets:
edit labels, reorder widgets, delete widgets, and add a product-record widget to any section.

The dashboard renderer supports widget types such as `metric`, `insight`, `integrationStatus`, `integrationRecords`,
`list`, and `action`, but the section structure, labels, widget list, and widget order come from MongoDB. For example,
adding this widget to any `dashboard_configs.sections[n].widgets` array shows the product records from the Shopify-style
integration without changing React code:

```js
{
  id: "catalog-records",
  type: "integrationRecords",
  label: "Product catalog records",
  integration: "shopify",
  emptyState: "Add Shopify-style mock records to this product instance."
}
```

Reordering widgets is also just a document update. For example, moving `sections.1.widgets` around in MongoDB changes the
admin dashboard order after refresh.

The seeded admin config includes five sections: `exec`, `ops`, `revenue`, `customer-growth`, and `governance`. These
sections use only config-driven widgets, so renaming, reordering, removing, or adding widgets in MongoDB changes the
admin page after refresh.

## Assumptions And Mocked Pieces

- AI is optional. When `OPENROUTER_API_KEY` or `GEMINI_API_KEY` is configured, the service calls that provider. When no key is configured, `src/lib/services/ai-service.ts` returns a controlled message-aware fallback so the demo remains runnable.
- Shopify-style and CRM-style integrations are mocked. Their records are stored on `product_instances.integrations.*.mockRecords`; no live Shopify or CRM API is called.
- Auth is mocked with the `debales_user` cookie and the `Login as` switcher. Server-side authorization checks still enforce project access and admin-only dashboard access.
- MongoDB is real when `MONGODB_URI` is configured. If MongoDB is unavailable, the app falls back to the seeded in-memory data in `src/lib/seed.ts`.
- The admin dashboard is the only config-driven UI surface required by the assignment. Chat remains conventional React UI while the admin dashboard structure is loaded from `dashboard_configs`.

## Loom Walkthrough

Use this 5-10 minute outline for the submission video:

1. Start the app and open `/projects/acme-retail/chat/conv-sales`.
2. Use the `Login as` switcher to show `Ava Morgan` can access admin and `Noah Patel` is blocked from admin.
3. Open `/projects/acme-retail/admin` as `Ava Morgan`.
4. Point out the dashboard sections and widgets are loaded from `dashboard_configs.sections`.
5. In MongoDB Atlas, open database `Debales_ai`, collection `dashboard_configs`, document `id = "dash-acme-sales"`.
6. Edit a visible value, for example:

```js
db.dashboard_configs.updateOne(
  { id: "dash-acme-sales" },
  {
    $set: {
      "sections.0.title": "Executive pulse from MongoDB",
      "sections.0.widgets.0.value": "$91.7k"
    }
  }
)
```

7. Refresh the admin dashboard and show the title/value changed without a code change.
8. Use the dashboard editor to rename/reorder a widget, save it, refresh, and show the config persists.
9. Explain mocked pieces: AI fallback without keys, simulated Shopify/CRM records, cookie-based demo auth.
10. Close by showing the relevant files: `admin-service.ts`, `dashboard/route.ts`, `admin-dashboard.tsx`, and `seed.ts`.

## Troubleshooting

If `npm install` fails with `getaddrinfo ENOTFOUND registry.npmjs.org`, the machine cannot resolve or reach the npm
registry. Check internet/DNS/VPN/proxy settings, then retry. If `node_modules` already exists, you can usually continue
with `npm run dev` without reinstalling.
