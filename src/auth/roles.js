import keycloak from "auth/keycloak";

/**
 * Role-based UI for the PMS frontend.
 *
 * Contract (see PMS Frontend Integration Guide):
 *  - Roles come ONLY from the Keycloak client "performance-tracker":
 *      resource_access["performance-tracker"].roles  →  ADMIN | HR_ADMIN | MANAGER | EMPLOYEE
 *  - Roles drive what the UI shows. The backend is the final authority: it re-checks the role
 *    against the PMS database and applies department (MANAGER) / self (EMPLOYEE) scope.
 *  - Never derive data scope here. Whatever the API returns is already scoped for the user.
 */

export const ROLE_CLIENT = "performance-tracker";

export const ROLES = {
  ADMIN: "ADMIN",
  HR_ADMIN: "HR_ADMIN",
  MANAGER: "MANAGER",
  EMPLOYEE: "EMPLOYEE",
};

export const ROLE_LABELS = {
  ADMIN: "Admin",
  HR_ADMIN: "HR Admin",
  MANAGER: "Manager",
  EMPLOYEE: "Employee",
  NONE: "No role",
};

const ALL = [ROLES.ADMIN, ROLES.HR_ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE];
const ADMINS = [ROLES.ADMIN, ROLES.HR_ADMIN];

// Which pages appear in navigation (route keys from routes.js). Matches the role matrix:
// every role can open these modules — the backend returns only the records in that user's scope.
export const PAGE_ACCESS = {
  dashboard: ALL,
  employee: ALL, // ADMIN/HR manage · MANAGER scoped read · EMPLOYEE own record
  department: ALL, // ADMIN/HR manage · others read
  projects: ALL, // ADMIN/HR manage · MANAGER scoped · EMPLOYEE assigned
  kra: ALL, // ADMIN/HR/MANAGER manage · EMPLOYEE assigned (read)
  tables: ALL, // KPAs — same as KRAs
  "kpa-tasks": ALL, // EMPLOYEE own tasks · MANAGER department · ADMIN/HR all
  profile: ALL,
  logout: ALL,
};

// Which management actions the UI offers. The backend still decides per record.
export const PERMISSIONS = {
  manageUsers: [ROLES.ADMIN],
  manageOrganization: ADMINS, // departments, designations, department-designations
  manageEmployees: ADMINS,
  manageProjects: ADMINS, // projects + project departments
  manageKras: [...ADMINS, ROLES.MANAGER],
  manageKpas: [...ADMINS, ROLES.MANAGER],
  manageAssignments: [...ADMINS, ROLES.MANAGER],
  manageTasks: ALL,
  createTasks: [ROLES.EMPLOYEE], // an employee creates tasks only for their own KPA assignments
};

// Nav labels per role (EMPLOYEE sees its own data, so the wording says so).
const EMPLOYEE_LABELS = {
  employee: "My Record",
  projects: "My Projects",
  kra: "My KRAs",
  tables: "My KPAs",
  "kpa-tasks": "My Tasks",
};

const PRIORITY = [ROLES.ADMIN, ROLES.HR_ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE];

/** App roles of the signed-in user, from the performance-tracker client only. */
export function getUserRoles(token = keycloak.tokenParsed) {
  const raw = token?.resource_access?.[ROLE_CLIENT]?.roles || [];
  return PRIORITY.filter((r) => raw.includes(r));
}

export function primaryRole(roles = getUserRoles()) {
  return roles[0] || "NONE";
}

export const hasRole = (role, roles = getUserRoles()) => roles.includes(role);

export function can(permission, roles = getUserRoles()) {
  const allowed = PERMISSIONS[permission];
  return Boolean(allowed) && roles.some((r) => allowed.includes(r));
}

export function canAccess(pageKey, roles = getUserRoles()) {
  // Users without a PMS role can only see their profile (the API will refuse everything else).
  if (roles.length === 0) return pageKey === "profile" || pageKey === "logout";
  const allowed = PAGE_ACCESS[pageKey];
  if (!allowed) return true;
  return roles.some((r) => allowed.includes(r));
}

/** Nav label for a page given the user's roles. */
export function navLabel(route, roles = getUserRoles()) {
  const onlyEmployee = roles.length > 0 && roles.every((r) => r === ROLES.EMPLOYEE);
  return (onlyEmployee && EMPLOYEE_LABELS[route.key]) || route.name;
}

/** First page this user may open — used for redirects. */
export function homeRoute(routes, roles = getUserRoles()) {
  const first = routes.find((r) => r.route && !r.hidden && canAccess(r.key, roles));
  return first ? first.route : "/profile";
}
