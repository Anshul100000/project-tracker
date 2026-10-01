import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { useMaterialUIController } from "context";
import currentUser from "auth/currentUser";
import { canAccess } from "auth/roles";

import useDashboardData from "layouts/dashboard/hooks/useDashboardData";
import LiveControls, { INTERVALS } from "layouts/dashboard/components/LiveControls";
import StatCard from "layouts/dashboard/components/StatCard";
import WelcomeBanner from "layouts/dashboard/components/WelcomeBanner";
import KraStatus from "layouts/dashboard/components/KraStatus";
import Leaderboard from "layouts/dashboard/components/Leaderboard";
import Deadlines from "layouts/dashboard/components/Deadlines";
import QuickActions from "layouts/dashboard/components/QuickActions";
import { normalizeKra, toDate } from "layouts/dashboard/utils/apiShape";
import InsightsChart from "layouts/dashboard/components/InsightsChart";
import ProjectHealth from "layouts/dashboard/components/ProjectHealth";
import KraProgress from "layouts/dashboard/components/KraProgress";
import RecentProjects from "layouts/dashboard/components/RecentProjects";

const PREFS_KEY = "dashboard-prefs";

function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY)) || {};
  } catch {
    return {};
  }
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const navigate = useNavigate();
  const [{ darkMode }] = useMaterialUIController();
  const user = currentUser();

  const [live, setLive] = useState(() => loadPrefs().live ?? true);
  const [intervalMs, setIntervalMs] = useState(() => {
    const saved = loadPrefs().intervalMs;
    return INTERVALS.some((i) => i.value === saved) ? saved : 30000;
  });

  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ live, intervalMs }));
    } catch {
      // storage blocked: prefs just won't persist
    }
  }, [live, intervalMs]);

  const { data, errors, loading, refreshing, lastUpdated, refresh } = useDashboardData({ live, intervalMs });
  const { employees, departments, projects, kras, kpas } = data;

  const failed = Object.keys(errors);
  const allFailed = failed.length === 5;

  const activeProjects = projects.list.filter((p) => p.active !== false).length;
  const activeDepts = departments.list.filter((d) => d.active !== false).length;
  const kraAtRisk = kras.list.map(normalizeKra).filter((k) => k.active && k.progress < 40).length;
  const overdue = projects.list.filter((p) => p.active !== false && toDate(p.endDate) && toDate(p.endDate) < new Date()).length;

  const highlights = loading
    ? []
    : [
        { label: `${activeProjects} active projects`, icon: "rocket_launch", color: "#93c5fd" },
        kraAtRisk > 0
          ? { label: `${kraAtRisk} KRA${kraAtRisk === 1 ? "" : "s"} at risk`, icon: "trending_down", color: "#fda4af" }
          : { label: "All KRAs on track", icon: "task_alt", color: "#6ee7b7" },
        overdue > 0
          ? { label: `${overdue} project${overdue === 1 ? "" : "s"} overdue`, icon: "schedule", color: "#fcd34d" }
          : { label: "No overdue projects", icon: "event_available", color: "#6ee7b7" },
      ];

  // Ratios for the KPI rings.
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const kraList = kras.list.map(normalizeKra).filter((k) => k.active);
  const kraAvg = kraList.length ? Math.round(kraList.reduce((s, k) => s + k.progress, 0) / kraList.length) : 0;
  const assigned = employees.list.filter((e) => e.department?.departmentName || e.departmentName).length;
  const coveredKras = new Set(
    kpas.list.map((k) => k.projectKra?.id ?? k.projectKraId ?? k.kra?.id ?? k.projectKRA?.id).filter((id) => id !== undefined)
  ).size;

  const cards = [
    { key: "employees", title: "Employees", value: employees.total, icon: "badge", motion: "users", hue: "blue", footer: "Active headcount", route: "/employee", ring: { value: pct(assigned, employees.list.length), label: "Assigned to a department" } },
    { key: "departments", title: "Departments", value: departments.total, icon: "apartment", motion: "blocks", hue: "violet", footer: `${activeDepts} active`, route: "/department", ring: { value: pct(activeDepts, departments.list.length), label: "Active departments" } },
    { key: "projects", title: "Projects", value: projects.total, icon: "folder", motion: "folder-kanban", hue: "teal", footer: `${activeProjects} active`, route: "/projects", ring: { value: pct(activeProjects, projects.list.length), label: "Active projects" } },
    { key: "kras", title: "KRAs", value: kras.total, icon: "flag", motion: "gauge", hue: "rose", footer: "Key result areas", route: "/kra", ring: { value: kraAvg, label: "Average KRA progress" } },
    { key: "kpas", title: "KPAs", value: kpas.total, icon: "checklist", motion: "clipboard-check", hue: "amber", footer: "Key performance areas", route: "/tables", ring: { value: pct(coveredKras, kraList.length), label: "KRAs that have KPAs" } },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <WelcomeBanner
        date={new Date().toLocaleDateString([], { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        title={`${greeting()}, ${user.firstName}`}
        highlights={highlights}
      >
        <LiveControls
          onColor
          live={live}
          onLiveChange={setLive}
          intervalMs={intervalMs}
          onIntervalChange={setIntervalMs}
          refreshing={refreshing}
          onRefresh={refresh}
          lastUpdated={lastUpdated}
        />
      </WelcomeBanner>

      <Collapse in={!loading && failed.length > 0}>
        <Alert
          severity={allFailed ? "error" : "warning"}
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={refresh} disabled={refreshing}>
              Retry
            </Button>
          }
        >
          {allFailed
            ? "Couldn't reach the server. Check that the API is running and you are signed in."
            : `Some data couldn't be refreshed (${failed.join(", ")}). Showing the last values we have.`}
        </Alert>
      </Collapse>

      <Box display="grid" gap={2} sx={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        {cards.map((c, i) => (
          <StatCard
            key={c.key}
            title={c.title}
            value={c.value}
            icon={c.icon}
            motion={c.motion}
            ring={c.ring}
            hue={c.hue}
            footer={c.footer}
            loading={loading}
            error={errors[c.key] || null}
            delay={i * 0.04}
            onClick={canAccess(c.route.slice(1)) ? () => navigate(c.route) : null}
          />
        ))}
      </Box>

      <Grid container spacing={2} mt={0}>
        <Grid item xs={12} lg={8}>
          <InsightsChart
            employees={employees.list}
            employeeTotal={employees.total}
            projects={projects.list}
            loading={loading}
            darkMode={darkMode}
            delay={0.2}
          />
        </Grid>
        <Grid item xs={12} lg={4}>
          <KraStatus kras={kras.list} loading={loading} darkMode={darkMode} delay={0.24} />
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Leaderboard kras={kras.list} loading={loading} delay={0.28} />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Deadlines projects={projects.list} kras={kras.list} loading={loading} delay={0.3} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <QuickActions delay={0.32} />
        </Grid>

        <Grid item xs={12} lg={4}>
          <ProjectHealth projects={projects.list} departments={departments.list} loading={loading} delay={0.34} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <KraProgress kras={kras.list} loading={loading} delay={0.36} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <RecentProjects projects={projects.list} loading={loading} delay={0.38} />
        </Grid>
      </Grid>

      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
