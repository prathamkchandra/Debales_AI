import { assertAdminAccess } from "@/lib/access";
import {
  getDashboardConfigByProject,
  getProductInstanceByProject,
  getProjectBySlug,
  getUserById,
  saveDashboardConfig,
  saveProductInstance,
} from "@/lib/services/store";
import type {
  DashboardConfig,
  DashboardSection,
  IntegrationKey,
} from "@/lib/types";

export async function getAdminDashboard(projectSlug: string, userId: string) {
  const [project, user] = await Promise.all([
    getProjectBySlug(projectSlug),
    getUserById(userId),
  ]);

  assertAdminAccess(user, project);

  const [config, productInstance] = await Promise.all([
    getDashboardConfigByProject(project.id),
    getProductInstanceByProject(project.id),
  ]);

  if (!config) {
    throw new Error("Dashboard config document is missing.");
  }

  if (!productInstance) {
    throw new Error("Product instance is missing for this project.");
  }

  return {
    currentUser: user,
    project,
    productInstance,
    config,
  };
}

export async function updateAdminDashboard(
  projectSlug: string,
  userId: string,
  sections: DashboardSection[],
) {
  const { config } = await getAdminDashboard(projectSlug, userId);

  const nextConfig: DashboardConfig = {
    ...config,
    updatedAt: new Date().toISOString(),
    sections,
  };

  return saveDashboardConfig(nextConfig);
}

export async function updateProductRecords(
  projectSlug: string,
  userId: string,
  integration: IntegrationKey,
  records: string[],
) {
  const { productInstance } = await getAdminDashboard(projectSlug, userId);
  const targetIntegration = productInstance.integrations[integration];

  if (!targetIntegration) {
    throw new Error("Integration is missing for this product instance.");
  }

  return saveProductInstance({
    ...productInstance,
    integrations: {
      ...productInstance.integrations,
      [integration]: {
        ...targetIntegration,
        mockRecords: records,
      },
    },
  });
}
