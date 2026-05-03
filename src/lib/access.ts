import type { DemoUser, Project, ProjectRole } from "@/lib/types";

export class AccessError extends Error {
  status: number;

  constructor(message: string, status = 403) {
    super(message);
    this.name = "AccessError";
    this.status = status;
  }
}

export function getProjectRole(
  user: DemoUser | undefined,
  projectId: string,
): ProjectRole | undefined {
  return user?.projectRoles.find((role) => role.projectId === projectId)?.role;
}

export function canOpenProject(
  user: DemoUser | undefined,
  project: Project | undefined,
) {
  if (!user || !project) {
    return false;
  }

  return Boolean(getProjectRole(user, project.id));
}

export function canAdminProject(
  user: DemoUser | undefined,
  project: Project | undefined,
) {
  if (!user || !project) {
    return false;
  }

  return getProjectRole(user, project.id) === "admin";
}

export function assertProjectAccess(
  user: DemoUser | undefined,
  project: Project | undefined,
): asserts project is Project {
  if (!project) {
    throw new AccessError("Project was not found.", 404);
  }

  if (!canOpenProject(user, project)) {
    throw new AccessError("You do not have access to this project.", 403);
  }
}

export function assertAdminAccess(
  user: DemoUser | undefined,
  project: Project | undefined,
): asserts project is Project {
  assertProjectAccess(user, project);

  if (!canAdminProject(user, project)) {
    throw new AccessError("Only project admins can open this dashboard.", 403);
  }
}
