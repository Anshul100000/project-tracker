import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import Switch from "@mui/material/Switch";
import TablePagination from "@mui/material/TablePagination";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import PageHeader from "components/PageHeader";
import StatTile from "components/StatTile";
import StatusPill from "components/StatusPill";
import ViewToggle, { useViewMode } from "components/ViewToggle";
import DataGrid, { IconCell, PersonCell, TagCell } from "components/DataGrid";
import { hueFor } from "assets/theme/enterprise";
import { ROLES, can, getUserRoles, hasRole } from "auth/roles";
import axiosInstance from "services.js/axiosInstance";
import { extractList } from "layouts/dashboard/utils/apiShape";
import swalsucess from "sucess";

import CreateTaskDialog from "layouts/kpaTasks/CreateTaskDialog";
import KpaProgress, { CompletionBar } from "layouts/kpaTasks/KpaProgress";
import {
  TASK_STATUSES,
  statusMeta,
  fetchTasks,
  fetchAssignments,
  fetchMyKpas,
  updateTaskStatus,
  errorMessage,
} from "layouts/kpaTasks/api";

const fullName = (e) => `${e.firstName || ""} ${e.lastName || ""}`.trim() || e.name || e.email || `#${e.id}`;

// ---------------------------------------------------------------------------
// Status control: pill that opens a menu of the other statuses
// ---------------------------------------------------------------------------

