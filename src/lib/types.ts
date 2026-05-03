export type ProjectRole = "admin" | "member";

export type IntegrationKey = "shopify" | "crm";

export type IntegrationConfig = {
  key: IntegrationKey;
  label: string;
  enabled: boolean;
  status: "connected" | "disabled" | "degraded";
  mockRecords: string[];
};

export type Project = {
  id: string;
  slug: string;
  name: string;
  segment: string;
  description: string;
  health: "strong" | "watch" | "risk";
};

export type ProductInstance = {
  id: string;
  projectId: string;
  namespace: string;
  productType: "sales-assistant";
  name: string;
  integrations: Record<IntegrationKey, IntegrationConfig>;
};

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  title: string;
  projectRoles: Array<{
    projectId: string;
    role: ProjectRole;
  }>;
};

export type ChatMessageRole = "user" | "assistant" | "step";

export type ChatMessage = {
  id: string;
  role: ChatMessageRole;
  content: string;
  createdAt: string;
};

export type Conversation = {
  id: string;
  projectId: string;
  productInstanceId: string;
  title: string;
  status: "active" | "archived";
  messages: ChatMessage[];
  updatedAt: string;
};

export type DashboardWidget =
  | {
      id: string;
      type: "metric";
      label: string;
      value: string;
      delta: string;
      tone: "good" | "watch" | "risk";
    }
  | {
      id: string;
      type: "insight";
      label: string;
      body: string;
      severity: "info" | "warning" | "critical";
    }
  | {
      id: string;
      type: "integrationStatus";
      label: string;
      integrations: IntegrationKey[];
    }
  | {
      id: string;
      type: "integrationRecords";
      label: string;
      integration: IntegrationKey;
      emptyState?: string;
    }
  | {
      id: string;
      type: "list";
      label: string;
      items: string[];
    }
  | {
      id: string;
      type: "action";
      label: string;
      cta: string;
      target: string;
    };

export type DashboardSection = {
  id: string;
  title: string;
  description: string;
  widgets: DashboardWidget[];
};

export type DashboardConfig = {
  id: string;
  projectId: string;
  updatedAt: string;
  sections: DashboardSection[];
};

export type ProjectContext = {
  currentUser: DemoUser;
  project: Project;
  productInstance: ProductInstance;
  conversations: Conversation[];
};

export type SessionPayload = {
  currentUser: DemoUser;
  users: DemoUser[];
};
