# Debales AI Internship Assignment

Multi-tenant AI assistant demo built with Next.js App Router, React, TypeScript, Tailwind CSS, TanStack Query, Zod, and Mongoose.

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

Only the admin dashboard is config-driven, as requested. The chat/product shell uses normal React components.

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

## Assumptions And Mocked Pieces

- Shopify-style and CRM-style integrations are simulated and stored on the product instance.
- AI calls use OpenRouter or Gemini when keys are configured, otherwise a controlled message-aware fallback is used.
- The seeded fallback is provided so reviewers can run the demo locally without database setup.