function StatusControl({ task, busy, canChange, onChange }) {
  const [anchor, setAnchor] = useState(null);
  const meta = statusMeta(task.status);
  const pill = <StatusPill label={meta.label} tone={meta.tone} />;
  if (!canChange || !task.active) return pill;

  return (
    <>
      <Tooltip title="Change status">
        <span>
        <Box
          component="button"
          type="button"
          onClick={(e) => setAnchor(e.currentTarget)}
          disabled={busy}
          aria-haspopup="menu"
          sx={{
            border: 0,
            background: "none",
            p: 0,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 0.25,
            fontFamily: "inherit",
            "&:disabled": { opacity: 0.6, cursor: "default" },
          }}
        >
          {pill}
          {busy ? (
            <CircularProgress size={14} sx={{ ml: 0.5 }} />
          ) : (
            <Icon sx={{ fontSize: "18px !important", color: "var(--pt-text-3)" }}>expand_more</Icon>
          )}
        </Box>
        </span>
      </Tooltip>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {TASK_STATUSES.map((s) => (
          <MenuItem
            key={s.value}
            selected={s.value === task.status}
            onClick={() => {
              setAnchor(null);
              if (s.value !== task.status) onChange(task, s.value);
            }}
            sx={{ gap: 1 }}
          >
            <Icon sx={{ fontSize: "18px !important", color: s.color }}>{s.icon}</Icon>
            {s.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

StatusControl.propTypes = {
  task: PropTypes.object.isRequired,
  busy: PropTypes.bool.isRequired,
  canChange: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

// ---------------------------------------------------------------------------
// Board card
// ---------------------------------------------------------------------------

function TaskCard({ task, busy, canChange, showEmployee, onChange, completion }) {
  const meta = statusMeta(task.status);
  const next = TASK_STATUSES[TASK_STATUSES.findIndex((s) => s.value === task.status) + 1];
  return (
    <Card
      sx={{
        p: 1.75,
        borderLeft: `3px solid ${meta.color}`,
        opacity: task.active ? 1 : 0.6,
        transition: "transform .15s, box-shadow .15s",
        "&:hover": { transform: "translateY(-2px)", boxShadow: "var(--pt-shadow-md)" },
      }}
    >
      <Box display="flex" alignItems="flex-start" gap={1}>
        <Typography
          sx={{
            flex: 1,
            fontSize: 14,
            fontWeight: 600,
            color: "var(--pt-text)",
            lineHeight: 1.35,
            textDecoration: task.status === "COMPLETED" ? "line-through" : "none",
            textDecorationColor: "var(--pt-text-3)",
          }}
        >
          {task.taskName}
        </Typography>
        {!task.active && <StatusPill label="Inactive" tone="neutral" />}
      </Box>

      {task.description && (
        <Typography
          sx={{
            mt: 0.75,
            fontSize: 13,
            color: "var(--pt-text-2)",
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {task.description}
        </Typography>
      )}

      <Box display="flex" flexWrap="wrap" gap={0.75} mt={1.25}>
        {task.kpaName && <TagCell label={task.kpaName} hue={hueFor(task.kraName || task.kpaName)} />}
        {task.projectName && (
          <Box display="inline-flex" alignItems="center" gap={0.5} sx={{ fontSize: 12, color: "var(--pt-text-3)" }}>
            <Icon sx={{ fontSize: "14px !important" }}>folder</Icon>
            {task.projectName}
          </Box>
        )}
      </Box>

      {Number.isFinite(completion) && (
        <Box mt={1.25}>
          <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography sx={{ fontSize: 11.5, color: "var(--pt-text-3)" }}>KPA completion</Typography>
            <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: "var(--pt-text-2)" }}>{Math.round(completion * 100) / 100}%</Typography>
          </Box>
          <CompletionBar value={completion} height={4} />
        </Box>
      )}

      <Box display="flex" alignItems="center" justifyContent="space-between" gap={1} mt={1.5}>
        {showEmployee && task.employeeName ? (
          <Box display="inline-flex" alignItems="center" gap={0.75} minWidth={0} sx={{ fontSize: 12, color: "var(--pt-text-2)" }}>
            <Icon sx={{ fontSize: "15px !important", color: "var(--pt-text-3)" }}>person</Icon>
            <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {task.employeeName}
            </Box>
          </Box>
        ) : (
          <span />
        )}
        <Box display="flex" alignItems="center" gap={0.5}>
          <StatusControl task={task} busy={busy} canChange={canChange} onChange={onChange} />
          {canChange && task.active && next && (
            <Tooltip title={`Move to ${next.label}`}>
              <span>
                <IconButton
                  size="small"
                  disabled={busy}
                  onClick={() => onChange(task, next.value)}
                  aria-label={`Move to ${next.label}`}
                  sx={{ width: 28, height: 28, color: next.color, "&:hover": { backgroundColor: "var(--pt-hover)" } }}
                >
                  <Icon sx={{ fontSize: "18px !important" }}>{next.value === "COMPLETED" ? "task_alt" : "play_arrow"}</Icon>
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Card>
  );
}

TaskCard.propTypes = {
  task: PropTypes.object.isRequired,
  busy: PropTypes.bool.isRequired,
  canChange: PropTypes.bool.isRequired,
  showEmployee: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  completion: PropTypes.number,
};
TaskCard.defaultProps = { completion: NaN };

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function KpaTasks() {
  const roles = useMemo(() => getUserRoles(), []);
  const isEmployeeOnly = roles.length > 0 && roles.every((r) => r === ROLES.EMPLOYEE);
  // Only an employee creates tasks, and only for their own KPA assignments.
  const canCreate = hasRole(ROLES.EMPLOYEE, roles);
  const canChange = can("manageTasks", roles);

  const [view, setView] = useViewMode("kpa-tasks");

  // filters (sent to the backend)
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [assignmentId, setAssignmentId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [activeOnly, setActiveOnly] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);

  // data
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  // filter options
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [myKpas, setMyKpas] = useState([]);
  const [loadingKpas, setLoadingKpas] = useState(false);

  // KPA dropdown for "New task": GET /project-kpas (the backend returns only KPAs assigned to this employee)
  useEffect(() => {
    if (!canCreate) return undefined;
    let cancelled = false;
    setLoadingKpas(true);
    fetchMyKpas()
      .then((list) => !cancelled && setMyKpas(list))
      .catch(() => !cancelled && setMyKpas([]))
      .finally(() => !cancelled && setLoadingKpas(false));
    return () => {
      cancelled = true;
    };
  }, [canCreate]);

  // debounce the search box
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  // reset to first page when filters change
  useEffect(() => setPage(0), [debouncedSearch, assignmentId, projectId, employeeId, activeOnly, size]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { list, total: count } = await fetchTasks({
        activeOnly,
        assignmentId,
        projectId,
        // an EMPLOYEE's scope is forced by the backend; don't pretend to filter by others
        employeeId: isEmployeeOnly ? "" : employeeId,
        search: debouncedSearch,
        page,
        size,
        sort: "taskName",
      });
      setTasks(list);
      setTotal(count);
    } catch (e) {
      setTasks([]);
      setTotal(0);
      setError(errorMessage(e, "Couldn't load tasks."));
    } finally {
      setLoading(false);
    }
  }, [activeOnly, assignmentId, projectId, employeeId, debouncedSearch, page, size, isEmployeeOnly]);

  useEffect(() => {
    load();
  }, [load]);

  // filter options (backend-scoped lists)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingAssignments(true);
      try {
        const list = await fetchAssignments();
        if (!cancelled) setAssignments(list);
      } catch {
        if (!cancelled) setAssignments([]);
      } finally {
        if (!cancelled) setLoadingAssignments(false);
      }
      if (cancelled) return;
      try {
        const res = await axiosInstance.get("/projects");
        if (!cancelled) setProjects(extractList(res.data));
      } catch {
        if (!cancelled) setProjects([]);
      }
      if (!isEmployeeOnly) {
        try {
          const res = await axiosInstance.get("/employees", { params: { activeOnly: true, page: 0, size: 500, sort: "firstName" } });
          if (!cancelled) setEmployees(extractList(res.data));
        } catch {
          if (!cancelled) setEmployees([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isEmployeeOnly]);

  // Recently changed completion per assignment: { [assignmentId]: deltaPercent }
  const [changes, setChanges] = useState({});

  const completionOf = (assignmentIdValue, list = assignments) =>
    list.find((a) => String(a.id) === String(assignmentIdValue))?.completion;

  const changeStatus = async (task, status) => {
    setBusyId(task.id);
    const before = completionOf(task.assignmentId) ?? task.completion;
    // optimistic update, rolled back on failure
    const prev = tasks;
    setTasks((ts) => ts.map((t) => (t.id === task.id ? { ...t, status } : t)));
    try {
      await updateTaskStatus(task.id, status);

      // The backend recalculated completionPercentage — fetch the fresh value.
      let after = NaN;
      try {
        const fresh = await fetchAssignments();
        setAssignments(fresh);
        after = completionOf(task.assignmentId, fresh);
      } catch {
        // keep the old list; the task list reload below still reflects the change
      }

      const label = statusMeta(status).label;
      if (Number.isFinite(after) && Number.isFinite(before) && after !== before) {
        const delta = Math.round((after - before) * 100) / 100;
        setChanges((c) => ({ ...c, [task.assignmentId]: delta }));
        setTimeout(() => setChanges((c) => {
          const next = { ...c };
          delete next[task.assignmentId];
          return next;
        }), 6000);
        swalsucess(`"${task.taskName}" → ${label} · ${task.kpaName} completion ${Math.round(before * 100) / 100}% → ${Math.round(after * 100) / 100}%`);
      } else if (Number.isFinite(after)) {
        swalsucess(`"${task.taskName}" → ${label} · ${task.kpaName} completion ${Math.round(after * 100) / 100}%`);
      } else {
        swalsucess(`"${task.taskName}" → ${label}`);
      }
      load();
    } catch (e) {
      setTasks(prev);
      setError(errorMessage(e, "Couldn't update the task status."));
    } finally {
      setBusyId(null);
    }
  };

  const counts = TASK_STATUSES.reduce((acc, s) => ({ ...acc, [s.value]: tasks.filter((t) => t.status === s.value).length }), {});
  const completionPct = tasks.length ? Math.round((counts.COMPLETED / tasks.length) * 100) : 0;
  const selectedAssignment = assignments.find((a) => String(a.id) === String(assignmentId));
  const filtersActive = search || assignmentId || projectId || employeeId || !activeOnly;

  const clearFilters = () => {
    setSearch("");
    setAssignmentId("");
    setProjectId("");
    setEmployeeId("");
    setActiveOnly(true);
  };

  const pager = (
    <TablePagination
      component="div"
      count={total}
      page={page}
      onPageChange={(_, p) => setPage(p)}
      rowsPerPage={size}
      onRowsPerPageChange={(e) => setSize(parseInt(e.target.value, 10))}
      rowsPerPageOptions={[10, 20, 50]}
    />
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <PageHeader
        title={isEmployeeOnly ? "My Tasks" : "KPA Tasks"}
        icon="task_alt"
        hue="emerald"
        description={
          isEmployeeOnly
            ? "Tasks for your KPA assignments. Completing tasks raises your KPA completion."
            : "Tasks created by employees against their KPA assignments."
        }
        actions={
          <>
            <ViewToggle value={view} onChange={setView} />
            {canCreate && (
              <Button variant="contained" startIcon={<Icon>add_task</Icon>} onClick={() => setCreateOpen(true)}>
                New task
              </Button>
            )}
          </>
        }
      />

      {/* Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <StatTile title="Total tasks" value={loading ? "—" : total} icon="task_alt" hue="emerald" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatTile title="To do" value={loading ? "—" : counts.TODO} icon="radio_button_unchecked" hue="slate" description="On this page" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatTile title="In progress" value={loading ? "—" : counts.IN_PROGRESS} icon="timelapse" hue="amber" description="On this page" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatTile
            title="Completed"
            value={loading ? "—" : `${counts.COMPLETED} · ${completionPct}%`}
            icon="check_circle"
            hue="blue"
            description={
              selectedAssignment && Number.isFinite(selectedAssignment.completion)
                ? `KPA completion ${Math.round(selectedAssignment.completion)}%`
                : "On this page"
            }
          />
        </Grid>
      </Grid>

      <KpaProgress
        title={isEmployeeOnly ? "My KPA progress" : "KPA progress"}
        assignments={assignments}
        loading={loadingAssignments}
        changes={changes}
        selectedId={assignmentId}
        onSelect={setAssignmentId}
      />

      {/* Filters */}
      <Card sx={{ p: 2, mb: 2 }}>
        <Box display="flex" flexWrap="wrap" gap={1.5} alignItems="center">
          <TextField
            size="small"
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Icon sx={{ fontSize: "18px !important", color: "var(--pt-text-3)" }}>search</Icon>
                </InputAdornment>
              ),
            }}
            sx={{ flex: "1 1 240px" }}
          />
          <TextField
            select
            size="small"
            label={isEmployeeOnly ? "My KPA" : "KPA assignment"}
            value={assignmentId}
            onChange={(e) => setAssignmentId(e.target.value)}
            sx={{ minWidth: 220, flex: "0 1 260px" }}
          >
            <MenuItem value="">All assignments</MenuItem>
            {assignments.map((a) => (
              <MenuItem key={a.id} value={a.id}>
                {a.kpaName}
                {!isEmployeeOnly && a.employeeName ? ` · ${a.employeeName}` : ""}
              </MenuItem>
            ))}
          </TextField>
          <TextField select size="small" label="Project" value={projectId} onChange={(e) => setProjectId(e.target.value)} sx={{ minWidth: 180, flex: "0 1 220px" }}>
            <MenuItem value="">All projects</MenuItem>
            {projects.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.projectName}
              </MenuItem>
            ))}
          </TextField>
          {!isEmployeeOnly && (
            <TextField select size="small" label="Employee" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} sx={{ minWidth: 180, flex: "0 1 220px" }}>
              <MenuItem value="">All employees</MenuItem>
              {employees.map((e) => (
                <MenuItem key={e.id} value={e.id}>
                  {fullName(e)}
                  {e.employeeCode ? ` (#${e.employeeCode})` : ""}
                </MenuItem>
              ))}
            </TextField>
          )}
          <Box component="label" display="inline-flex" alignItems="center" gap={1} sx={{ cursor: "pointer", whiteSpace: "nowrap" }}>
            <Switch size="small" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} inputProps={{ "aria-label": "Active only" }} />
            <Typography sx={{ fontSize: 13, color: "var(--pt-text-2)" }}>Active only</Typography>
          </Box>
          {filtersActive && (
            <Button variant="text" onClick={clearFilters}>
              Clear
            </Button>
          )}
        </Box>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {view === "table" ? (
        <Card sx={{ overflow: "hidden" }}>
          <DataGrid
            title={isEmployeeOnly ? "My tasks" : "KPA tasks"}
            exportName="kpa-tasks"
            loading={loading}
            rows={tasks}
            paginate={false}
            emptyText={filtersActive ? "No tasks match your filters" : "No tasks yet"}
            columns={[
              {
                key: "taskName",
                label: "Task",
                render: (t) => <IconCell icon="task_alt" title={t.taskName} sub={t.description || null} hue={hueFor(t.kpaName || "")} />,
              },
              { key: "kpaName", label: "KPA", render: (t) => <TagCell label={t.kpaName} hue={hueFor(t.kraName || t.kpaName || "")} /> },
              { key: "projectName", label: "Project" },
              ...(isEmployeeOnly
                ? []
                : [
                    {
                      key: "employeeName",
                      label: "Employee",
                      render: (t) => (t.employeeName ? <PersonCell name={t.employeeName} hue={hueFor(t.employeeName)} /> : "—"),
                    },
                  ]),
              {
                key: "completion",
                label: "KPA completion",
                value: (t) => {
                  const c = completionOf(t.assignmentId) ?? t.completion;
                  return Number.isFinite(c) ? c : "";
                },
                render: (t) => {
                  const c = completionOf(t.assignmentId) ?? t.completion;
                  if (!Number.isFinite(c)) return "—";
                  return (
                    <Box display="flex" alignItems="center" gap={1} minWidth={120}>
                      <Box flex={1}>
                        <CompletionBar value={c} />
                      </Box>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: "var(--pt-text)", minWidth: 40, textAlign: "right" }}>
                        {Math.round(c * 100) / 100}%
                      </Typography>
                    </Box>
                  );
                },
              },
              {
                key: "status",
                label: "Status",
                value: (t) => statusMeta(t.status).label,
                render: (t) => <StatusControl task={t} busy={busyId === t.id} canChange={canChange} onChange={changeStatus} />,
              },
            ]}
            footer={pager}
          />
        </Card>
      ) : (
        <>
          <Box
            display="grid"
            gap={2}
            sx={{ gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, alignItems: "start" }}
          >
            {TASK_STATUSES.map((s) => {
              const column = tasks.filter((t) => t.status === s.value);
              return (
                <Box
                  key={s.value}
                  sx={{
                    borderRadius: "14px",
                    backgroundColor: "var(--pt-surface-2)",
                    border: "1px solid var(--pt-border)",
                    p: 1.5,
                    minHeight: 160,
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={1.5} px={0.5}>
                    <Icon sx={{ fontSize: "18px !important", color: s.color }}>{s.icon}</Icon>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "var(--pt-text)" }}>{s.label}</Typography>
                    <Box
                      component="span"
                      sx={{
                        ml: "auto",
                        minWidth: 24,
                        px: 0.75,
                        borderRadius: "999px",
                        fontSize: 12,
                        fontWeight: 600,
                        textAlign: "center",
                        color: "var(--pt-text-2)",
                        backgroundColor: "var(--pt-hover)",
                      }}
                    >
                      {loading ? "…" : column.length}
                    </Box>
                  </Box>
                  <Box display="flex" flexDirection="column" gap={1.25}>
                    {loading && [...Array(2)].map((_, i) => <Skeleton key={i} variant="rounded" height={96} />)}
                    {!loading && column.length === 0 && (
                      <Typography sx={{ fontSize: 13, color: "var(--pt-text-3)", textAlign: "center", py: 3 }}>
                        No tasks
                      </Typography>
                    )}
                    {!loading &&
                      column.map((t) => (
                        <TaskCard
                          key={t.id}
                          task={t}
                          busy={busyId === t.id}
                          canChange={canChange}
                          showEmployee={!isEmployeeOnly}
                          completion={completionOf(t.assignmentId) ?? t.completion}
                          onChange={changeStatus}
                        />
                      ))}
                  </Box>
                </Box>
              );
            })}
          </Box>
          {total > 0 && <Card sx={{ mt: 2 }}>{pager}</Card>}
        </>
      )}

      {canCreate && (
        <CreateTaskDialog
          open={createOpen}
          kpas={myKpas}
          loadingKpas={loadingKpas}
          assignments={assignments}
          defaultKpaId={selectedAssignment?.kpaId ?? ""}
          onClose={() => setCreateOpen(false)}
          onCreated={load}
        />
      )}

      <Footer />
    </DashboardLayout>
  );
}

export default KpaTasks;
