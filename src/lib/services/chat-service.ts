import { AccessError, assertProjectAccess } from "@/lib/access";
import { generateAssistantReply } from "@/lib/services/ai-service";
import {
  getConversationById,
  getProductInstanceByProject,
  getProjectBySlug,
  getUserById,
  saveConversation,
} from "@/lib/services/store";
import type { ChatMessage, Conversation, IntegrationConfig } from "@/lib/types";

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function buildStepMessages(integrations: IntegrationConfig[]) {
  const now = new Date().toISOString();
  const steps: ChatMessage[] = [
    {
      id: makeId("step-access"),
      role: "step",
      content: "Verified project access and product-instance scope.",
      createdAt: now,
    },
  ];

  integrations.forEach((integration) => {
    steps.push({
      id: makeId(`step-${integration.key}`),
      role: "step",
      content: integration.enabled
        ? `${integration.label} is enabled. Loaded ${integration.mockRecords.length} mock records.`
        : `${integration.label} is disabled for this product instance. Skipping its records.`,
      createdAt: now,
    });
  });

  steps.push({
    id: makeId("step-ai"),
    role: "step",
    content: "Service layer prepared the controlled AI prompt and fallback path.",
    createdAt: now,
  });

  return steps;
}

export async function getConversationForUser(
  projectSlug: string,
  conversationId: string,
  userId: string,
) {
  const [project, user] = await Promise.all([
    getProjectBySlug(projectSlug),
    getUserById(userId),
  ]);

  assertProjectAccess(user, project);

  const conversation = await getConversationById(project.id, conversationId);

  if (!conversation) {
    throw new AccessError("Conversation was not found in this project.", 404);
  }

  return conversation;
}

export async function createConversation(
  projectSlug: string,
  userId: string,
  title = "New sales assist",
) {
  const [project, user] = await Promise.all([
    getProjectBySlug(projectSlug),
    getUserById(userId),
  ]);

  assertProjectAccess(user, project);

  const productInstance = await getProductInstanceByProject(project.id);

  if (!productInstance) {
    throw new Error("Product instance is missing for this project.");
  }

  const now = new Date().toISOString();
  const conversation: Conversation = {
    id: makeId("conv"),
    projectId: project.id,
    productInstanceId: productInstance.id,
    title,
    status: "active",
    updatedAt: now,
    messages: [
      {
        id: makeId("msg"),
        role: "assistant",
        content: `Started ${productInstance.name} for ${project.name}. Ask about campaigns, inventory, customers, or integration status.`,
        createdAt: now,
      },
    ],
  };

  return saveConversation(conversation);
}

export async function sendChatMessage(
  projectSlug: string,
  conversationId: string,
  userId: string,
  content: string,
) {
  const [project, user] = await Promise.all([
    getProjectBySlug(projectSlug),
    getUserById(userId),
  ]);

  assertProjectAccess(user, project);

  const [productInstance, conversation] = await Promise.all([
    getProductInstanceByProject(project.id),
    getConversationById(project.id, conversationId),
  ]);

  if (!productInstance) {
    throw new Error("Product instance is missing for this project.");
  }

  if (!conversation) {
    throw new AccessError("Conversation was not found in this project.", 404);
  }

  const integrations = Object.values(productInstance.integrations);
  const now = new Date().toISOString();
  const userMessage: ChatMessage = {
    id: makeId("msg-user"),
    role: "user",
    content,
    createdAt: now,
  };
  const stepMessages = buildStepMessages(integrations);
  const assistantContent = await generateAssistantReply({
    userMessage: content,
    projectName: project.name,
    integrations,
  });
  const assistantMessage: ChatMessage = {
    id: makeId("msg-assistant"),
    role: "assistant",
    content: assistantContent,
    createdAt: new Date().toISOString(),
  };

  const nextConversation: Conversation = {
    ...conversation,
    title:
      conversation.messages.length <= 1
        ? content.slice(0, 54) || conversation.title
        : conversation.title,
    updatedAt: assistantMessage.createdAt,
    messages: [
      ...conversation.messages,
      userMessage,
      ...stepMessages,
      assistantMessage,
    ],
  };

  return saveConversation(nextConversation);
}
