import axiosInstance from "services.js/axiosInstance";
import { extractList, extractTotal } from "layouts/dashboard/utils/apiShape";

/**
 * KPA task API (tasks belong to a Project-KPA-employee assignment).
 *
 *   GET   /project-kpa-tasks?activeOnly&assignmentId&employeeId&projectId&search&page&size&sort
 *   POST  /project-kpa-tasks/create { kpaEmployeeAssignmentId, taskName, description }
 *   PATCH /project-kpa-tasks/{id}   { status: "TODO" | "IN_PROGRESS" | "COMPLETED" }
 *         → the backend recalculates the assignment's completionPercentage
 *           (completed active tasks ÷ active tasks × 100)
 *
 * Filters are only filters: the backend scopes results to what the user may see
 * (EMPLOYEE always gets their own tasks, whatever employeeId is sent).
 */

export const TASK_STATUSES = [
  { value: "TODO", label: "To do", tone: "neutral", color: "#98a2b3", icon: "radio_button_unchecked" },
  { value: "IN_PROGRESS", label: "In progress", tone: "warning", color: "#f79009", icon: "timelapse" },
  { value: "COMPLETED", label: "Completed", tone: "success", color: "#17b26a", icon: "check_circle" },
];

export const statusMeta = (value) => TASK_STATUSES.find((s) => s.value === value) || TASK_STATUSES[0];

const personName = (p) =>
  (p && (`${p.firstName || ""} ${p.lastName || ""}`.trim() || p.name || p.employeeName || p.email)) || "";

/** Flatten an assignment (ProjectKpaEmployee) whatever its exact JSON shape. */
export function normalizeAssignment(a = {}) {
  const kpa = a.projectKpa || a.kpa || {};
  const kra = kpa.projectKra || a.projectKra || {};
  const employee = a.employee || {};
  return {
    id: a.id ?? a.assignmentId ?? a.kpaEmployeeAssignmentId,
    kpaId: kpa.id ?? a.projectKpaId,
    kpaName: kpa.kpaName || a.kpaName || a.projectKpaName || "KPA",
    kraName: kra.kraName || a.kraName || a.projectKraName || "",
    projectName:
      a.projectName ||
      kra.projectName ||
      kra.projectDepartment?.project?.projectName ||
      kpa.projectName ||
      "",
    projectId: a.projectId ?? kra.projectDepartment?.project?.id ?? kra.projectId,
    employeeId: employee.id ?? a.employeeId,
    employeeName: personName(employee) || a.employeeName || "",
    completion: Number(a.completionPercentage ?? a.completion ?? NaN),
    active: a.active !== false,
  };
}

/** Flatten a task whatever its exact JSON shape. */
export function normalizeTask(t = {}) {
  const asg = normalizeAssignment(t.projectKpaEmployee || t.kpaEmployeeAssignment || t.assignment || {});
  const status = String(t.status || t.taskStatus || (t.completed ? "COMPLETED" : "TODO")).toUpperCase();
  return {
    id: t.id ?? t.taskId,
    taskName: t.taskName || t.name || "Untitled task",
    description: t.description || "",
    status: TASK_STATUSES.some((s) => s.value === status) ? status : "TODO",
    active: t.active !== false,
    assignmentId: t.kpaEmployeeAssignmentId ?? t.assignmentId ?? asg.id,
    kpaName: t.kpaName || t.projectKpaName || asg.kpaName,
    kraName: t.kraName || asg.kraName,
    projectName: t.projectName || asg.projectName,
    employeeName: t.employeeName || personName(t.employee) || asg.employeeName,
    updatedAt: t.updatedAt || t.modifiedAt || t.createdAt || null,
    // assignment completion, when the task response embeds its assignment
    completion: Number(t.completionPercentage ?? asg.completion ?? NaN),
  };
}

export async function fetchTasks(params) {
  // drop empty filters so the backend doesn't receive blanks
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined));
  const res = await axiosInstance.get("/project-kpa-tasks", { params: clean });
  return { list: extractList(res.data).map(normalizeTask), total: extractTotal(res.data) };
}

export async function fetchAssignments(params = {}) {
  const res = await axiosInstance.get("/project-kpa-employees", {
    params: { activeOnly: true, page: 0, size: 200, ...params },
  });
  return extractList(res.data).map(normalizeAssignment);
}

/** Flatten a project KPA (GET /project-kpas item). */
export function normalizeKpa(k = {}) {
  const kra = k.projectKra || k.kra || k.projectKRA || {};
  const project = k.project || kra.projectDepartment?.project || {};
  // some APIs embed the caller's own assignment on the KPA
  const embedded =
    k.kpaEmployeeAssignmentId ??
    k.projectKpaEmployeeId ??
    k.assignmentId ??
    k.projectKpaEmployee?.id ??
    (Array.isArray(k.projectKpaEmployees) && k.projectKpaEmployees.length === 1 ? k.projectKpaEmployees[0].id : undefined);
  return {
    id: k.id ?? k.projectKpaId,
    kpaName: k.kpaName || k.name || k.projectKpaName || "KPA",
    kraName: k.kraName || kra.kraName || kra.name || k.projectKraName || "",
    projectName: k.projectName || kra.projectName || project.projectName || "",
    departmentName:
      k.departmentName || kra.departmentName || kra.projectDepartment?.department?.departmentName || "",
    assignmentId: embedded,
    active: k.active !== false,
  };
}

/** KPAs visible to the user — for an EMPLOYEE the backend returns only KPAs assigned to them. */
export async function fetchMyKpas() {
  const res = await axiosInstance.get("/project-kpas", { params: { activeOnly: true, page: 0, size: 200 } });
  return extractList(res.data).map(normalizeKpa).filter((k) => k.active && k.id !== undefined);
}

/** Resolve the signed-in employee's assignment id for a KPA (backend scopes the lookup to them). */
export async function findAssignmentForKpa(kpaId) {
  const res = await axiosInstance.get("/project-kpa-employees", {
    params: { projectKpaId: kpaId, activeOnly: true, page: 0, size: 5 },
  });
  const match = extractList(res.data)
    .map(normalizeAssignment)
    .find((a) => a.active && (a.kpaId === undefined || String(a.kpaId) === String(kpaId)));
  return match ? match.id : null;
}

export const createTask = (body) => axiosInstance.post("/project-kpa-tasks/create", body);

export const updateTaskStatus = (id, status) => axiosInstance.patch(`/project-kpa-tasks/${id}`, { status });

export const errorMessage = (e, fallback) =>
  e?.response?.data?.message || e?.response?.data?.error || fallback;
