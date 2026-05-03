import type { IntegrationConfig } from "@/lib/types";

type AiInput = {
  userMessage: string;
  projectName: string;
  integrations: IntegrationConfig[];
};

function fallbackReply(input: AiInput, reason?: string) {
  const enabled = input.integrations.filter((integration) => integration.enabled);
  const catalog = input.integrations.find((integration) => integration.key === "shopify");
  const crm = input.integrations.find((integration) => integration.key === "crm");
  const message = input.userMessage.trim();
  const normalizedMessage = message.toLowerCase();
  const catalogRecords = catalog?.mockRecords ?? [];
  const crmRecords = crm?.mockRecords ?? [];
  const sourceNote = reason ? ` I used the local fallback because ${reason}.` : "";
  const enabledContext =
    enabled.map((integration) => integration.label).join(" and ") ||
    "the project profile";

  const includesAny = (terms: string[]) =>
    terms.some((term) => normalizedMessage.includes(term));

  const pickRecord = (records: string[], terms: string[]) =>
    records.find((record) =>
      terms.some((term) => record.toLowerCase().includes(term)),
    ) ?? records[0];

  const catalogSummary = catalogRecords.slice(0, 3).join("; ");
  const crmSummary = crmRecords.slice(0, 3).join("; ");

  if (includesAny(["integration", "connected", "status", "enabled", "disabled"])) {
    const statuses = input.integrations
      .map(
        (integration) =>
          `${integration.label}: ${integration.status}, ${
            integration.enabled ? "enabled" : "disabled"
          }, ${integration.mockRecords.length} records`,
      )
      .join("; ");

    return `For ${input.projectName}, integration status is: ${statuses}. Use the enabled sources for this request: ${enabledContext}.${sourceNote}`;
  }

  if (
    includesAny([
      "inventory",
      "stock",
      "sku",
      "catalog",
      "product",
      "products",
      "restock",
      "item",
    ])
  ) {
    if (!catalog?.enabled) {
      return `For ${input.projectName}, I cannot answer with catalog details because ${catalog?.label ?? "the catalog integration"} is disabled. Ask an admin to enable it before making inventory or product decisions.${sourceNote}`;
    }

    const signal = pickRecord(
      catalogRecords,
      includesAny(["risk", "low", "restock", "shortage"])
        ? ["restock", "low", "7 units", "stock", "units"]
        : ["stock", "restock", "sku", "units", "conversion"],
    );

    return `For "${message}", I would start with the Shopify-style catalog. Current catalog signals: ${catalogSummary}. Priority callout: ${signal}. Recommended next step: verify stock-sensitive items first, then choose the product with enough inventory and margin for the campaign.${sourceNote}`;
  }

  if (
    includesAny([
      "customer",
      "customers",
      "account",
      "accounts",
      "crm",
      "vip",
      "lead",
      "retention",
      "inactive",
      "cohort",
    ])
  ) {
    if (!crm?.enabled) {
      return `For ${input.projectName}, I cannot use account-level details because ${crm?.label ?? "the CRM integration"} is disabled. Keep the recommendation generic until CRM records are available.${sourceNote}`;
    }

    const signal = pickRecord(crmRecords, [
      "vip",
      "lead",
      "inactive",
      "customer",
      "account",
    ]);

    return `For "${message}", I would use the CRM-style account context first. Current CRM signals: ${crmSummary}. Priority callout: ${signal}. Recommended next step: segment the affected customers, write one focused outreach, and route high-value accounts to sales.${sourceNote}`;
  }

  if (
    includesAny([
      "campaign",
      "sale",
      "sales",
      "revenue",
      "conversion",
      "promote",
      "discount",
      "bundle",
      "repeat",
      "purchase",
    ])
  ) {
    const campaignParts = [
      catalog?.enabled && catalogRecords.length > 0
        ? `catalog: ${pickRecord(catalogRecords, ["margin", "conversion", "bundle", "stock"])}`
        : undefined,
      crm?.enabled && crmRecords.length > 0
        ? `CRM: ${pickRecord(crmRecords, ["inactive", "vip", "lead"])}`
        : undefined,
    ].filter(Boolean);

    return `For "${message}", build one campaign using ${enabledContext}. Best available signals: ${campaignParts.join("; ") || "no enabled integration records"}. Recommended next step: pair the strongest product signal with the best customer segment, then measure conversion before widening the campaign.${sourceNote}`;
  }

  return [
    `For "${message}", I would answer using ${enabledContext} context for ${input.projectName}.`,
    catalog?.enabled
      ? `Catalog signal: ${catalog.mockRecords[0]}.`
      : "Catalog signal is disabled, so I will not invent inventory data.",
    crm?.enabled
      ? `CRM signal: ${crm.mockRecords[0]}.`
      : "CRM signal is disabled, so account recommendations stay generic.",
    `Recommended next step: turn the request into one focused campaign, then verify the affected records before sending.${sourceNote}`,
  ].join(" ");
}

export async function generateAssistantReply(input: AiInput) {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (openRouterKey) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
          "X-Title": "Debales AI Internship Demo",
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL ?? "google/gemini-2.0-flash-exp:free",
          messages: [
            {
              role: "system",
              content:
                "You are a controlled multi-tenant sales assistant. Use only the provided integration context. Keep replies concise and operational.",
            },
            {
              role: "user",
              content: JSON.stringify(input),
            },
          ],
        }),
      });

      if (response.ok) {
        const json = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const content = json.choices?.[0]?.message?.content;

        if (content) {
          return content;
        }
      }

      return fallbackReply(input, `OpenRouter returned ${response.status}`);
    } catch {
      return fallbackReply(input, "the OpenRouter request failed");
    }
  }

  if (geminiKey) {
    try {
      const model = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `You are a controlled multi-tenant sales assistant. Use this JSON context and answer concisely: ${JSON.stringify(
                      input,
                    )}`,
                  },
                ],
              },
            ],
          }),
        },
      );

      if (response.ok) {
        const json = (await response.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const content = json.candidates?.[0]?.content?.parts?.[0]?.text;

        if (content) {
          return content;
        }
      }

      return fallbackReply(input, `Gemini returned ${response.status}`);
    } catch {
      return fallbackReply(input, "the Gemini request failed");
    }
  }

  return fallbackReply(input, "no AI API key is configured");
}
