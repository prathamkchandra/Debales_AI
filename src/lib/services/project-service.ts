import { assertProjectAccess } from "@/lib/access";
import {
  getProductInstanceByProject,
  getProjectBySlug,
  getUserById,
  listConversationsByProject,
} from "@/lib/services/store";

export async function getProjectContext(projectSlug: string, userId: string) {
  const [project, user] = await Promise.all([
    getProjectBySlug(projectSlug),
    getUserById(userId),
  ]);

  assertProjectAccess(user, project);

  const [productInstance, conversations] = await Promise.all([
    getProductInstanceByProject(project.id),
    listConversationsByProject(project.id),
  ]);

  if (!productInstance) {
    throw new Error("Product instance is missing for this project.");
  }

  return {
    currentUser: user,
    project,
    productInstance,
    conversations,
  };
}
