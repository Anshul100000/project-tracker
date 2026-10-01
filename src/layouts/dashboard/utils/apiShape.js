// The backend returns lists in several shapes depending on the endpoint:
//   []                              plain array
//   { data: [] }                    wrapped array
//   { content: [], totalElements }  Spring Page
//   { data: { content: [], totalElements } }
// These helpers flatten all of them so the dashboard doesn't care.

export function extractList(body) {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.content)) return body.content;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.data?.content)) return body.data.content;
  return [];
}

export function extractTotal(body) {
  const total =
    body?.totalElements ??
    body?.totalCount ??
    body?.total ??
    body?.data?.totalElements ??
    body?.data?.totalCount ??
    body?.data?.total;

  const n = Number(total);
  return Number.isFinite(n) ? n : extractList(body).length;
}

export function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function normalizeKra(item) {
  const target = Number(item.target ?? item.targetValue ?? item.goal ?? 0);
  const current = Number(item.current ?? item.currentValue ?? item.actual ?? 0);
  const calculated = target > 0 ? Math.round((current / target) * 100) : 0;
  const progress = Number(item.progress ?? item.progressPercentage ?? calculated) || 0;

  return {
    id: item.id,
    name: item.kraName ?? item.name ?? "Untitled KRA",
    dept:
      item.departmentName ??
      item.department?.departmentName ??
      item.projectDepartment?.department?.departmentName ??
      item.dept ??
      "",
    projectName:
      item.projectName ??
      item.projectDepartment?.project?.projectName ??
      item.projectDepartment?.projectName ??
      item.project?.projectName ??
      "",
    progress: Math.max(0, Math.min(100, progress)),
    active: item.active !== false,
  };
}
