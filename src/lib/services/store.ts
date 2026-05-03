import { connectToDatabase } from "@/lib/mongodb";
import { seedStore } from "@/lib/seed";
import type {
  Conversation,
  DashboardConfig,
  DemoUser,
  ProductInstance,
  Project,
} from "@/lib/types";
import {
  ConversationModel,
  DashboardConfigModel,
  ProductInstanceModel,
  ProjectModel,
  UserModel,
} from "@/models/demo";

let mongoUnavailable = false;

function clone<T>(value: T): T {
  if (value === undefined || value === null) {
    return value;
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

async function canUseMongo() {
  if (mongoUnavailable) {
    return false;
  }

  try {
    return Boolean(await connectToDatabase());
  } catch (error) {
    mongoUnavailable = true;
    console.warn("MongoDB unavailable. Falling back to seeded demo data.", error);
    return false;
  }
}

export async function listUsers() {
  if (await canUseMongo()) {
    const docs = await UserModel.find({}, { _id: 0, __v: 0 }).lean();
    if (docs.length > 0) {
      return docs as unknown as DemoUser[];
    }
  }

  return clone(seedStore.users);
}

export async function getUserById(userId: string) {
  if (await canUseMongo()) {
    const doc = await UserModel.findOne({ id: userId }, { _id: 0, __v: 0 }).lean();
    if (doc) {
      return doc as unknown as DemoUser;
    }
  }

  return clone(seedStore.users.find((user) => user.id === userId));
}

export async function getProjectBySlug(slug: string) {
  if (await canUseMongo()) {
    const doc = await ProjectModel.findOne({ slug }, { _id: 0, __v: 0 }).lean();
    if (doc) {
      return doc as unknown as Project;
    }
  }

  return clone(seedStore.projects.find((project) => project.slug === slug));
}

export async function getProductInstanceByProject(projectId: string) {
  if (await canUseMongo()) {
    const doc = await ProductInstanceModel.findOne(
      { projectId },
      { _id: 0, __v: 0 },
    ).lean();
    if (doc) {
      return doc as unknown as ProductInstance;
    }
  }

  return clone(
    seedStore.productInstances.find((instance) => instance.projectId === projectId),
  );
}

export async function listConversationsByProject(projectId: string) {
  if (await canUseMongo()) {
    const docs = await ConversationModel.find(
      { projectId },
      { _id: 0, __v: 0 },
    )
      .sort({ updatedAt: -1 })
      .lean();

    if (docs.length > 0) {
      return docs as unknown as Conversation[];
    }
  }

  return clone(
    seedStore.conversations
      .filter((conversation) => conversation.projectId === projectId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  );
}

export async function getConversationById(
  projectId: string,
  conversationId: string,
) {
  if (await canUseMongo()) {
    const doc = await ConversationModel.findOne(
      { id: conversationId, projectId },
      { _id: 0, __v: 0 },
    ).lean();
    if (doc) {
      return doc as unknown as Conversation;
    }
  }

  return clone(
    seedStore.conversations.find(
      (conversation) =>
        conversation.id === conversationId && conversation.projectId === projectId,
    ),
  );
}

export async function saveConversation(conversation: Conversation) {
  if (await canUseMongo()) {
    await ConversationModel.findOneAndUpdate(
      { id: conversation.id },
      conversation,
      { new: true, setDefaultsOnInsert: true, upsert: true },
    );
  } else {
    const index = seedStore.conversations.findIndex(
      (item) => item.id === conversation.id,
    );

    if (index >= 0) {
      seedStore.conversations[index] = clone(conversation);
    } else {
      seedStore.conversations.push(clone(conversation));
    }
  }

  return clone(conversation);
}

export async function getDashboardConfigByProject(projectId: string) {
  if (await canUseMongo()) {
    const doc = await DashboardConfigModel.findOne(
      { projectId },
      { _id: 0, __v: 0 },
    ).lean();
    if (doc) {
      return doc as unknown as DashboardConfig;
    }
  }

  return clone(
    seedStore.dashboardConfigs.find((config) => config.projectId === projectId),
  );
}

export async function saveDashboardConfig(config: DashboardConfig) {
  if (await canUseMongo()) {
    await DashboardConfigModel.findOneAndUpdate({ projectId: config.projectId }, config, {
      new: true,
      setDefaultsOnInsert: true,
      upsert: true,
    });
  } else {
    const index = seedStore.dashboardConfigs.findIndex(
      (item) => item.projectId === config.projectId,
    );

    if (index >= 0) {
      seedStore.dashboardConfigs[index] = clone(config);
    } else {
      seedStore.dashboardConfigs.push(clone(config));
    }
  }

  return clone(config);
}
